<<<<<<< HEAD
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
=======
//Partie socket
const socket = new WebSocket('ws://localhost:8080');



socket.onopen = function() {
  console.log('Connexion établie.');
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


function requestAudioFromServer(){
  const message = {type: 'REQUEST_AUDIO'};
  socket.send(JSON.stringify(message));
}



//partie audio
let audioChunks = [];
let sound;

socket.binaryType = 'arraybuffer';

socket.onmessage = (event) => {
  if (typeof event.data === 'string') {
      const message = JSON.parse(event.data);
      console.log(message.type);
      switch(message.type){
        case 'AUDIO_CONTROL':
          switch(message.control){
            case 'play':
              playAudio();
              break;
            case 'pause':
              pauseAudio();
              break;
            case 'stop':
              stopAudio();
              break;
            default:
              console.log("wrong control fromat");
          }
          break;
        case 'AUDIO':
          if (message.end) {
              readAudio(audioChunks);
          }
          break;
        default:
          console.log("wrong type format")
      }
  } else {
      audioChunks.push(event.data);
  }
};


function readAudio(audiochunks){
  const blob = new Blob(audioChunks, { type: 'audio/mpeg' });
  const url = URL.createObjectURL(blob);

  sound = new Howl({
    src: [url],
    format: ['mp3'],
    autoplay: false,
  });

  // Clean up the URL object after the audio is loaded
  sound.on('load', () => {
      URL.revokeObjectURL(url);
  });
}



function playAudio() {
  sound.play();
}
function pauseAudio() {
  sound.pause();
}
function stopAudio() {
  sound.stop();
}



  
>>>>>>> 0790880475f27199ce4320e56153595aa60567ff
