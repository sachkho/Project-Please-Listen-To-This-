const socket = new WebSocket('ws://137.194.194.90:8080');
//const socket = new WebSocket('ws://localhost:8080');

let Clients = new Set(); // set de nom des clients
let Audios = new Set(); // set des audios
let isPlaying = false;
let ready = false;

class Audio {
    constructor(name){
        this.name = name;
        this.uploaded = false;
    }
}

class Client {
    constructor(name, ready=false){
        this.name = name;
        this.ready = ready;
    }
}


function initializeAudioNames() {
    for (let i = 1; i <= 10; i++) {
        let audioName = `performer${i}.mp3`;
        Audios.add(new Audio(audioName));
    }

    for (let i = 1; i <= 3; i++) {
        let audioName = `audience${i}fr.mp3`;
        Audios.add(new Audio(audioName));
    }

    for (let i = 1; i <= 3; i++) {
        let audioName = `audience${i}jap.mp3`;
        Audios.add(new Audio(audioName));
    }
}



socket.onopen = function() {
    console.log('Connexion etablie.');
    const message = {"type": "ADMIN", "data": 'admin'};
    socket.send(JSON.stringify(message));
    initializeAudioNames();
    refresh();
};



socket.onmessage = function(event) {
    const message = JSON.parse(event.data)

    const type = message.type;
    const data = message.data;
    
    console.log('\nRecu : %s', type, data, '\n');
    
    switch(type){
        case 'CLIENT_LIST':
            console.log(data);
            Clients = new Set();
            data.forEach(client => {
                Clients.add(new Client(client.name, client.ready));
            });
            displayClients();
            break;

        case 'CLIENT_READY':
            Clients.forEach(client => {
                if(client.name == message.name){
                    client.ready = data;
                }
            });
            displayClients();
            break;

        case 'AUDIO_LIST':
            console.log(data);
            const audioList = new Set(data);
            checkAudios(audioList);
            break;
        
        case 'WRITE':
            console.log(message.status);
            break;

        case 'ERROR':
            console.log(message.details);
            break;

        case 'TIME':
            console.log(data);
            break;

        case 'READY':
            ready = data;
            break;

        default:
            console.log("wrong type format")           
    }

};

socket.onerror = function(error) {
    console.error('Erreur WebSocket : ', error);
};
  
socket.onclose = function() {
    console.log('Connexion WebSocket terminee : ');
};


function refresh() {
    const message = {type : 'REFRESH'};
    socket.send(JSON.stringify(message));
}

function checkAudios(audioList){ //compare la liste des audios envoyé par le serveur avec celle qu'on a
    audioList.forEach(audioName => {
        Audios.forEach(audio => {
            if(audio.name == audioName)
                audio.uploaded = true;
        });
    });
    displayAudios();
}



//affichage

function displayClients(clients) {
    const clientsList = document.getElementById("clients_list");
    clientsList.innerHTML = '';

    const ul = document.createElement('ul');
    Clients.forEach(client => {
        const li = document.createElement('li');
        li.textContent = client.name;
        if(client.ready){
            li.style.color = '#b5ffb8';
        } else {
            li.style.backgroundColor = '';
        }
        // Créer le bouton "+"
        const addButton = document.createElement('button');
        addButton.textContent = '+';
        addButton.id='addButton';
        addButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Empêcher l'événement de se propager au li
            // Afficher le dépliant pour cet utilisateur
            const audiosDropdown = document.createElement('div');
            if (!li.querySelector('.audios-dropdown')) { // Vérifier si le dépliant existe déjà
                audiosDropdown.className = 'audios-dropdown';
                displayAudios(audiosDropdown, client); // Modifier displayAudios pour accepter un élément parent
                li.appendChild(audiosDropdown);
            } else {
                // Si le dépliant existe déjà, le toggle
                const existingDropdown = li.querySelector('.audios-dropdown');
                existingDropdown.style.display = existingDropdown.style.display === 'none' ? 'block' : 'none';
            }
        });

        li.appendChild(addButton);
        ul.appendChild(li);
    });

    clientsList.appendChild(ul);
}

