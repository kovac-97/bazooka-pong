
class GameInstance {
    constructor(setupFunction, gameLoopFunction, UI) {
        this.setupFunction = setupFunction;
        this.gameLoopFunction = gameLoopFunction;
        this.UI = UI;
        this.playground = document.getElementById('playground');
        this.frameToken = null;
        this.controllers = [];
        document.addEventListener('gameOverEvent', (event) => {
            this.endGame(event.detail.win);
        });
    }

    static async create(setupFunction, gameLoopFunction) {
        var UI = await GameInstance.fetchUIResources();
        return new GameInstance(setupFunction, gameLoopFunction, UI);
    }

    static fetchUIResources() {

        var keys = [
            'endGame.html',
            'mainMenu.html',
            'modal.html'
        ];
        var promises = [];

        for (var key of keys) {
            promises.push(fetch(`./UI/${key}`).then(response => response.text()));
        }


        return Promise.all(promises).then((results => {
            var UI = {};
            for (var resultIndex in results) {
                UI[keys[resultIndex]] = results[resultIndex];
            }
            return UI;
        }));

    }



    startGame() {

        //To avoid passing way to many arguments into the main
        //we will assign them to global scope.
        //This does create global scope pollution, but makes it more convenient
        //to work on setup and gameloop functions.
        let params = this.setupFunction();
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

    stopMain() {
        window.cancelAnimationFrame(this.frameToken);
    }

    showMainMenu() {
        var ui = this.createUIElement('mainMenu.html');
        document.getElementById('waitScreen').remove();
        ui.querySelector('button').onclick = () => {
            ui.remove();
            setTimeout(() => { this.startGame(); }, 10);
        }
    }

    endGame(win) {
        this.showModal(win);
        this.stopMain();
    }

    showEndGame() {
        var ui = this.createUIElement('endGame.html');
        ui.querySelector('button').onclick = () => {
            ui.remove();
            setTimeout(() => { this.startGame(); }, 10);
        }
    }

    showModal(win) {
        var ui = this.createUIElement('modal.html');
        if (win)
            ui.querySelector('p').innerText = "Bot probably killed himself. No congrats for you.";

        ui.querySelector('button').onclick = () => {
            this.showEndGame();
            this.cleanUp();
            ui.remove();
        }
    }

    createUIElement(key) {
        var dummyDiv = document.createElement('div');
        dummyDiv.id = `dummyDiv${key}`;
        dummyDiv.innerHTML = this.UI[key];
        document.body.appendChild(dummyDiv);

        return dummyDiv;
    }



}