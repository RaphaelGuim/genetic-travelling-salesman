const locationRadius = 20;
let numOfLocations = 50;
const generationSize = 10000;
const bestPercent = 1

const debug = true;
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
let slider;
let button = null;
let bestSpecies = [];

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

function newGen(bests,pbList) {
  let rd = random();
  let parentIdx = pbList.findIndex((pb) => pb < rd) || 0;
  let parent = bests[parentIdx]
 
  if(!parent){
    parent =generation[0]
  }
  let gen = mutate(parent.gen.slice());
  return gen;
}

function getBest(generation, porcent) {
  if (generation.length == 0) {
    for (let i = 0; i < generationSize * porcent + 1; i++) {
      let gen = shuffle([...Array(numOfLocations).keys()]);
      let specie = new Specie(gen);
      specie.evaluate();
      generation.push(specie);
    }
  }

  let generationBests = generation
    .slice(0, ceil(generationSize * (porcent / 100)))
    .concat(bestSpecies);

  generationBests = sortByScore(generationBests);
  generationBests = clearIdentical(generationBests);
  
  let topBests = generationBests.slice(
    0,
    ceil(generationSize * (porcent / 100))
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
  let bestsSPC = getBest(generation, bestPercent);


  let totalIPB =round(bestsSPC.reduce((total,spc)=>total+spc.score,0),4)
 
  let ipbList = []
  let pbList =[]

  bestsSPC.forEach(spc=>{    
    ipbList.push(totalIPB/spc.score)
  })

  let totalPB =round(ipbList.reduce((total,ipb)=>total +ipb,0),4)
 
  ipbList.forEach(ipb=>{
    pbList.push(ipb/totalPB)
  })  
  let residual = 1
  pbList = pbList.map(pb=> {    
    residual -= pb
    return residual
  }) 
  generation = [];
  for (let i = 0; i < generationSize; i++) {
    let gen = newGen(bestsSPC,pbList);
    let specie = new Specie(gen);
    generation.push(specie);
    specie.evaluate();
  }
}
function sortByScore(species) {
  return species.sort((a, b) => a.score - b.score);
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

  button = createButton("Restart");
  button.position(150, 2);

  button.mousePressed(() => {
    generation = [];
    locations = [];
    bestSpecies = [];
    best = null;
    numOfLocations = slider.value();
    create_locations(numOfLocations);
    createNewGeneration();
    actualBest = generation[0].gen.slice();
    best = generation[0].gen.slice();
    bestScore = Infinity;
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
  locations = [];
  let width = window.innerWidth / 2;
  let height = window.innerHeight / 2;

  for (let i = 0; i < numOfLocations; i++) {
    let x = width * 0.1 + random(width * 0.80);
    let y = height * 0.1 + random(height * 0.80);
    let location = new Location(round(x), round(y))
    if(locations.find(l => l.distanceOf(location) < locationRadius)){
      i--
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

function draw() {
  background("black");

  drawViews();
  drawLocations();
  getBestScore();
  generation = sortByScore(generation);
  createNewGeneration();

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

  bestSpecies = bestSpecies.concat(
    generation.slice(0, ceil(generationSize * (bestPercent / 100)))
  );

  bestSpecies.sort((a, b) => a.score - b.score);
  bestSpecies = clearIdentical(bestSpecies);
  bestSpecies = bestSpecies.slice(0, ceil(generationSize * (bestPercent / 100)));
  
}

function getBestScore() {
  if (generation[0].score < bestScore) {
    best = generation[0].gen.slice();
    bestScore = generation[0].score;
  }
}
function drawLocations() {
  locations.forEach((location, index) => {
    push()
    
    fill("#B9BBB6")
    strokeWeight(1)
    circle(location.position.x, location.position.y, locationRadius);
    if (debug) {
      
      textSize(13);
      textAlign(CENTER);
    
      fill("black")  
       
      text(
        `${index}`,
        location.position.x,
        location.position.y+locationRadius/4     );
    }
  });
  pop()
  textAlign(LEFT);  
  text(`Num of Locations: ${slider.value()}`, 20, 40);
  strokeWeight(1)
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
  if (frameCount % 20 == 0) {
    medium = round(average(scores));
    actualBest = generation[0].gen.slice();
    actualBestScore = generation[0].score;

    radiation = round(bestScore) / medium;
    if (radiation > 0.95) {
      radiation = 0.8;
    }
    if(radiation<0.75){
      radiation = 0.90
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
  textSize(20);
  text(
    `Possibilities: ${numOfLocations}! = ${factorial(numOfLocations)}`,
    20,
    60
  );
  text(`Mutation Rate: ${round(radiation, 2)}`, 20, 80);
  text(`AVG: ${medium}`, 20, 100);
  text(`Generation ${frameCount}`, 20, 120);
  text(`Mutations ${mutations}`, 20, 140);
  pop();
}
