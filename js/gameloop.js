window.onload = function () {


    let game = new GameInstance();
    const playerElement = document.getElementById('player');
    const enemyElement = document.getElementById('enemy');

    const weapons = [SpinnerWeapon, Weapon];
    let random = Math.floor(Math.random() * weapons.length);

    let playerWeapon = new weapons[random](new Vector2D(0, -Globals.PLAYGROUND_Y / 2), Math.PI / 2);
    random = Math.floor(Math.random() * weapons.length);
    let enemyWeapon = new weapons[random](new Vector2D(0, Globals.PLAYGROUND_Y / 2), -Math.PI / 2);


    let player = new Player(new Vector2D(0, -Globals.PLAYGROUND_Y / 3), playerElement, Math.PI / 2, playerWeapon, new PlayerController());
    let enemy = new Player(new Vector2D(0, Globals.PLAYGROUND_Y / 3), enemyElement, -Math.PI / 2, enemyWeapon, new AIController());


    const boxes = BoxManager.GenerateBoxes();
    const boxMap = Object.fromEntries( //Maps boxId to boxes array index
        boxes.map((box, index) => {
            box.enable();
            return [box.id, index];
        })
    );


    ParallelizeUtility.prepareObjectForCloning(boxes);

    let parallelBoxCollision = new ParallelizeUtility(
        boxes, //Static data to be copied into WebWorker's memory space.
        (box, weapon) => { //Callback function from each WebWorker when it finishes its work.
            if (box.isHit(weapon)) {
                return box.id;
            } else {
                return false;
            };
        },
        (boxId) => {//Callback function executed in the primary memory space. Argument is passed from the WebWorker function.
            if (boxId) {
                playerWeapon.collisionEvent(boxes[boxMap[boxId]]);
            }
        }
    );


    ; (function () {
        //<GLOBALS>
        //Globals hold things like mouse click, mouse position, view width/height etc.
        window.onmousedown = function (event) {
            //event.clientX is the mouse X
            //LocationConvertor returns a Vector, so to avoid object creation might as well just apply the formula.
            Globals.MOUSE_X_CLICKED = event.clientX - (window.innerWidth / 2);
        };
        //</GLOBALS>

        var last_tFrame = 0;
        var deltaTime;
        var gameResult = null;
        let tasks;

        main(); // Starts the animation and the game.

        async function main(tFrame = 0) {

            game.frameToken = window.requestAnimationFrame(main);


            deltaTime = (tFrame - last_tFrame) / 100; //conversion to miliseconds

            player.tick(deltaTime);
            playerWeapon.tick(deltaTime);

            enemy.tick(deltaTime);
            enemyWeapon.tick(deltaTime);


            //Run collision detection for player's projectile in parallel.
            //While in this case there may be no performance benefits at all,
            //it is a demonstration of how it is possible to distribute heavy workload across multiple cores.
            tasks = parallelBoxCollision.runTasks({ location: playerWeapon.location });
            await tasks;

            for (var box of boxes) {
                //Just for the purpose of showing how this may be done iteratively.
                if (box.isHit(enemyWeapon)) {
                    enemyWeapon.collisionEvent(box);
                }
            }
            handlePlayerCollisions();


            playerWeapon.afterTick(deltaTime);
            enemyWeapon.afterTick(deltaTime);
            render();
            last_tFrame = tFrame;


        }

        function render() {
            player.render();
            playerWeapon.render();
            enemy.render();
            enemyWeapon.render();
        }

        function handlePlayerCollisions() {

            if ((
                !playerWeapon.zeroDamage &&
                Vector2D.distanceBetween(playerWeapon.location, player.location) < Player.hitboxSize)
                ||
                Vector2D.distanceBetween(enemyWeapon.location, player.location) < Player.hitboxSize
            ) {
                document.dispatchEvent(new CustomEvent('gameOverEvent', {
                    detail: { win: false }
                }));
            } else if ((
                !enemyWeapon.zeroDamage &&
                Vector2D.distanceBetween(enemyWeapon.location, enemy.location) < Player.hitboxSize)
                ||
                Vector2D.distanceBetween(playerWeapon.location, enemy.location) < Player.hitboxSize
            ) {
                document.dispatchEvent(new CustomEvent('gameOverEvent', {
                    detail: { win: true }
                }));
            }




        }
    })();


};


