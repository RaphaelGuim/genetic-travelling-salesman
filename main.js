const markerTexture = new THREE.TextureLoader().load("marker2.png");
const backgroundTexture = new THREE.TextureLoader().load("city.png");

const locationRadius = 25;
let numOfLocations = 30;
const generationSize = 10000;
const bestPercent = 1;

let generationNumber = 0;

let bestSpecies = [];
let generation = [];
let locations = [];
let generationBest = null;
let scores = [];

let radiation = 0.80;
let medium = Infinity;
let bestGenarationNum = 0;

let bestSPC;
const CAMERA_Z = 700

const pulseClock = new THREE.Clock();
let spriteLocation;
let locationWidth = 81
let locationHeight = 81

let markerSprites = [];

let tooltipSprite;
let lastSceneIndex = null;

let runner; // a "bolinha" que percorre a curva
let currentT = 0; // param entre 0 e 1, indica posição ao longo da curva

const palette = {
	// Cores principais
	textPrimary: "rgba(255, 255, 255, 0.95)",       // Texto principal (branco legível)
	textSecondary: "rgba(180, 200, 255, 0.8)",      // Texto explicativo ou técnico
	textHighlight: "rgba(120, 255, 180, 1)",        // Genoma / dados importantes

	// Fundos dos textos
	backgroundPrimary: "rgba(25, 30, 60, 0.75)",    // Fundo padrão elegante
	backgroundSecondary: "rgba(30, 30, 60, 0.6)",   // Fundo alternativo para variação
	backgroundGlass: "rgba(255, 255, 255, 0.08)",   // Fundo estilo vidro fosco
	backgroundHighlight: "rgba(0, 255, 180, 0.15)", // Fundo temático opcional (verde água)

	// Caminhos
	pathStart: "rgb(48, 13, 202)",    // verde água neon
	pathEnd: "rgba(0, 180, 255, 1)",      // rosa vibrante

	// Outros
	shadow: "rgba(0, 0, 0, 0.4)",                   // Sombra para texto
	outline: "rgba(0, 0, 0, 0.25)",                 // Contorno, se necessário

	runner: "rgba(255, 100, 100, 1)",       // dourado
	marker: "#4fc3f7",       // azul céu

};

const renderer = new THREE.WebGLRenderer({ antialias: true });
document.body.appendChild(renderer.domElement);
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const scenes = []
const cameras = []
const lines = []
const curves = []
const views = [
	{ left: 0, top: 0, width: 0.5, height: 0.5, title: "Problem" },
	{ left: 0.5, top: 0, width: 0.5, height: 0.5, title: "Best Solution" },
	{ left: 0, top: 0.5, width: 0.5, height: 0.5, title: "Generation Best" },
	{ left: 0.5, top: 0.5, width: 0.5, height: 0.5, title: "Data" },
];




showCityNameEventListener()


function getBestSpecies(generation, ordered = true) {
	if (!ordered) generation.sort((a, b) => a.score - b.score);
	return generation.slice(0, (generationSize * bestPercent) / 100);
}

function createNewGeneration(bestSpecies, generationSize, radiation) {
	let generation = [];
	for (let i = 0; i < generationSize; i++) {
		const gen = newGen(i, bestSpecies, radiation);
		const spc = new Specie(gen);
		generation.push(spc);
	}

	// ADD random and Best
	for (let i = 0; i < Math.round(generationSize * 0.1); i++) {
		const spc = new Specie();
		generation.push(spc);
	}

	return [new Specie(bestSPC.gen), ...generation]
}


