
class GameInstance {

    static options = {
        playerWeapon: null,
        enemyWeapon: null,
        multithreading: false
    };

    constructor(setupFunction, gameLoopFunction, weapons) {
        this.setupFunction = setupFunction;
        this.gameLoopFunction = gameLoopFunction;
        this.weapons = [null].concat(weapons);

        this.playground = document.getElementById('playground');
        this.frameToken = null;
        this.gameStarted = false;
        this.controllers = [];

        document.addEventListener('gameOverEvent', (event) => {
            this.endGame(event.detail.win);
        });

        document.addEventListener('startGameEvent', () => {
            this.cleanUp();
            this.startGame();
            UI.clearUI();
        });

        document.addEventListener('changePlayerWeapon', () => {
            this.changePlayerWeapon();
            UI.updateOptions(GameInstance.options);
        });

        document.addEventListener('changeEnemyWeapon', () => {
            this.changeEnemyWeapon();
            UI.updateOptions(GameInstance.options);
        });

        document.addEventListener('changeMultithreadingMode', () => {
            GameInstance.options.multithreading = ! GameInstance.options.multithreading;
            UI.updateOptions(GameInstance.options);
        });
    }

    changePlayerWeapon() {
        this.changeWeapon('playerWeapon');
    }

    changeEnemyWeapon() {
        this.changeWeapon('enemyWeapon');
    }

    changeWeapon(whoseWeapon) {
        //Do not use this function directly
        var currentWeapon = GameInstance.options[whoseWeapon];
        var index = this.weapons.indexOf(currentWeapon);
        var len = this.weapons.length;
        GameInstance.options[whoseWeapon] = this.weapons[(index + 1) % len];
    }

    startGame() {

        this.gameStarted = true;
        //To avoid passing way to many arguments into the main
        //we will assign them to global scope.
        //This does create global scope pollution, but makes it more convenient
        //to work on setup and gameloop functions.
        let params = this.setupFunction(GameInstance.options);
        for (var key of Object.keys(params)) {
            window[key] = params[key];
        }

        this.players = [params.player, params.enemy];
        for (var player of this.players) {
            player.control(); //enable player controllers
        }

        this.gameLoopFunction();
    }

    cleanUp() {
        if (!this.gameStarted)
            return;

        for (var player of this.players) {
            player.controller.stop();
            player.resetPosition();
        }

        //delete Boxes:
        var boxElements = document.querySelectorAll('.box');
        for (var box of boxElements)
            box.remove();

        var oldWeapons = document.querySelectorAll('.bullet');
        for (var weapon of oldWeapons)
            weapon.remove();
    }

    endGame(win) {
        this.stopMain();
        UI.showEndGame(win);
    }

    stopMain() {
        window.cancelAnimationFrame(this.frameToken);
    }

}