//Pure math object
class Vector2D {

    constructor(x = 0, y = 0) {
        //default is to save us from the undefined values
        this.x = x;
        this.y = y;
    }

    

    magnitude() {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }

    getAngle() {
        return Math.atan2(this.y, this.x);
    }

    rotate(angle) {
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);

        let x = this.x;
        this.x = (this.x * cos) - (this.y * sin);
        this.y = (x * sin) + (this.y * cos);
    }

    scale(scalar){
        this.x *= scalar;
        this.y *= scalar;
    }

    static add(V1, V2) {
        return new Vector2D(V1.x + V2.x, V1.y + V2.y);
    }

    static subtract(V1, V2) {
        //because we cannot simply negate with a -
        return new Vector2D(V1.x - V2.x, V1.y - V2.y);
    }

    static scalarProduct(V1, V2) {
        return (V1.x * V2.x) + (V1.y * V2.y);
    }

    static angleBetween(V1, V2) {
        return Math.acos(Vector2D.scalarProduct(V1, V2) / (V1.magnitude() * V2.magnitude()));
    }

    static normalize(V) {
        var magnitude = V.magnitude();

        return  magnitude == 0 ? 0 : new Vector2D(V.x / magnitude, V.y / magnitude);
    }

    static distanceBetween(V1, V2) {
        return this.subtract(V1, V2).magnitude();
    }

    static fromAngle(angle, magnitude = 1) {
        var x = magnitude * Math.cos(angle); 
        var y = magnitude * Math.sin(angle);

        return new Vector2D(x, y);
    }


}