function createScenes() {
	views.forEach((view, i) => {
		const scene = new THREE.Scene();

		scene.add(new THREE.PointLight(0xffffff, 1, 2000).position.set(0, 0, CAMERA_Z));
		let ambientLight = new THREE.AmbientLight(0x888888)
		ambientLight.lookAt(0, 0, 0)
		ambientLight.position.set(0, 0, CAMERA_Z)

		// scene.add(ambientLight);

		let xPosition = -650
		let yPosition = - 300
		let zPosition = CAMERA_Z / 2
		let tilt = 55;

		addText(view.title, xPosition, yPosition, zPosition, scene, 54, palette.textPrimary, palette.backgroundPrimary)

		yPosition += tilt
		if (i == 0) {
			addText(`The goal is to find the shortest possible route.`, xPosition, yPosition, zPosition, scene, 54, palette.textSecondary, palette.backgroundPrimary)
			yPosition += tilt;
			addText(`A traveling salesman needs to visit a list of cities`, xPosition, yPosition, zPosition, scene, 54, palette.textSecondary, palette.backgroundPrimary)

		}

		const camera = new THREE.PerspectiveCamera(90, 1, 1, 2000);
		camera.position.set(0, 0, CAMERA_Z);
		camera.lookAt(0, 0, 0);

		if (i != 3) {
			const bgGeometry = new THREE.PlaneGeometry(2000, 2000);
			const bgMaterial = new THREE.MeshBasicMaterial({
				map: backgroundTexture,
				depthWrite: false,
			});
			const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
			bgMesh.position.set(0, 0, 2)
			scene.add(bgMesh)


			const darkOverlay = new THREE.Mesh(
				new THREE.PlaneGeometry(2000, 2000),
				new THREE.MeshBasicMaterial({
					color: 0x000000,
					transparent: true,
					opacity: 0.05,
					depthWrite: false
				})
			);
			darkOverlay.position.z = -9;
			scene.add(darkOverlay);

		};

		scenes.push(scene);
		cameras.push(camera);

	});
}


function createLocations() {
	let locations = [];
	const points = createWellDistributedPoints(numOfLocations);



	const baseGeometry = new THREE.CircleGeometry(20, 32);
	baseGeometry.center();

	const base = new THREE.Mesh(
		baseGeometry,
		new THREE.MeshBasicMaterial({
			color: 'rgba(0, 200, 100, 0.8)',
			transparent: true,
			opacity: 0.5,
		})
	);


	for (let i = 0; i < numOfLocations; i++) {
		const x = points[i].x;
		const y = points[i].y;

		const material = new THREE.SpriteMaterial({
			map: markerTexture,
			color: "red",
			transparent: true,
		});

		const spriteZ = 5;
		const baseZ = spriteZ - 1;
		const sprite = new THREE.Sprite(material);
		sprite.scale.set(locationWidth, locationHeight, 0);
		sprite.position.set(x, y, spriteZ);



		scenes.forEach((s, index) => {
			if (index == 3) return
			let newSprite = sprite.clone()
			newSprite.name = `City ${i + 1}`
			markerSprites.push(newSprite)
			s.add(newSprite);

			let newBase = base.clone()
			newBase.position.set(x, y - locationHeight / 2, baseZ);
			newBase.rotation.set(0, 0, 0);
			// s.add(newBase);
		});


		locations.push(new Location(x, y, 0));
	}
	return locations
}

function drawPath(viewIndex, gen) {
	// Remove linha anterior, se existir
	if (lines[viewIndex]) {
		scenes[viewIndex].remove(lines[viewIndex]);
	}

	// Cria um array de Vector3 para cada cidade do gen
	const rawPoints = gen.map(i => {
		const pos = locations[i].position.clone();
		pos.y -= locationHeight / 2; // ajusta se quiser
		return pos;
	});

	let firstPosition = locations[gen[0]].position.clone()
	firstPosition.y -= locationHeight / 2;
	rawPoints.push(firstPosition)

	// 1) Cria a curva suave
	const curve = new THREE.CatmullRomCurve3(
		rawPoints,
		false,       // se quiser que feche, use true
		"catmullrom",// tipo de curva (catmullrom, centripetal, chordal)
		0.8          // "tensão" da curva
	);

	curves[viewIndex] = curve

	// 2) Gera vários pontos ao longo da curva
	const divisions = 200; // quantos pontos ao longo do caminho
	const points = curve.getPoints(divisions);

	// 3) Cria a geometria a partir desses pontos
	const geometry = new THREE.BufferGeometry().setFromPoints(points);

	// 4) Cria um atributo de cor para fazer o degradê
	const colors = [];
	const colorStart = new THREE.Color(palette.pathStart); // ex: "rgba(0, 255, 180, 1)"
	const colorEnd = new THREE.Color(palette.pathEnd);   // ex: "rgba(255, 0, 150, 1)"

	for (let i = 0; i < points.length; i++) {
		const t = i / (points.length - 1);
		// interpolando cor
		const color = colorStart.clone().lerp(colorEnd, t);
		colors.push(color.r, color.g, color.b);
	}

	geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

	// 5) Material com vertexColors = true
	const material = new THREE.LineBasicMaterial({
		vertexColors: true,
		transparent: true,
		opacity: 0.95,
		linewidth: 3
	});


	const line = new THREE.Line(geometry, material);


	lines[viewIndex] = line;
	scenes[viewIndex].add(line)
}


