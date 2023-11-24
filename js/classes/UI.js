class UI {

    static Elements = {};
    static currentUI;
    static currentModal;

    static fetchUIResources() {

        var keys = [
            'endGame.html',
            'mainMenu.html',
            'modal.html',
            'options.html'
        ];
        var promises = [];

        for (var key of keys) {
            promises.push(fetch(`./UI/${key}`).then(response => response.text()));
        }


        return Promise.all(promises).then((results => {
            for (var resultIndex in results) {
                UI.Elements[keys[resultIndex]] = results[resultIndex];
            }

            UI.createUIElements();
        }));
    }

    static clearUI() {
        UI.currentUI.remove();
    }

    static showMainMenu() {
        UI.showElement('mainMenu.html');
        
        var waitScreen = document.getElementById('waitScreen');
        if (waitScreen)
            waitScreen.remove();
        var btns = UI.currentUI.querySelectorAll('button');
        btns[0].onclick = (event) => {
            event.stopPropagation();
            document.dispatchEvent(new Event('startGameEvent'));
        }

        btns[1].onclick = (event) => {
            event.stopPropagation();
            UI.clearUI();
            UI.showOptions();
        }
        btns[0].focus();
    }

    static showEndGame(win) {
        UI.showModal(win);
    }


    static showFinalScreen() {
        UI.showElement('endGame.html');
        var buttons = UI.currentUI.querySelectorAll('button');
        buttons[0].onclick = (event) => {
            event.stopPropagation();
            document.dispatchEvent(new Event('startGameEvent'));
            UI.clearUI();
        };

        buttons[1].onclick = (event) => {
            event.stopPropagation();
            UI.clearUI();
            UI.showOptions();
        };
        buttons[0].focus();


    }


    static showModal(win) {
        UI.showElement('modal.html');
        if (win)
            UI.currentUI.querySelector('p').innerText = "Bot probably killed himself. No congrats for you.";

        var btn = UI.currentUI.querySelector('button');
        btn.onclick = () => {
            UI.clearUI();
            UI.showFinalScreen();
        };
        btn.focus();
    }

    static showOptions() {
        UI.showElement('options.html');

        var btns = UI.currentUI.querySelectorAll('button');
        btns[0].onclick = (event) => {
            event.stopPropagation();
            document.dispatchEvent(new Event('changePlayerWeapon'));
        };

        btns[1].onclick = (event) => {
            event.stopPropagation();
            document.dispatchEvent(new Event('changeEnemyWeapon'));
        };

        btns[2].onclick = (event) => {
            event.stopPropagation();
            document.dispatchEvent(new Event('changeMultithreadingMode'));
        };

        btns[3].onclick = (event) => {
            event.stopPropagation();
            UI.currentUI.remove();
            UI.showMainMenu();
        }

    }

    static updateOptions(options){
        var buttons = UI.Elements['options.html'].querySelectorAll('editable');
        buttons[0].innerText = options.playerWeapon ? options.playerWeapon.weaponName : 'Random';
        buttons[1].innerText = options.enemyWeapon ? options.enemyWeapon.weaponName : 'Random';
        buttons[2].innerText = options.multithreading ? 'ON' : 'OFF';      
    }

    static createUIElements(){
        for(var key of Object.keys(UI.Elements)){
            var dummyDiv = document.createElement('div');
            dummyDiv.id = `dummyDiv${key}`;
            dummyDiv.innerHTML = UI.Elements[key];
            UI.Elements[key] = dummyDiv;
        }
    }

    static showElement(key){
        UI.currentUI = UI.Elements[key];
        document.body.append(UI.currentUI);
    }

}