const locationRadius = 10;
let numOfLocations = 25;
const generationSize = 10000;

const debug = false;
let scores = [];
let canvas;
let views = [];
let locations = [];
let generation = [];
let best = null;
let bestScore = Infinity;
let actualBest = null;
let actualBestScore = null;
let radiation = 0.99;
let medium = Infinity;
let mutations = 0;
let reinforceBest = 0.2;
let slider;
let button = null
class Location {
  constructor(x, y) {
    this.position = createVector(x, y);
  }
  distanceOf(location) {
    return this.position.dist(location.position);
  }
}
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
    this.score = score;
  }
}

const average = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;

function factorial(n) {
  if (n == 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

function flip(gen, indexA, indexB) {
  let dna = gen[indexA];
  gen[indexA] = gen[indexB];
  gen[indexB] = dna;
  return gen;
}

function mutate(gen) {
  for (let i = 0; i < gen.length; i++) {
    if (random() > radiation) {
      mutations++;
      let indexA = round(map(random(), 0, 1, 0, gen.length - 1));
      let indexB = round(map(random(), 0, 1, 0, gen.length - 1));
      gen = flip(gen, indexA, indexB);
    }
  }

  return gen;
}

function newGen(bests) {
  let parent = bests[round(map(random(), 0, 1, 0, bests.length - 1))];
  let gen = mutate(parent.slice());
  return gen;
}

function getBest(generation, porcent) {
  if (generation.length == 0) {
    for (let i = 0; i < generationSize * porcent + 1; i++) {
      let gen = shuffle([...Array(numOfLocations).keys()]);
      let specie = new Specie(gen);
      generation.push(specie);
    }
  }
  return generation
    .slice(0, ceil(generation.length * (porcent / 100)))
    .map((g) => g.gen);
}
function createNewGeneration() {
  let bests = getBest(generation, 10);

  //Reinforce Best x %
  if (best) {
    let count = bests.length * reinforceBest;
    for (let i = 0; i < count; i++) {
      bests.push(best);
    }
  }
  //Add Random
  let count = bests.length * 0.1;
  for (let i = 0; i < count; i++) {
    bests.push(shuffle([...Array(numOfLocations).keys()]));
  }

  generation = [];
  for (let i = 0; i < generationSize; i++) {
    let gen = newGen(bests);
    let specie = new Specie(gen);
    generation.push(specie);
    specie.evaluate();
  }
}
function sortByScore() {
  generation.sort((a, b) => a.score - b.score);
}



function setup() {
  canvas = createCanvas(window.innerWidth, window.innerHeight);
  slider = createSlider(5, 50, numOfLocations, 1);
  slider.position(20, 45);
  slider.size(100);
  create_views();

  create_locations(numOfLocations);
  createNewGeneration();
  actualBest = generation[0].gen.slice();

  button = createButton('Restart');
  button.position(150, 2);

  button.mousePressed(() => {
    
      generation = []
      locations = []
      best = null
      numOfLocations = slider.value();
      create_locations(numOfLocations);
      createNewGeneration();
      actualBest = generation[0].gen.slice();
      best =  generation[0].gen.slice();
      bestScore = Infinity
  
  });

}



function create_views() {
  let width = window.innerWidth / 2;
  let height = window.innerHeight / 2;

  views.push([0, 0, width, height, "#D9DDDC", "Problem"]);
  views.push([width, 0, width, height, "#D6CFC7", "Best"]);
  views.push([0, height, width, height, "#BDB7AB", "Actual Best"]);
  views.push([width, height, width, height, "#BEBDB8", "Data"]);
}

function create_locations(numOfLocations) {
  locations = []
  let width = window.innerWidth / 2;
  let height = window.innerHeight / 2;

  for (let i = 0; i < numOfLocations; i++) {
    let x = width * 0.1 + random(width * 0.85);
    let y = height * 0.1 + random(height * 0.85);
    locations.push(new Location(round(x), round(y)));
  }
}

function evaluateAnswer(answer) {
  let totalDistance = 0;

  for (let i = 0; i < answer.length - 1; i++) {
    let indexLocation = answer[i];
    let indexNextLocation = answer[i + 1];

    totalDistance += locations[indexLocation].distanceOf(
      locations[indexNextLocation]
    );
  }
  return totalDistance;
}

function draw() {
  background("black");

 
  drawViews()
  drawLocations()
  getBestScore()
  createNewGeneration();
  sortByScore(); 
  drawBest();
  drawActualBest();
  drawData();

  //Adding Best Score to Score list
  scores.push(generation[0].score);

  //Clear Score list
  if (scores.length > 500) {
    scores = scores.splice(500);
  }

  //Reset Mutations
  mutations = 0;
}

function getBestScore(){
  if (generation[0].score < bestScore) {
    best = generation[0].gen.slice();
    bestScore = generation[0].score;
  }
}
function drawLocations(){
  locations.forEach((location, index) => {
    circle(location.position.x, location.position.y, locationRadius);
    if (debug) {
      textSize(10);
      text(
        `(${location.position.x},${location.position.y})`,
        location.position.x - 3 * locationRadius,
        location.position.y + 3 * locationRadius
      );
    }
  });

  text(`Num of Locations: ${slider.value()}`,20,40)
}

function drawViews(){
  views.forEach((view) => {
    push();
    translate(view[0], view[1]);
    fill(view[4]);
    rect(0, 0, view[2], view[3]);
    textSize(20);
    fill("black");
    text(view[5], 20, 20);
    pop();
  });
}


function drawBest() {
  push();
  translate(views[1][0], views[1][1]);
  noFill();
  beginShape();
  best.forEach((g) => {
    vertex(locations[g].position.x, locations[g].position.y);
  });
  endShape();

  fill("white");
  locations.forEach((location, index) => {
    circle(location.position.x, location.position.y, locationRadius);
  });
  fill("black");
  text(`Score: ${round(bestScore)}`, 20, 50);

  text(`${best}`, 100, 20);
  pop();
}

function drawActualBest() {
  if (frameCount % 10 == 0) {
    medium = round(average(scores));
    actualBest = generation[0].gen.slice();
    actualBestScore = generation[0].score;

    radiation = round(bestScore) / medium;
    if (radiation < 0.75 || radiation > 0.95) {
      radiation = 0.8;
    }
  }

  push();
  translate(views[2][0], views[2][1]);
  noFill();
  beginShape();

  actualBest.forEach((g) => {
    vertex(locations[g].position.x, locations[g].position.y);
  });

  endShape();

  fill("white");

  locations.forEach((location, index) => {
    circle(location.position.x, location.position.y, locationRadius);
  });
  fill("black");
  text(`Score: ${round(actualBestScore)}`, 20, 50);

  text(`${actualBest}`, 150, 20);
  pop();
}

function drawData() {
  push();
  translate(views[3][0], views[3][1]);
  textSize(20)
  text(`Possibilities: ${numOfLocations}! = ${factorial(numOfLocations)}`, 20, 60);
  text(`Mutation Rate: ${round(radiation,2)}`, 20, 80);
  text(`AVG: ${medium}`, 20, 100);
  text(`Generation ${frameCount}`, 20, 120);
  text(`Mutations ${mutations}`, 20, 140);
  pop();
}
