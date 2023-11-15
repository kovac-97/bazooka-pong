class Complex {
    //complex numbers can be used to describe rotations in 2D space
    //this method is faster than using vectors
    constructor(re, im) {
        this.x = re;
        this.y = im;
    }

    static multiply(Z1, Z2) {
        return new Complex((Z1.x*Z2.x) - (Z1.y*Z2.y), (Z1.x*Z2.y) + (Z1.y*Z2.x));
    }

    magnitude(){
        return Math.sqrt((this.x*this.x) + (this.y*this.y));
    }

    normalize(){
        let mag=this.magnitude();
        this.x/=mag;
        this.y/=mag;
    }

    conjugate(){
        this.y=-this.y;
    }

}