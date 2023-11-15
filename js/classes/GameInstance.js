
class GameInstance {
    constructor() {
        this.playground = document.getElementById('playground');
        this.frameToken = null;
        document.addEventListener('gameOverEvent', (event) => {
            this.endGame(event.detail.win);
        });
    }

    stopMain() {
        window.cancelAnimationFrame(this.frameToken);
    }


    endGame(win) {
        this.stopMain();
        if (win) {
            alert('Noiceee :)');
        } else {
            alert('You lost :(');
        }

        document.body.innerHTML = `
            Thank you for taking the time to check this project out!<br>
            Refresh the page to start all over. I was too lazy to program the UI :(.
            `;
    }

}