const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const wss = new WebSocket.Server({ port: 8080 });
console.log('server ws running');
const Clients = new  Set(); // set de class client
const Admins = new Set(); // set de ws 
let Audios = new Set(); // set des nom des audios

const users ={
    'performer1' : {password : 'ready', used: false, channel: 1},
    'performer2' : {password : 'ready', used: false, channel: 2},
    'performer3' : {password : 'ready', used: false, channel: 3},
    'performer4' : {password : 'ready', used: false, channel: 4},
    'performer5' : {password : 'ready', used: false, channel: 5},
    'performer6' : {password : 'ready', used: false, channel: 6},
    'performer7' : {password : 'ready', used: false, channel: 7},
    'performer8' : {password : 'ready', used: false, channel: 8},
    'performer9' : {password : 'ready', used: false, channel: 9},
    'performer10' : {password : 'ready', used: false, channel: 10},
};

class Client {
    constructor(ws, id){
        this.ws = ws;
        this.id = id;
        this.name = '';
        this.admin = false;
        this.ready = false;
        this.language = '';
        this.channel = 0;
    }

    display(){
        console.log("name :", this.name);
        console.log("id :", this.id);
        console.log('language :', this.language);
        console.log('channel :', this.channel);
    }
}


function generateUniqueId() {
    let id;
    do {
      id = Math.floor(Math.random() * 1000);
    } while ([...Clients].some(client => client.id === id));
    return id;
}

function displayClients() { //afiche les clients et leur attributs dans la console
    Clients.forEach(client => {
        client.display();
    });
}

class Timer {
    constructor(){
        this.startTime = null;
        this.elapsedTime = 0;
        this.timerInterval = null;
    }

    start(){
        if (this.timerInterval) return; //timer is already running

        this.startTime = new Date();
        this.timerInterval = setInterval(async () => {
            let now = new Date();
            let time = now - this.startTime + this.elapsedTime;
            sendTime(Math.floor(time/1000)); //envoie le temps en seconde
        }, 2000);
    }
    pause(){
        if (!this.timerInterval) return; // timer is not running

        let now = new Date();
        this.elapsedTime += now - this.startTime;
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        sendTime(Math.floor(this.elapsedTime/1000));
    }
    reset(){
        this.pause();
        this.elapsedTime = 0;
        this.startTime = null;
        sendTime(Math.floor(this.elapsedTime/1000));
    }
}

const timer = new Timer();

function sendTime(time){
    const message = JSON.stringify({type: 'TIME', data: time});
    wss.clients.forEach(client => {
        if(client.readyState === WebSocket.OPEN)
            client.send(message);
    })
}


//Partie socket
wss.on('connection', function connection(ws) {

    const client = new Client(ws, generateUniqueId());
    Clients.add(client);


    console.log('\nNouvelle connexion WebSocket. Id : ', client.id);

    let isAudio = false;
    let audio = new ArrayBuffer;

    updateRdyState(false);

    ws.on('message', function incoming(raw_message) {

        if (isAudio){
            audio = raw_message;
            isAudio = false;
        }
        else{

            //console.log('\nReçu : %s', message, 'from', client.id, '\n');

            const message = JSON.parse(raw_message);

            const type = message.type;
            const data = message.data;

            switch(type){

                case 'NAME':
                    client.name = data;
                    if(client.name != 'Audience')
                        sendClientsToAdmin();
                    break;

                case 'ADMIN' : 
                    client.name = "admin";
                    client.admin = true;
                    Admins.add(ws);
                    checkIfEvryonesRdy();
                    break;

                case 'LANGUAGE':
                    client.language = data;
                    break;

                case 'CHANNEL':
                    client.channel = data;
                    sendAudio(client);

                case 'REFRESH' : 
                    sendClientsToAdmin();
                    sendAudiosToAdmin();
                    break;

                case 'AUDIO_CONTROL':
                    sendTime(timer.elapsedTime/1000);
                    sendAudioControl(data);
                    if(data == 'play')
                        timer.start();
                    else if(data=='pause')
                        timer.pause();
                    else if(data=='stop')
                        timer.reset();
                    break;
                
                case 'IS_AUDIO':
                    isAudio = true;
                    break;

                case 'WRITE':
                    writeFile(message.filename, audio, ws);
                    Audios.add(message.filename);
                    sendAudiosToAdmin();
                    break;
                
                case 'READY':
                    client.ready = data;
                    if(client.name != 'Audience'){
                        if(!client.admin){
                            sendRdyToAdmin(client);
                        }
                    }
                    checkIfEvryonesRdy();
                    break;

                case 'DELETE':
                    deleteFile(message.filename);
                    Audios.delete(message.filename);
                    sendAudiosToAdmin();
                    break;
                

                default:
                    console.log("wrong message format");
                    console.log(type);
            }
        }

        displayClients();
        console.log('\n');
    })

    ws.on('close', function (code, reason) {
        console.log('Connexion WebSocket fermée. Id : ', client.id, '\n');
        Clients.delete(client);
        displayClients();
    });

    ws.on('error', function (error) {
        console.error('Erreur de connexion WebSocket :', error);
    });

})


