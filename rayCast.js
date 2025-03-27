
function showCityNameEventListener() {
    window.addEventListener("mousemove", (event) => {
        let foundSprite = null;
        let foundViewIndex = null;
        let x;
        let y;
        // Verifica cada view
        for (let i = 0; i < 3; i++) {
            const view = views[i];
            const left = Math.floor(window.innerWidth * view.left);
            const top = Math.floor(window.innerHeight * view.top);
            const width = Math.floor(window.innerWidth * view.width);
            const height = Math.floor(window.innerHeight * view.height);

            const mouseX = event.clientX;
            const mouseY = event.clientY;

            // Se mouse está fora desse quadrante, pula
            if (mouseX < left || mouseX > left + width ||
                mouseY < top || mouseY > top + height) {
                continue;
            }

            // Se mouse está dentro desse quadrante
            mouse.x = ((mouseX - left) / width) * 2 - 1;
            mouse.y = -((mouseY - top) / height) * 2 + 1;
            raycaster.setFromCamera(mouse, cameras[i]);

            const intersects = raycaster.intersectObjects(markerSprites);
            if (intersects.length > 0) {

                foundSprite = intersects[0].object;
                foundViewIndex = i;
                break; // já achamos, para aqui
            }
        }

        if (foundSprite && foundViewIndex !== null) {
            // Se a tooltip está em outra cena, remove de lá
            if (lastSceneIndex !== null && tooltipSprite.parent) {
                tooltipSprite.parent.remove(tooltipSprite);
            }
            // Agora adiciona no scene atual

            tooltipSprite = createTextSprite(foundSprite.name, "rgba(255, 255, 255, 0.95)", 45, "rgba(25, 30, 60, 0.8)");
            tooltipSprite.visible = true;

            scenes[foundViewIndex].add(tooltipSprite);

            let xPosition = 520
            let yPosition = -300
            let zPosition = CAMERA_Z / 2

            tooltipSprite.position.set(xPosition, yPosition, zPosition);

            lastSceneIndex = foundViewIndex;

        } else {
            tooltipSprite.visible = false;
        }
    });
}