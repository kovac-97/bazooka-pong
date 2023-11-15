//Actors are entities that exist in the game world
//They are mobile and have at least one visual asset associated with them
class Actor {
    constructor(location = new Vector2D(), element, rotation = 0, enabled = true) {

        /*
        Disabled Actors are not interacting with the game world
        and they are not being rendered.
        */
        this.enabled = enabled;
        this.element = element; //HTML element
        this.location = location;
        this.rotation = rotation;
    }

    render() {
        //change the position on screen:
        if (!this.enabled) {
            this.element.style.display = "none"; 
            return;
        }
        let screenLocation = LocationConvertor.WorldToScreenCoordinates(this.location);
        this.element.style.left = screenLocation.x + 'px';
        this.element.style.top = screenLocation.y + 'px';
        this.element.style.transform = "translateX(-50%) translateY(-50%) rotate(" + (-this.rotation) + "rad)";
        this.element.style.display = "initial";
    }

    disableActor() {
        this.enabled = false;
    }

    enableActor() {
        this.enabled = true;
    }


}