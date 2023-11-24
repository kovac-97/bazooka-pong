class SpinnerWeapon extends Weapon {

    static weaponName = "Plasmaball";

    constructor(location = new Vector2D(), rotation = 0) {
        super(location, rotation, './assets/blue-bullet.png');
        this.maxSpin = 0.6;
        this.spin = 0;
        this.speed = new Vector2D(0, 0);
        this.maxSpeed = 50;

        this.weaponName = "Plasmaball";
    }

    tick(deltaTime, playerLocation) {
        super.tick(deltaTime, playerLocation);
        this.speed.rotate(this.spin * deltaTime);
        this.rotation = Math.atan2(this.speed.y, this.speed.x);
    }

    handleWallCollision() {
        if (super.handleWallCollision()) {
            this.spin *= -1;
        };
    }

    rebound(line) {
        super.rebound(line);
        this.spin *= -1;
    }

    fire(startLocation, startRotation, additionalSpeed) {
        if (this.chambered) {
            super.fire(startLocation, startRotation, additionalSpeed);
            this.generateNewSpin();
        }
        else {
            this.spin *= -1;
        }

    }

    generateNewSpin(){
        var factor = this.rotation < 0 ? -Math.PI/2 : Math.PI/2;
        this.spin = this.maxSpin * (this.rotation - factor) / Math.PI;
    }
}