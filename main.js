const locationRadius = 20;
let numOfLocations = 50;
const generationSize = 1000;
const bestPercent = 10;

const debug = true;
let scores = [];
let canvas;
let views = [];
let locations = [];
let generation = [];
let best = null;
let bestScore = Infinity;

let radiation = 0.75;
let medium = Infinity;
let mutations = 0;
let slider;
let button = null;
let bestSpecies = [];
let generationBest = null;
let maxCombinations = 0
class Location {
  constructor(x, y) {
    this.position = createVector(x, y);
  }
  distanceOf(location) {
    return this.position.dist(location.position);
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

function newGen() {
  let index = round(map(random(), 0, 1, 0, bestSpecies.length - 1));

  let parent = bestSpecies[index];

  if (!parent) {
    parent = generation[0];
  }
  let gen = mutate(parent.gen.slice());
  return gen;
}

function getBest() {
  let generationBests = generation
    .slice(0, ceil(generationSize * (bestPercent / 100)))
    .concat(bestSpecies);

  generationBests.sort((a, b) => a.score - b.score);
  generationBests = clearIdentical(generationBests);

  let topBests = generationBests.slice(
    0,
    ceil(generationSize * (bestPercent / 100))
  );

  return topBests;
}

function clearIdentical(species) {
  return species.filter((s, index, species) => {
    if (index > 0) {
      for (let i = 0; i < s.gen.length; i++) {
        if (s.gen[i] != species[index - 1].gen[i]) {
          return true;
        }
      }
      return false;
    }
    return true;
  });
}
function createNewGeneration() {
  generation = [];
  for (let i = 0; i < generationSize; i++) {
    let gen = newGen();
    let spc = new Specie(gen);
    spc.evaluate();
    generation.push(spc);
  }
  generation.sort((a, b) => a.score - b.score);
}

function setup() {
  canvas = createCanvas(window.innerWidth, window.innerHeight);

  slider = createSlider(5, 50, numOfLocations, 1);
  slider.position(20, 45);
  slider.size(100);

  create_views();
  create_locations(numOfLocations);

  for (let i = 0; i < generationSize; i++) {
    let gen = shuffle([...Array(numOfLocations).keys()]);
    let specie = new Specie(gen);
    specie.evaluate();
    generation.push(specie);
  }
  generation.sort((a, b) => a.score - b.score);

  best = generation[0];
  generationBest = generation[0];
  bestSpecies = generation.slice(0, (bestPercent * generationSize) / 100);

  button = createButton("Restart");
  button.position(150, 2);

  button.mousePressed(() => {
    generation = [];
    locations = [];
    bestSpecies = [];
    numOfLocations = slider.value();
    create_locations(numOfLocations);
    createNewGeneration();

    best = generation[0];
    bestScore = Infinity;
  });

  maxCombinations = factorial(numOfLocations)
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
  locations = [];
  let width = window.innerWidth / 2;
  let height = window.innerHeight / 2;

  for (let i = 0; i < numOfLocations; i++) {
    let x = width * 0.1 + random(width * 0.8);
    let y = height * 0.1 + random(height * 0.8);
    let location = new Location(round(x), round(y));
    if (locations.find((l) => l.distanceOf(location) < locationRadius)) {
      i--;
      continue;
    }
    locations.push(location);
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
let time = 0;
function draw() {
  time += deltaTime;
  if (time > 1000) {
    generationBest = generation[0];
    time = 0;
  }
  background("black");

  drawViews();
  drawLocations();
  bestSpecies = getBest();

  createNewGeneration();

  getBestScore();

  drawBest();
  drawActualBest();
  drawData();

  //Adding Best Score to Score list
  scores.push(generation[0].score);

  //Clear Score list
  if (scores.length > 1000) {
    scores = scores.splice(1);
  }

  //Reset Mutations
  mutations = 0;
}

function getBestScore() {
  if (generation[0].score < bestScore) {
    best = generation[0];
    bestScore = generation[0].score;
  }
}
function drawLocations() {
  locations.forEach((location, index) => {
    push();

    fill("#B9BBB6");
    strokeWeight(1);
    circle(location.position.x, location.position.y, locationRadius);
    if (debug) {
      textSize(13);
      textAlign(CENTER);

      fill("black");

      text(
        `${index}`,
        location.position.x,
        location.position.y + locationRadius / 4
      );
    }
  });
  pop();
  textAlign(LEFT);
  text(`Num of Locations: ${slider.value()}`, 20, 40);
  strokeWeight(1);
}

function drawViews() {
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
  best.gen.forEach((g) => {
    vertex(locations[g].position.x, locations[g].position.y);
  });
  endShape();

  fill("white");
  locations.forEach((location, index) => {
    circle(location.position.x, location.position.y, locationRadius);
  });
  fill("black");
  text(`Score: ${round(best.score)}`, 20, 50);

  text(`${best.gen}`, 20, 35);
  pop();
}

function drawActualBest() {
  medium = round(average(scores));

  radiation = round(bestScore) / medium;
  if (radiation > 0.99) {
    radiation = 0.9;
  }
  if (radiation < 0.75) {
    radiation = 0.9;
  }

  push();
  translate(views[2][0], views[2][1]);
  noFill();
  beginShape();

  generationBest.gen.forEach((g) => {
    vertex(locations[g].position.x, locations[g].position.y);
  });

  endShape();

  fill("white");

  locations.forEach((location, index) => {
    circle(location.position.x, location.position.y, locationRadius);
  });
  fill("black");
  text(`Score: ${round(generationBest.score)}`, 20, 50);

  text(`${generationBest.gen}`, 20, 35);
  pop();
}

function drawData() {
  push();
  translate(views[3][0], views[3][1]);
  textSize(20);
  text(
    `Possibilities: ${numOfLocations}! = ${maxCombinations}`,
    20,
    60
  );
  text(`Radiation: ${int(round(1 - radiation, 2) * 100)}%`, 20, 80);
  text(`AVG: ${medium}`, 20, 100);
  text(`Generation ${frameCount}`, 20, 120);
  pop();
}
