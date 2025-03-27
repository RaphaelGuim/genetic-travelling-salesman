function createTextSprite(message, color = "#132c6e", fontSize = 54, bgColor = "rgba(0, 0, 0, 0.5)") {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  // Definir uma fonte temporária para medir o texto
  context.font = `${fontSize}px monospace`;
  const textWidth = context.measureText(message).width;

  // Agora define o tamanho do canvas e redefine a fonte
  const padding = 50
  canvas.width = textWidth + padding;
  canvas.height = fontSize + padding;
  context.font = `${fontSize}px monospace`;



  const w = canvas.width;
  const h = canvas.height;
  const r = 12;


  context.beginPath();
  context.moveTo(r, 0);
  context.lineTo(w - r, 0);
  context.quadraticCurveTo(w, 0, w, r);
  context.lineTo(w, h - r);
  context.quadraticCurveTo(w, h, w - r, h);
  context.lineTo(r, h);
  context.quadraticCurveTo(0, h, 0, h - r);
  context.lineTo(0, r);
  context.quadraticCurveTo(0, 0, r, 0);
  context.closePath();

  context.fillStyle = bgColor;
  context.fill();

  // Estilo e escrita
  context.fillStyle = color;
  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillText(message, padding / 2, padding / 2);  // Começa a desenhar a partir de x=10

  // Cria a textura
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;

  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);

  // Escala baseada no tamanho do canvas
  sprite.scale.set(canvas.width / 2, canvas.height / 2, 1);
  sprite.center.set(0, 0.5);
  return sprite;
}
