class PlayerController {

    control(player) {
        this.clickFunction = function (event) {
            player.destination = event.clientX - (window.innerWidth / 2);
            if ((window.innerHeight / 2) - event.clientY > player.location.y) {
                //if clicked above a player
                player.weapon.fire();
            }
        };
        document.addEventListener('click', this.clickFunction);
    }



    stop() {
        document.removeEventListener('click', this.clickFunction);
    }
}