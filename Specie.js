 
class Specie {
  constructor(gen) {
    this.gen = gen;
  
  }
 
  evaluate() {
    let score = 0;
    for (let i = 0; i < this.gen.length - 1; i++) {
      let indexLocation = this.gen[i];
      let indexNextLocation = this.gen[i + 1];

      score += locations[indexLocation].distanceOf(
        locations[indexNextLocation]
      );
    }
    this.score = round(score,4);
  }
}

