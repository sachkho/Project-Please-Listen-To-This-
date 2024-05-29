//Partie socket
const socket = new WebSocket('ws://localhost:8080');

socket.onopen = function() {
  console.log('Connexion établie.');
};

socket.onmessage = function(event) {
  const message = JSON.parse(event.data)
  console.log('\nReçu : %s', message, '\n');

  const type = message.type;
  const data = message.data;
  switch(type){
    case 'AUDIO' :
      console.log(data);
      playAudio(data);
      break;
    default :
      console.log("Wrong message format");
  }
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
  name.style.opacity = '0.5';
}






//partie audio

/*
const audioPlayer = document.getElementById('audioPlayer');
const audioLibrary = document.getElementById('audioLibrary');
*/

document.addEventListener('DOMContentLoaded', (event) => {

  document.getElementById('audioFileInput').addEventListener('change', function(event) {
    const audioFile = event.target.files[0];
    if (audioFile) {
        const audioURL = URL.createObjectURL(audioFile);
        const audioPlayer = document.getElementById('audioPlayer');
        audioPlayer.src = audioURL;
        audioPlayer.play();
    }
  });
});

async function playAudio(blob) {
  const audioURL = URL.createObjectURL(blob); // Création de l'URL objet à partir du Blob
  const audioPlayer = document.getElementById('audioPlayer');
  audioPlayer.src = audioURL; // Définition de l'URL objet comme source de l'élément audio
  audioPlayer.play(); // Lecture de l'audio
}