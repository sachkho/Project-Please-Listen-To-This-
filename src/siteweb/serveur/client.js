
//Partie socket
const socket = new WebSocket('ws://137.194.194.90:8080');
//const socket = new WebSocket('ws://localhost:8080');


socket.onopen = function() {
  console.log('Connexion etablie.');

  const lang = sessionStorage.getItem('lang')
  const channel = sessionStorage.getItem('channel');
  if(lang && channel){
    sendName('Audience');
    sendLanguage(lang);
    sendChannel(channel);
  } else{
    const performer = sessionStorage.getItem('performer');
    sendName(performer);
    sendChannel(0);
  }
};


socket.onerror = function(error) {
  console.error('Erreur WebSocket : ', error);
};
  
socket.onclose = function() {
  console.log('Connexion WebSocket fermée : ');
};



// partie identification

function sendLanguage(language){
  const message = {type:'LANGUAGE', data: language};
  socket.send(JSON.stringify(message));
  console.log('message envoye : ', message);
}

function sendChannel(channel){
  const message = {type: 'CHANNEL', data: channel};
  socket.send(JSON.stringify(message));
  console.log('message envoye : ', message);
}

function sendName(name) {
  const nameInput = document.getElementById('nameInput');
  const data = name || nameInput.value;
  const message = {type: 'NAME', data: data};
  socket.send(JSON.stringify(message));
  console.log('message envoye : ', message);
  if(nameInput){
    nameInput.value = ''; // Efface le champ d'entrée après l'envoi
    nameInput.disabled = true;
    nameInput.style.opacity = '0.5';
  }
}




//partie audio
let audioChunks = [];
let sound = null;
let time = 0;
let auditorIsRdy = false;
let soundIsLoaded = false;

socket.binaryType = 'arraybuffer';

socket.onmessage = (event) => {
  if (typeof event.data === 'string') {

      const message = JSON.parse(event.data);
      console.log('message recu :', message);
      const data = message.data;

      switch(message.type){

        case 'AUDIO_CONTROL':
          if(data == 'play')
            play();
          else if(data=='pause')
            pause();
          else if(data=='stop')
            stop();
          break;

        case 'AUDIO': 
          if (message.end) {
              readAudio(audioChunks);
              audioChunks = [];
          }
          break;

        case 'TIME':
          time=data;
          console.log(sound.seek());
          break;

        default:
          console.log("wrong type format")
      }
  } else {
      audioChunks.push(event.data);
  }
};









// partie audio



function readAudio(audiochunks){
  clearAudio();

  const blob = new Blob(audioChunks, { type: 'audio/mpeg' });
  const url = URL.createObjectURL(blob);

  sound = new Howl({
    src: [url],
    format: ['mp3'],
    autoplay: false,
    preload : true
  });

  // Clean up the URL object after the audio is loaded
  sound.on('load', () => {
      URL.revokeObjectURL(url);
      console.log('Audio charge');
      soundIsLoaded = true;
      sendRdy();
  });

  // Écouter l'événement 'loaderror' pour détecter les erreurs de chargement
  sound.on('loaderror', (id, error) => {
    console.error('Erreur lors du chargement du fichier audio :', error);
  });
}


function clearAudio() {
  if (sound !== null) {
    sound.stop();
    sound.unload();
    sound = null;
  }
}


function play() {
  sound.seek(time);
  sound.play();
}
function pause() {
  sound.pause();
}
function stop() {
  sound.stop();
}

function ready() {
  auditorIsRdy = true;
  const button = document.getElementById('ready');
  button.style.backgroundImage="url('../css/images/readyvert.png')"
  sendRdy();
}


// a refaire
function sendRdy(){
  if (auditorIsRdy && soundIsLoaded){
    if(time>0 && !sound.playing())
      play();
    message = {type: 'READY', data: true}
    socket.send(JSON.stringify(message));
  }
}

