class Location {
    constructor(x, y, z) {
        this.position = new THREE.Vector3(x, y, z);
    }
    distanceOf(location) {
        return this.position.distanceTo(location.position);
    }
}