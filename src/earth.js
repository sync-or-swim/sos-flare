import GameObject from './game-object';


export default class Earth extends GameObject {
  constructor(scene, model, radius) {
    super(scene, model);

    this.radius = radius;
  }
}
