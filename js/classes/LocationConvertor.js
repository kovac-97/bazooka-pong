class LocationConvertor {
    static halfDiagonal = new Vector2D(window.innerWidth / 2, window.innerHeight / 2);
    static WorldToScreenCoordinates(worldCoordinates, offset = new Vector2D(0, 0)) {
        //Screen coordinates start from 0 and go to the width/height of the viewport
        //World coordinates can be from -WORLD_WIDTH/HEIGHT to + WORLD_WIDTH/HEIGHT
        //Also, the Y axis is flipped
        let flipedY = new Vector2D(worldCoordinates.x - offset.x, -worldCoordinates.y + offset.y);
        return Vector2D.add(flipedY, LocationConvertor.halfDiagonal);
    }

    static ScreenToWorldCoordinates(screenCoordinates) {

        //screenCoordinates are never part of an object, so they can be modified
        return new Vector2D(screenCoordinates.x - LocationConvertor.halfDiagonal.x, LocationConvertor.halfDiagonal.y - screenCoordinates.y);
    }
}

window.onresize = function () {
    //we have to recalculate the diagonal for coordinate conversions
    LocationConvertor.halfDiagonal = new Vector2D(window.innerWidth / 2, window.innerHeight / 2);
};
