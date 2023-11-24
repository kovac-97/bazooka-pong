window.onload = function () {



    const playerElement = document.getElementById('player');
    const enemyElement = document.getElementById('enemy');
    const weapons = [Weapon, SpinnerWeapon];

    ; (async function () {

        await UI.fetchUIResources();
        const game = new GameInstance(setup, gameloop, weapons);
        UI.showMainMenu();

        function setup(options) {
            //Setup is called before calling the gameloop.
            //We return all data needed for main() to work;

            //options are currently {playerWeapon: X, enemyWeapon: X, multithreading: T/F}
            //null weapons mean random:

            let playerWeapon;
            if (options.playerWeapon) {
                playerWeapon = new options.playerWeapon(new Vector2D(0, -Globals.PLAYGROUND_Y / 2), Math.PI / 2);
            } else {
                let random = Math.floor(Math.random() * weapons.length);
                playerWeapon = new weapons[random]
            }

            let enemyWeapon;
            if (options.enemyWeapon) {
                enemyWeapon = new options.enemyWeapon(new Vector2D(0, -Globals.PLAYGROUND_Y / 2), Math.PI / 2);
            } else {
                let random = Math.floor(Math.random() * weapons.length);
                enemyWeapon = new weapons[random]
            }

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

            var [boxes, boxMap] = BoxManager.GenerateObjects();
            if (options.multithreading) {
                ParallelizeUtility.prepareObjectForCloning(boxes);
                var parallelBoxCollision = new ParallelizeUtility(
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
            }

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
            playerWeapon.tick(deltaTime, player.location);

            enemy.tick(deltaTime);
            enemyWeapon.tick(deltaTime, enemy.location);

            //Run collision detection for player's projectile in parallel.
            //There might no be performance benefits when using multithreading in this case. It may even cause degraded performance.

            //This is a demonstration of how it is possible to distribute heavy workload across multiple cores.
            if (parallelBoxCollision) { //the object would be undefined if multithreading is turned off
                tasks = parallelBoxCollision.runTasks({ location: playerWeapon.location });
                await tasks;
            }

            for (var box of boxes) {
                if (box.isHit(enemyWeapon))
                    enemyWeapon.collisionEvent(box);

                if (!parallelBoxCollision && box.isHit(playerWeapon))
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
                render();
                document.dispatchEvent(new CustomEvent('gameOverEvent', {
                    detail: { win: false }
                }));
            } else if ((
                !enemyWeapon.zeroDamage &&
                Vector2D.distanceBetween(enemyWeapon.location, enemy.location) < Player.hitboxSize)
                ||
                Vector2D.distanceBetween(playerWeapon.location, enemy.location) < Player.hitboxSize
            ) {
                render();
                document.dispatchEvent(new CustomEvent('gameOverEvent', {
                    detail: { win: true }
                }));
            }




        }
    })();


};