function displayAudios(parentElement, client) { // ne change pas de couleur quand on supprime jsp pourquoi
    const audiosList = parentElement || document.getElementById("audios_list");
    console.log(audiosList);
    audiosList.innerHTML = '';

    const ul = document.createElement('ul');
    Audios.forEach(audio => {
        const li = document.createElement('li');
        li.textContent = audio.name;

        if(audio.uploaded){
            li.style.color = '#b5ffb8';
        } else {
            li.style.backgroundColor = '';
        }


        if(parentElement){
            li.addEventListener('click', (event) => {
                event.stopPropagation();
                sendAudio(client.name, audio);
                // Réinitialiser la couleur de tous les éléments de la liste
                const allLis = ul.getElementsByTagName('li');
                for (let i = 0; i < allLis.length; i++) {
                    allLis[i].style.backgroundColor = ''; // Réinitialiser la couleur à la valeur par défaut
                }
                // Changer la couleur de l'élément cliqué en bleu
                li.style.backgroundColor = '#b5ffb8';
            });
        } else {
            const suprButton = document.createElement('button');
            suprButton.textContent = 'supprimer';
            suprButton.id='suprButton';
            suprButton.addEventListener('click', (event) => {
                event.stopPropagation();
                const message = {type: 'DELETE', filename: audio.name};
                socket.send(JSON.stringify(message));
            })
            li.appendChild(suprButton);
        }
        ul.appendChild(li);
    });

    audiosList.appendChild(ul);
}

// Partie audio

function sendAudio(name, audio){
    const message = {type: 'SEND_AUDIO', receiver: name, audio: audio}
    socket.send(JSON.stringify(message));
    console.log("play ", audio, " to ", name);
}

//controles audio


function playAudio(){
    const playButton = document.getElementById('play-button');
    if (isPlaying){ //met en pause
        const message = {type:'AUDIO_CONTROL', data: 'pause'}
        socket.send(JSON.stringify(message));
        isPlaying = false;
        playButton.textContent = 'Play';
    } else{ //reprend la lecture
        const message = {type:'AUDIO_CONTROL', data: 'play',}
        socket.send(JSON.stringify(message));
        isPlaying = true;
        playButton.textContent = 'Pause';
    }
}

function stopAudio(){
    const message = {type:'AUDIO_CONTROL', data: 'stop'}
    socket.send(JSON.stringify(message));
    isPlaying = false;
    const playButton = document.getElementById('play-button');
    playButton.textContent = 'Play';
}





// pour chosir les sons
/*
function chooseAudio(receiver) {
    toggleDropdown();
    var menu = document.getElementById("menu");
    menu.innerHTML = "";
    Audios.forEach(function(audio) {
      var link = document.createElement("a");
      link.href = "#";
      link.textContent = audio;
      link.addEventListener("click", function() {
        sendAudio(receiver, audio); 
        console.log(receiver);
        console.log(audio);
        toggleDropdown();
      });
      menu.appendChild(link);
    });
  } */

  // Fonction pour afficher ou masquer le menu déroulant
function toggleDropdown() {
    var menu = document.getElementById("menu");
    if (menu.style.display === "block") {
      menu.style.display = "none";
    } else {
      menu.style.display = "block";
    }
  }



//partie fichier
function readFile() {
    socket.send(JSON.stringify({ type: 'read', filename: 'example.txt' }));
  }

function sendFile() {
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;
    
    if (files.length > 0) {
        for(let i=0; i<files.length; i++){

            const file = files[i];
            const reader = new FileReader();
            const fileName = file.name;

            let checkFileName = false;
            Audios.forEach(audio => {
                if (audio.name === fileName){
                    checkFileName = true;
                }
            });
            
            if(checkFileName){
                reader.onload = (e) => {
                    const content = e.target.result;
                    socket.send(JSON.stringify({type: 'IS_AUDIO'}));
                    socket.send(content);
                    socket.send(JSON.stringify({type: 'WRITE', filename: file.name}));
                    console.log('fichier envoye');
                  };
            
                reader.onerror = (e) => {
                    console.error('Erreur de lecture du fichier', e);
                };
                  
                reader.readAsArrayBuffer(file);
            } else{
                alert(fileName + 'n\'est pas un nom de fichier correct');
            }
        }
    } else {
      alert('Veuillez sélectionner un fichier d\'abord.');
    }
}





//affichage
/*function displayClients() {
    const clientsList = document.getElementById("clients_list");   
    clientsList.innerHTML = '';

    const ul = document.createElement('ul');
    Clients.forEach(client => {
        const li = document.createElement('li');
        li.textContent = client;
        li.addEventListener('click', () => {
            chooseAudio(client);
        });
        ul.appendChild(li);
    });

    clientsList.appendChild(ul);
    
}

function displayAudios() {
    const audiosList = document.getElementById("audios_list");   
    audiosList.innerHTML = '';

    const ul = document.createElement('ul');
    Audios.forEach(audio => {
        const li = document.createElement('li');
        li.textContent = audio;
        ul.appendChild(li);
    });

    audiosList.appendChild(ul);
    
} ANCIENNE VERSION DES DEUX FONCTIONS A GARDER AU CAS OU*/
