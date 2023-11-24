class PlayerController {

    control(player) {
        this.touchFunction = function (event) {
            player.destination = event.touches[0].clientX - (window.innerWidth / 2);
            if ((window.innerHeight / 2) - event.touches[0].clientY > player.location.y){
                player.fireWeapon();
            }
        };

        this.keydownFunction = function (event) {
            switch (event.key) {
                case 'ArrowLeft':
                    player.destination = -Globals.PLAYGROUND_X;
                    break;
                case 'ArrowRight':
                    player.destination = Globals.PLAYGROUND_X;
                    break;
            }
        }


        this.keyupFunction = function (event) {
            if (event.key.includes('Arrow')) {
                player.destination = player.location.x;
            } else if (event.key == ' ') {
                player.fireWeapon();
            }
        }



        document.addEventListener('keydown', this.keydownFunction);
        document.addEventListener('keyup', this.keyupFunction);
        
        document.addEventListener('touchstart', this.touchFunction);
        document.addEventListener('touchmove', this.touchFunction);
    }



    stop() {
        document.removeEventListener('click', this.clickFunction);
        document.removeEventListener('keydown', this.keydownFunction);
        document.removeEventListener('keyup', this.keyupFunction);
    }
}