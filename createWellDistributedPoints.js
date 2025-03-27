function gaussianRandom(mean = 0, stddev = 1) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // evita log(0)
    while (v === 0) v = Math.random();
    return mean + stddev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function createWellDistributedPoints(count, width = 1350, height = 1150, minDistance = 100) {
    const points = [];

    const meanX = 0;
    const meanY = 0;
    const stdX = width / 2;
    const stdY = height / 2;

    function tooClose(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return dx * dx + dy * dy < minDistance * minDistance;
    }

    let attempts = 0;
    const maxAttempts = 100000;

    while (points.length < count && attempts < maxAttempts) {
        attempts++;

        let x = gaussianRandom(meanX, stdX);
        let y = gaussianRandom(meanY, stdY);

        x = Math.max(-width / 2, Math.min(width / 2, x));
        y = Math.max(-height / 2, Math.min(height / 2, y));

        const candidate = { x, y };

        if (!points.some(p => tooClose(p, candidate))) {
            points.push(candidate);
        }
    }


    return points;
}
