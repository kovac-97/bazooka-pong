class PlayerController {

    control(player){
        window.addEventListener('click', function (event) {
            player.destination = event.clientX - (window.innerWidth / 2);
            if ((window.innerHeight / 2) - event.clientY > player.location.y) {
                //if clicked above a player
                player.weapon.fire();
            }
        });
    }

}