function updateRunner() {
	currentT += 0.001;
	if (currentT > 1) currentT = 0;


	const curve = curves[1]; // Ex: se a curva estiver no viewIndex=1
	if (!curve) return; // se ainda não existe, sai para não dar erro

	const positionOnCurve = curve.getPoint(currentT);
	runner.position.copy(positionOnCurve);

}

function render() {
	renderer.setSize(window.innerWidth, window.innerHeight);

	for (let i = 0; i < views.length; i++) {
		const view = views[i];
		const left = Math.floor(window.innerWidth * view.left);
		const top = Math.floor(window.innerHeight * (1 - view.top - view.height));
		const width = Math.floor(window.innerWidth * view.width);
		const height = Math.floor(window.innerHeight * view.height);

		renderer.setViewport(left, top, width, height);
		renderer.setScissor(left, top, width, height);
		renderer.setScissorTest(true);
		cameras[i].aspect = width / height;
		cameras[i].updateProjectionMatrix();
		renderer.render(scenes[i], cameras[i]);
	}

}



function updateRadiation(radiation, generationNumber, bestScore) {

	if (generationNumber % 10 != 0) return radiation

	let newRadiation = Math.round(bestScore) / medium;

	if (newRadiation < radiation) {
		radiation -= 0.001;
	} else {
		radiation += 0.001;
	}

	if (radiation > 0.9 || radiation < 0.75) {
		//Disturb all
		generation = [];
		generation.push(bestSPC);

		for (let i = 0; i < generationSize; i++) {
			const spc = new Specie();
			spc.evaluate();
			generation.push(spc);
		}

		bestSpecies = getBestSpecies(generation, false);

		radiation = 0.85;

	}

	return radiation
}
function updateSores(generationOrdered, scores) {
	//Add Best Scores
	let numOfNewScores = 5
	let limitScores = 100

	for (let i = 0; i < numOfNewScores; i++) {
		scores.push(generationOrdered[i].score);
	}

	if (scores.length > limitScores) {
		scores.shift()
		scores = scores.splice(0, limitScores)

	}

	return scores
}

function loop() {

	const elapsed = pulseClock.getElapsedTime();

	markerSprites.forEach((sprite, index) => {
		const scale = 1 + 0.1 * Math.sin((elapsed + index) * 3);
		sprite.scale.set(locationWidth * scale, locationHeight * scale, 1);
	});

	medium = Math.round(scores.reduce((sum, val) => sum + val, 0) / scores.length);
	bestSpecies = getBestSpecies(generation);

	radiation = updateRadiation(radiation, generationNumber, bestSPC.score, scores)



	generationNumber++;

	generation = createNewGeneration(bestSpecies, generationSize, radiation)

	//Evaluete generation
	generation.forEach(spc => spc.evaluate())

	//Order By Score
	generation = generation.sort((a, b) => a.score - b.score);

	scores = updateSores(generation, scores)
	//Find New Best
	if (generation[0].score < bestSPC.score) {
		bestGenarationNum = generationNumber;
		bestSPC = generation[0];
		drawPath(1, bestSPC.gen);
	}

	//Get Generation Best SPC	 
	if (generationNumber % 20 == 0) drawPath(2, generation[1].gen);

	updateRunner()
	render();
	updateDataLabels();

	setTimeout(loop, 1);
}


