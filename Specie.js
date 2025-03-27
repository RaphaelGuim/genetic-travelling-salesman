class Specie {
  constructor(gen) {
    this.gen = gen;
    this.score = null
    if (gen == null) {
      this.gen = randomGen(numOfLocations)
    }

    this.score = Infinity;
  }
  evaluate() {
    if (this.socre != null) return
    let score = 0;
    for (let i = 0; i < this.gen.length - 1; i++) {
      let a = locations[this.gen[i]];
      let b = locations[this.gen[i + 1]];
      score += a.distanceOf(b);
    }
    score += locations[this.gen[0]].distanceOf(locations[this.gen[this.gen.length - 1]]);
    this.score = Math.round(score * 10000) / 10000;
  }
}

