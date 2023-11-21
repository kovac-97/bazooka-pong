window.onload = function () {



    const playerElement = document.getElementById('player');
    const enemyElement = document.getElementById('enemy');
    const weapons = [SpinnerWeapon, Weapon];

    ; (async function () {

        const game = await GameInstance.create(setup, gameloop);
        game.showMainMenu();

        function setup() {
            //Setup is called before calling the gameloop.
            //We return all data needed for main() to work;
            let random = Math.floor(Math.random() * weapons.length);

            let playerWeapon = new weapons[random](new Vector2D(0, -Globals.PLAYGROUND_Y / 2), Math.PI / 2);
            random = Math.floor(Math.random() * weapons.length);
            let enemyWeapon = new weapons[random](new Vector2D(0, Globals.PLAYGROUND_Y / 2), -Math.PI / 2);


            let player = new Player(
                new Vector2D(0, -0.4 * Globals.PLAYGROUND_Y),
                new Vector2D(0, -13),
                playerElement,
                Math.PI / 2,
                playerWeapon,
                new PlayerController()
            );
            let enemy = new Player(
                new Vector2D(0, 0.4 * Globals.PLAYGROUND_Y),
                new Vector2D(0, 13),
                enemyElement,
                -Math.PI / 2,
                enemyWeapon,
                new AIController()
            );

            let [boxes, boxMap] = BoxManager.GenerateObjects();

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

            return {
                'player': player,
                'enemy': enemy,
                'playerWeapon': playerWeapon,
                'enemyWeapon': enemyWeapon,
                'boxes': boxes,
                'boxMap': boxMap,
                'parallelBoxCollision': parallelBoxCollision
            };
        }

        var last_tFrame = 0;
        var deltaTime;
        let tasks;
        async function gameloop(tFrame = 0) {

            game.frameToken = window.requestAnimationFrame(gameloop);


            deltaTime = (tFrame - last_tFrame) / 100; //conversion to miliseconds

            player.tick(deltaTime);
            playerWeapon.tick(deltaTime);

            enemy.tick(deltaTime);
            enemyWeapon.tick(deltaTime);

            //Run collision detection for player's projectile in parallel.
            //In this case performance actually degrades with the use of multithreading.
            //This is a demonstration of how it is possible to distribute heavy workload across multiple cores.
            //tasks = parallelBoxCollision.runTasks({ location: playerWeapon.location });
            //await tasks;

            for (var box of boxes) {
                if (box.isHit(enemyWeapon)) 
                    enemyWeapon.collisionEvent(box);
                if(box.isHit(playerWeapon))
                    playerWeapon.collisionEvent(box);
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


