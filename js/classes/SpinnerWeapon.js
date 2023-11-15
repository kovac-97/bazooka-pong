class SpinnerWeapon extends Weapon {

    constructor(location = new Vector2D(), rotation = 0) {
        super(location, rotation, './assets/blue-bullet.png');
        this.maxSpin = 0.4;
        this.spin = 0;

    }

    tick(deltaTime) {
        super.tick(deltaTime);
        console.log(this.speed.magnitude());
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

    fire() {
        super.fire();
        //While originally a bug, I am leaving this here on purpose. Player may influence the rotation of the spinner bullet even after firing.
        this.spin = this.maxSpin * (this.rotation - (Math.PI / 2)) / Math.PI;
    }
}