//envoie les infos à l'admin
function sendClientsToAdmin() {
    const client_list = [];
    Clients.forEach(client =>{
        if(!client.admin){
            if (client.name != 'Audience'){
                client_list.push({name: client.name, ready: client.ready});
            }
        }
    })
    const message = {type : 'CLIENT_LIST', data : client_list};
    Admins.forEach(admin => {
        if (admin.readyState === WebSocket.OPEN) {
            admin.send(JSON.stringify(message));
        }
    });
    
    displayClients();
}

function sendAudiosToAdmin() { //envoie la liste des audios présents dans le dossier audios
    let audios_list = [];
    const directoryPath = path.join(__dirname, 'audio');
    
    try {
        const files = fs.readdirSync(directoryPath);
        audios_list = files.filter(file => {
            const filePath = path.join(directoryPath, file);
            return fs.statSync(filePath).isFile();
        });
    } catch (err) {
        console.error('Erreur en lisant le dossier:', err);
    }

    const message = {type : 'AUDIO_LIST', data : audios_list};
    Admins.forEach(admin => {
        if (admin.readyState === WebSocket.OPEN) {
            admin.send(JSON.stringify(message));
        }
    });
    Audios = new Set(audios_list);
    console.log(Audios);
}


//partie audio

// ancienne version qui terget le client à qui envoyer
/*
function sendAudio(receiver, title){
    let ws;
    let filePath;

    Clients.forEach(client => {
        if (client.name == receiver){
            ws = client.ws;
            return;
        }
    });

    Audios.forEach(audio => {
        if (audio == title){
            filePath = 'audio/' + title;
        }
    })

    const stream = fs.createReadStream(filePath, { highWaterMark: 65536 });
    stream.on('data', (chunk) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(chunk);
        }
        else {
            console.error(receiver + 'undefined');
        }
    });
    stream.on('end', () => {
        ws.send(JSON.stringify({ type: 'AUDIO', end: true }));
    });
} */


//nouvelle version qui evnvoie le bon fichier automatiquement à la bonne personne

function sendAudio(client){
    const ws = client.ws;
    let filePath;

    if(client.channel == 0) {
        filePath = 'audio/' + client.name + '.mp3';
    } else {
        filePath = 'audio/audience' + client.channel + client.language + '.mp3';
    }

    console.log(filePath);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error(`Le fichier ${filePath} n'existe pas`);
            return;
        }
    });

    const stream = fs.createReadStream(filePath, { highWaterMark: 65536 });
    stream.on('data', (chunk) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(chunk);
        }
    });
    stream.on('end', () => {
        ws.send(JSON.stringify({ type: 'AUDIO', end: true }));
    });
}

function sendAudioControl(control){ //transfert les controle audio de l'admin vers les clients
    let ws;
    const message = {type: 'AUDIO_CONTROL', data: control};
    Clients.forEach(client => {
        if (!client.admin){
            ws = client.ws;
            ws.send(JSON.stringify(message));
        }
    })
}


// partie readyness
function checkIfEvryonesRdy(){
    let rdy = true;
    Clients.forEach(client =>{
        if(!client.admin){
            if(!client.ready)
                rdy=false;
        }
    })
    if(rdy){
        updateRdyState(rdy);
    }
}

function updateRdyState(state){
    const message = {type: 'READY', data: state};
    Admins.forEach(admin =>{
        if (admin.readyState === WebSocket.OPEN) {
            admin.send(JSON.stringify(message));
        }
    })
}

function sendRdyToAdmin(client) {
    const message = { type: 'CLIENT_READY', data: client.ready, name: client.name };

    Admins.forEach(admin => {
        if (admin.readyState === WebSocket.OPEN) {
            admin.send(JSON.stringify(message));
        }
    });
}



//partie fichiers
function writeFile(filename, content, ws) {
    const filePath = path.join(__dirname, 'audio', filename);
    fs.writeFileSync(filePath, content, 'binary', (err) => {
        if (err) {
            ws.send(JSON.stringify({ type: 'ERROR', details: err.message }));
            return;
        }
        ws.send(JSON.stringify({ type: 'WRITE', status: 'success' }));
    });
}

function deleteFile(filename){
    const filePath = path.join(__dirname, 'audio', filename);

    try{
        fs.unlinkSync(filePath);
        console.log(filename + ' deleted');
    }catch(err){
        console.error('error while deleting ${filePath}', err);
    }
}

























// work in progress
function startStream(audio, ws){
    const stream = fs.createReadStream(path.join(__dirname, 'audio/test.mp3'), { highWaterMark: 65536 });
    stream.on('data', (chunk) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(chunk);
        }
    });

}