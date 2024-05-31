const socket = new WebSocket('ws://localhost:8080');

socket.onopen = function() {
  console.log('Connexion établie.');
};

socket.onmessage = function(event) {
  const message = JSON.parse(event.data)
  console.log('Reçu : ', message);
};

socket.onerror = function(error) {
  console.error('Erreur WebSocket : ', error);
};
  
socket.onclose = function() {
  console.log('Connexion WebSocket fermée : ');
};


function sendName() {
  const name = document.getElementById('nameInput').value;
  const message = {"type" : "NAME", "data" : name};
  socket.send(JSON.stringify(message));
  document.getElementById('nameInput').value = ''; // Efface le champ d'entrée après l'envoi
}

function sendChannel(channel_number) {
  const message = {"type" : "CHANNEL", "data" : channel_number};
  socket.send(JSON.stringify(message));
}
