function factorial(n) {
    if (n == 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

function randomGen(numOfLocations) {

    let array = [...Array(numOfLocations).keys()]

    const randomBytes = new Uint8Array(numOfLocations);
    crypto.getRandomValues(randomBytes);


    for (let i = array.length - 1; i > 0; i--) {
        // Usa 1 byte aleatório e limita ele entre 0..i
        const j = randomBytes[i] % (i + 1);
        [array[i], array[j]] = [array[j], array[i]];
    }


    return array;



}