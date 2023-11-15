class Box {
    constructor(length, location, rotation, enabled = true) {
        this.id = Math.floor(Math.random() * 10000000);
        this.rotation = rotation;
        this.location = location;
        this.length = length;


        let element = document.createElement('img');
        element.src = './assets/box.png';
        element.className = 'box';
        element.style.height = length + 'px';
        element.style.width = length + 'px';

        this.enabled = enabled;



        document.body.appendChild(element);
        this.element = element;
        //to speedup collision detection we will precalculate all positions and
        //coefficients...
        this.halfDiagonal = length * 0.707;

        /*first the four points need to be transformed*/
        var d = length / 2;
        //this.A = [d, d];
        //this.B = [-d, d];
        //this.C = [-d, -d];
        //this.D = [d, -d];
        var sin = Math.sin(rotation);
        var cos = Math.cos(rotation);

        this.A = new Vector2D((d * cos) - (d * sin), (d * sin) + (d * cos));
        this.B = new Vector2D(-this.A.y, this.A.x);
        this.C = new Vector2D(-this.A.x, -this.A.y);
        this.D = new Vector2D(this.A.y, -this.A.x);

        //now translate these according to the location...

        this.A.x += this.location.x;
        this.A.y += this.location.y;

        this.B.x += this.location.x;
        this.B.y += this.location.y;

        this.C.x += this.location.x;
        this.C.y += this.location.y;

        this.D.x += this.location.x;
        this.D.y += this.location.y;



        //Box has its borders, which will be used for collision detection.

        this.lines = [
            new Line(this.A, this.B),
            new Line(this.B, this.C),
            new Line(this.C, this.D),
            new Line(this.D, this.A)
        ];


        this.render();

        window.addEventListener('resize', () => { this.render() });


    }

    isHit(bullet) {
        //if bullet location is within the box, we consider it a hit
        if (this.enabled == true) {
            var logicalExpr = true;

            for (var i = 0; i < 4; i++) {
                logicalExpr = logicalExpr && this.lines[i].isPointBelow(bullet.location);
            }
            return logicalExpr;

        }
    }

    closestLine(bullet) {

        // we need to check LAST location instead of the CURRENT one
        // checking the current one causes the bullet location to be evaluated when it is
        // inside the box. this causes it to find the wrong line as the closest one in case
        // the shot was fired to a corner

        let min = 9999999;
        let newMin = min;
        let chosenLine;
        for (var i = 0; i < 4; i++) {
            newMin = this.lines[i].distanceFromPoint(bullet.prevLocation);
            if (newMin < min) {
                min = newMin;
                chosenLine = i;
            }
        }

        return this.lines[chosenLine];
    }

    closeTo(box) {

        if (Vector2D.subtract(box.location, this.location).magnitude() < this.halfDiagonal + box.halfDiagonal) {
            return true;
        } else {
            return false;
        }

    }

    render() {
       
        if (!this.enabled) {
            this.element.style.display = "none";
            return;
        }
        let screenLocation = LocationConvertor.WorldToScreenCoordinates(this.location);
        this.element.style.left = screenLocation.x + 'px';
        this.element.style.top = screenLocation.y + 'px';
        this.element.style.transform = "translateX(-50%) translateY(-50%) rotate(-" + this.rotation + "rad)";
        this.element.style.display = "initial";
    }



    disable() {
        this.enabled = false;
    }

    enable() {
        this.enabled = true;
    }

    destroyElement(){
        //This needs to be called in case we are dynamically creating boxes for some purpose
        //and we choose to discard the generated box.
        this.element.remove();
    }

}