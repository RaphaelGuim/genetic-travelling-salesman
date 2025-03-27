function newGen(index, bestSpecies, radiation) {
    const parent1 = bestSpecies[index % bestSpecies.length].gen;
    const parent2 = bestSpecies[Math.floor(Math.random() * bestSpecies.length)].gen;

    let child = orderCrossover(parent1, parent2);
    child = mutate(child, radiation);
    return child;
}


function mutate(gen, radiation) {
    for (let i = 0; i < gen.length; i++) {
        if (Math.random() > radiation) {

            let a = Math.floor(Math.random() * gen.length);
            let b = Math.floor(Math.random() * gen.length);
            [gen[a], gen[b]] = [gen[b], gen[a]];
        }
    }
    return gen;
}



function orderCrossover(parent1, parent2) {
    const size = parent1.length;
    const child = new Array(size).fill(null);

    // Sorteia um intervalo (inclusive)
    const start = Math.floor(Math.random() * size);
    const end = start + Math.floor(Math.random() * (size - start));

    // 1. Copia o segmento do parent1
    for (let i = start; i <= end; i++) {
        child[i] = parent1[i];
    }

    // 2. Preenche o resto com os genes do parent2, respeitando a ordem
    let currentIndex = (end + 1) % size;
    let parentIndex = (end + 1) % size;

    while (child.includes(null)) {
        const gene = parent2[parentIndex];
        if (!child.includes(gene)) {
            child[currentIndex] = gene;
            currentIndex = (currentIndex + 1) % size;
        }
        parentIndex = (parentIndex + 1) % size;
    }

    return child;
}