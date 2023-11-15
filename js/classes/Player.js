class Player extends Actor {

    static hitboxSize = 18;
    constructor(location = new Vector2D(), element, rotation, weapon, controller) {
        super(location, element, rotation);

        this.acceleration = 0;
        this.speed = 0;
        this.destination = 0;
        this.remainingDistance = 0; //we do not initialize anything in the loops
   
        this.weapon = weapon;
        weapon.player = this;

        controller.control(this);
    }



    tick(deltaTime) {
        //function that ticks in a game loop

        this.moveTo(this.destination, deltaTime);
        this.handleCollison();
    }


    moveTo(destination, deltaTime) {


        //in order to smooth the speed, we make the acceleration 0 if
        //the player is close to the desination
        //player ALWAYS deaccelerates because the speed is multiplied by a factor
        //lesser than 1.0 every tick
        this.remainingDistance = Math.abs(this.location.x - destination);
        if (this.remainingDistance < 2) {
            this.acceleration = 0;
        } else if (destination > this.location.x) {
            this.acceleration = 10;
        } else if (destination < this.location.x) {
            this.acceleration = -10;
        } else {
            this.acceleration = 0;
        }
        //will use the integral method for smoothing
        //sppedN + A*dT is the new speed
        //speed=speedN + A*dT is the classical non-smoothed approach
        //speed=0.98oldSpeed + 0.02calculatedSpeed is the smoothed one
        this.speed += this.acceleration * deltaTime;
        //rotation is also the direction of an aim
        //the faster the player moves, the more is the aim swayed do the side

        if (this.rotation >= 0) {
            this.rotation = Math.atan2(50, this.speed);
        } else {
            this.rotation = -Math.atan2(50, this.speed);
        }

        if (this.remainingDistance < 5) {
            //if distance to destination is less than 5, then we drasticly reduce the
            //player's speed
            this.speed -= (1.4 * this.speed * deltaTime);
        } else if (this.remainingDistance < 10 || this.shouldChangeDirection(this.speed, this.location.x, destination)) {
            this.speed -= (0.7 * this.speed * deltaTime);
        }

        this.speed -= (0.1 * this.speed * deltaTime);
        this.location.x += this.speed * deltaTime;
    }

    shouldChangeDirection(speed, location, destination) {
        if (destination > location && speed > 0) {
            //destination is right of the location
            //the player is moving towards it
            return false;
        } else if (destination < location && speed < 0) {
            //destination is left of the location
            //the player is moving towards it
            return false;
        } else {
            return true;
        }
    }

    handleCollison() {
        if (this.location.x > Globals.PLAYGROUND_X / 2) {
            this.speed = -this.speed; //change direction of travel
            this.location.x -= (2 * this.location.x) - Globals.PLAYGROUND_X; // set location to the mirror image of the overshoot
            this.destination = Globals.PLAYGROUND_X / 2; //set new destination to prevent flicker
        } else if (this.location.x < -Globals.PLAYGROUND_X / 2) {
            this.speed = -this.speed;
            this.location.x -= (2 * this.location.x) + Globals.PLAYGROUND_X;
            this.destination = - Globals.PLAYGROUND_X / 2;
        }
    }

    setDestination(destination){
        //There is no need to use this function within this class.
        //This is a public function that just abstracts the inner variable this.destination.
        this.destination = destination;
    }






}