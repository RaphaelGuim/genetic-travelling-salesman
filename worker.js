function geneticSalesman(){
    bestSpecies = getBest();
  
    createNewGeneration();
  
    getBestScore();
    self.postMessage('Tarefa concluída.');
    geneticSalesman()
  }

  // Evento que escuta mensagens enviadas pelo script principal
self.addEventListener('message', function(e) {
  // Recebe dados do script principal
  var message = e.data;

  if (message === 'Iniciar loop') {
    // Inicia o loop chamando a função pela primeira vez
    geneticSalesman();
  }
}, false);