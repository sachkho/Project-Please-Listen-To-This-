//Partie socket
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


async function sendName() {
  const name = document.getElementById('nameInput');
  const message = {type: 'NAME', data: name.value};
  socket.send(JSON.stringify(message));
  name.value = ''; // Efface le champ d'entrée après l'envoi
  name.disabled = true;
}




//partie graphique
function disableButton() {
}