const socket = new WebSocket('ws://localhost:8080');

let Clients = new Set();


socket.onopen = function() {
    console.log('Connexion établie.');
    const message = {"type": "ADMIN", "data": 'admin'};
    socket.send(JSON.stringify(message));
    refresh();
};

socket.onmessage = function(event) {
    const message = JSON.parse(event.data)
    console.log('\nReçu : %s', message, '\n');

    const type = message.type;
    const data = message.data;
    
    switch(type){
        case 'CLIENT_LIST':
            console.log(data);
            Clients = new Set(data);
            break;
        default:
            console.log("wrong type format")           
    }

    displayClients();
};

socket.onerror = function(error) {
    console.error('Erreur WebSocket : ', error);
};
  
socket.onclose = function() {
    console.log('Connexion WebSocket fermée : ');
};


async function refresh() {
    const message = {type : 'REFRESH'};
    socket.send(JSON.stringify(message));
}



//affichage
function displayClients() {
    const clientsList = document.getElementById("clients_list");   
    clientsList.innerHTML = '';

    const ul = document.createElement('ul');
    Clients.forEach(client => {
        const li = document.createElement('li');
        li.textContent = client;
        li.addEventListener('click', () => {
            sendAudio(client);
        });
        ul.appendChild(li);
    });

    clientsList.appendChild(ul);
    
}




// Partie audio


//implementer la selection et upload des fichiers



function playAudio(){
    const message = {type:'AUDIO_CONTROL', control: 'play'}
    socket.send(JSON.stringify(message));
}
function pauseAudio(){
    const message = {type:'AUDIO_CONTROL', control: 'pause'}
    socket.send(JSON.stringify(message));
}
function stopAudio(){
    const message = {type:'AUDIO_CONTROL', control: 'stop'}
    socket.send(JSON.stringify(message));
}

function sendAudio(){
    
}









//work in progress
let mediaRecorder;
let recordedChunks = [];

async function startAudioCapture() {
  try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = event => {
          if (event.data.size > 0) {
              recordedChunks.push(event.data);
          }
      };

      mediaRecorder.start();
      console.log("Recording started");
  } catch (error) {
      console.error('Error accessing microphone:', error);
  }
}

function stopAudioCapture() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      console.log('Recording stopped');
      sendAudio();
  }
}

