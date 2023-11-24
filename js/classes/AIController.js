class AIController {
    //Better than Skynet. This AI will wreck you more often than you think it will.
    //It will ocassionally wreck itself too.

    //Picks a random destination to go to and randomly shoots.
    //If it works do not fix it.
    control(player) {
        this.moveInterval = setInterval(function () {
            player.setDestination((Math.random() * window.innerWidth) - (window.innerWidth / 2));
        }, 500);
        this.startShooting(3000, player);

    }

    startShooting(shootTimeout, player, maxPeriod = 3000) {
        this.shootTimeoutHandle = setTimeout(() => {
            player.fireWeapon();
            shootTimeout = Math.random() * maxPeriod;
            this.startShooting(shootTimeout, player);
        }, shootTimeout);
    }

    stop() {
        clearInterval(this.moveInterval);
        clearTimeout(this.shootTimeoutHandle);
    }

}