class Line {

    /*
        A line equation between two points on a box is given by :
           y-y0   y1-y0
           ---- = -----
           x-x0   x1-x0

        which translates to :
        (y-y0)(x1-x0)=(x-x0)(y1-y0)

        This form is easier to deal with computationaly as there are no division by zero cases.
  
    Given the line:
        (y-y0)(x1-x0)=(x-x0)(y1-y0)
    We will precalculate (x1-x0)=dX and (y1-y0)=dY and store it in a vector. 

    In order to calculate a distance of a point P from the line we use

               |A*Px + B*Py + C|                where A = -(y1 - y0)
                                                      B =  (x1 - x0)
    distance = -----------------                      C =  x0y1 - y0x1
                 _______________
               \/ A^2   +   B^2

    This distance will be used to find the closest line when dealing with collision detection.

    */

    constructor(A /*Point 1*/, B /*Point 0*/) {
        this.P1 = JSON.parse(JSON.stringify(A));
        this.P0 = JSON.parse(JSON.stringify(B));
        this.vector = Vector2D.normalize(Vector2D.subtract(this.P1, this.P0));

        this.A = -this.vector.y;
        this.B = this.vector.x;
        //because vector is normalized C has to be changed by adding the unit vector to P0
        this.C =
            (this.P0.x * (this.P0.y + this.vector.y)) -
            (this.P0.y * (this.P0.x + this.vector.x));
        this.angle = Math.atan2(this.vector.y, this.vector.x);


        //These are for solving for a point of intersection
        //We take it that two lines DO intersect, which can be checked with intersectsWith(line)
        if (this.vector.x != 0) {
            this.k = this.vector.y / this.vector.x;
            this.n = this.P0.y - (this.P0.x * this.k);
        } else {
            this.k = Infinity;
            this.n = 0;
        }


        this.complexSqr = Complex.multiply(
            new Complex(this.vector.x, this.vector.y),
            new Complex(this.vector.x, this.vector.y)
        );
        this.complexSqr.normalize(); //Get rid of errors



    }

    distanceFromPoint(p) {
        return Math.abs((this.A * p.x) + (this.B * p.y) + this.C);
    }


    isPointBelow(p) {
        //checks whether a point(location) is above or below a given line
        //however, order of the points matters
        //when lines are drawn following the points in a counter clockwise manner
        //this formula gives us a valid solution
        //using y = kx -kx0 + y0 gives us always the solution if the point is above or not
        //but using this solution requires us to take care of the divison by zero condition

        //(y-y0)(x1-x0)=(x-x0)(y1-y0) is more applicable to our problem as we draw lines in the said manner,
        //so an 'above' check effectively becomes a 'below' check for the top lines of a box
        //and vice versa for the bottom lines.
        //for a better understanding try graphing both of these inequalities on Desmos
        return ((p.y - this.P0.y) * this.vector.x < (p.x - this.P0.x) * this.vector.y);
    }

    intersectionPoint(line) {
        /*
        By solving the system of equations:
            y=k0*x + n0
            y=k1*x + n1
        We get
                n1 - n0
            x= ---------
                k0 - k1

        (x0,y0) is a point of the argument
        */

        //to get the answer whether two lines intersect, we can use intersectsWith(line)
        //For that reason, we are not considering the scenario where two lines do not intersect.
        
        if(this.k == line.k && this.n == line.n){
            //Any point is a valid point, so we return the point of the calling line.
            return new Vector2D(this.P0.x, this.P0.y);
        }
        
        let X = (this.n - line.n) / (line.k - this.k);
        let Y = (this.k * X) + this.n;


        if (!isFinite(Y)) {
            //While mathematically not correct, for our application this is good enough.
            return new Vector2D(this.P0.x, this.P0.y);
        }

        return new Vector2D(X, Y);

    }

    intersectsWith(line) {
        //we do not use == 0 because of calculation errors
        //formula is based on the determinant of two equations given by the lines
        if (Math.abs((this.A * line.B) - (this.B * line.A)) < 0.01) {
            return true;
        } else {
            return Math.abs(this.C - line.C) < 0.01;
        }
    }


}