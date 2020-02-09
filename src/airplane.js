import GameObject from './game-object';


export default class Airplane extends GameObject {
  constructor(scene, model, earth) {
    super(scene, model);

    model.scale.multiplyScalar(0.1);
    this.earth = earth;
  }

  /**
   * Positions the airplane over the earth at the specified location.
   * @param {float} latitude
   * @param {float} longitude
   */
  setPosition(latitude, longitude) {
    // TODO: Make airplanes a child of earth instead. I'm not doing that right
    //       now because it makes them invisible for some reason.

    // Convert latitude and longitude to coordinates
    const latitudeRads = (Math.PI / 2) - (latitude * (Math.PI / 180.0));
    const longitudeRads = longitude * (Math.PI / 180.0);
    this.transform.position.x = Math.sin(latitudeRads) * Math.sin(longitudeRads) * this.earth.radius;
    this.transform.position.y = Math.cos(latitudeRads) * this.earth.radius;
    this.transform.position.z = Math.sin(latitudeRads) * Math.cos(longitudeRads) * this.earth.radius;

    // Rotate the airplane such that the bottom of the plane faces the ground
    this.transform.rotation.x = Math.sin(longitudeRads);
    this.transform.rotation.z = Math.sin(latitudeRads);
    this.transform.rotation.z = Math.cos(longitudeRads);
  }
}