window.onload = () => {
	createScenes();
	init()
};
let zoomedViewIndex = null; // null = layout padrão
window.addEventListener("click", (event) => {
	for (let i = 0; i < views.length; i++) {
		const view = views[i];
		const left = window.innerWidth * view.left;
		const top = window.innerHeight * view.top;
		const width = window.innerWidth * view.width;
		const height = window.innerHeight * view.height;

		if (
			event.clientX >= left &&
			event.clientX <= left + width &&
			event.clientY >= top &&
			event.clientY <= top + height
		) {
			toggleZoom(i);
			break;
		}
	}




});

function toggleZoom(viewIndex) {
	if (zoomedViewIndex === viewIndex) {
		// Já está com zoom — volta ao layout normal
		resetViews();
		zoomedViewIndex = null;
	} else {
		// Aplica zoom
		for (let i = 0; i < views.length; i++) {
			if (i === viewIndex) {
				views[i].left = 0;
				views[i].top = 0;
				views[i].width = 1;
				views[i].height = 1;
			} else {
				views[i].width = 0;
				views[i].height = 0;
			}
		}
		zoomedViewIndex = viewIndex;
	}
}
function resetViews() {
	views[0] = { left: 0, top: 0, width: 0.5, height: 0.5, title: "Problem" };
	views[1] = { left: 0.5, top: 0, width: 0.5, height: 0.5, title: "Best Solution" };
	views[2] = { left: 0, top: 0.5, width: 0.5, height: 0.5, title: "Generation Best" };
	views[3] = { left: 0.5, top: 0.5, width: 0.5, height: 0.5, title: "Data" };
}

function init() {
	locations = createLocations();

	const runnerGeo = new THREE.SphereGeometry(25, 25, 25);
	const runnerMat = new THREE.MeshBasicMaterial({ color: palette.runner, wired: true });
	runner = new THREE.Mesh(runnerGeo, runnerMat);
	scenes[1].add(runner)

	//Create Initial Generation
	for (let i = 0; i < generationSize; i++) {
		const gen = randomGen(numOfLocations)
		const spc = new Specie(gen);
		spc.evaluate();
		generation.push(spc);
	}

	//Order by Score
	generation.sort((a, b) => a.score - b.score);
	scores.push(generation[0].score);
	bestSPC = generation[0];

	drawPath(1, bestSPC.gen);
	drawPath(2, generation[0].gen);
	loop();




}

function addText(textString, x, y, z, scene, fontSize, color, bgColor) {

	const label = createTextSprite(
		textString, color, fontSize, bgColor
	);
	label.name = "numText";
	label.position.set(x, y, z);
	scene.add(label);

}

function updateDataLabels() {
	if (generationNumber % 20 != 0 && generationNumber == 0) return;

	let scene = scenes[3];
	let xPosition = -650
	let yPosition = 300
	let zPosition = CAMERA_Z / 2

	let tilt = 50;

	//Clear
	scene.children = scene.children.filter((obj) => obj.name !== "numText");

	addText(`Possibilities: ${numOfLocations}! = ${factorial(numOfLocations)}`, xPosition, yPosition, zPosition, scene, 54, palette.textSecondary, palette.backgroundPrimary)
	yPosition -= tilt;

	addText(`Radiation: ${radiation}`, xPosition, yPosition, zPosition, scene, 54, palette.textSecondary, palette.backgroundPrimary)
	yPosition -= tilt;

	addText(`AVG: ${Math.round(medium)}`, xPosition, yPosition, zPosition, scene, 54, palette.textSecondary, palette.backgroundPrimary)
	yPosition -= tilt;


	addText(`Generation: ${generationNumber}`, xPosition, yPosition, zPosition, scene, 54, palette.textSecondary, palette.backgroundPrimary)
	yPosition -= tilt;


	addText(`Best Distance: ${bestSPC.score}`, xPosition, yPosition, zPosition, scene, 54, palette.textSecondary, palette.backgroundPrimary)
	yPosition -= tilt;

	addText(`Best Generation: ${bestGenarationNum} `, xPosition, yPosition, zPosition, scene, 54, palette.textSecondary, palette.backgroundPrimary)
	yPosition -= tilt;

	generation.slice(0, 5).forEach((specie) => {
		addText(specie.gen.map(i => i + 1).join("-"), xPosition, yPosition, zPosition, scene, 54, palette.textHighlight)
		yPosition -= tilt;

	});
}
