<<<<<<< HEAD
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
const clients = []; //voir pour l'utilisation d'un map()


class Client {
    constructor(id, name='', channel=-1){
        this.id = id;
        this.name = name;
        this.channel = channel;
    }

    display(){
        console.log("id : ", this.id);
        console.log("name :", this.name);
        console.log("channel : ", this.channel);
    }
}


function generateUniqueId() {
    let id;
    do {
      id = Math.floor(Math.random() * 1000);
    } while (clients.includes(id));
    return id;
}



wss.on('connection', function connection(ws) {
    const clientId = generateUniqueId();
    const client = new Client(clientId);
    console.log('Nouvelle connexion WebSocket. Id : ', clientId);
    clients.push(clientId);

    console.log(clients);

    ws.on('message', function incoming(raw_message) {
        message = JSON.parse(raw_message);
        const type = message.type;
        const data = message.data;
        console.log('Reçu : %s', message);

        switch(type){
            case 'NAME':
                client.name = data;
                break;
            case 'CHANNEL':
                client.channel = data;
                break;
            default:
                console.log("wrong message format")           
        }

        client.display();
    })

    ws.on('close', function (code, reason) {
        console.log('Connexion WebSocket fermée. Id : ', clientId);
        const index = clients.indexOf(clientId);
        clients.splice(index);
    });

    ws.on('error', function (error) {
        console.error('Erreur de connexion WebSocket :', error);
    });

})

// A faire : map des clients et map des channels
=======
const WebSocket = require('ws');
const fs = require('fs');

const wss = new WebSocket.Server({ port: 8080 });
const Clients = new  Set();
const Admins = new Set();


class Client {
    constructor(ws, id, name='', admin = false){
        this.ws = ws;
        this.id = id;
        this.name = name;
        this.admin = admin;
    }

    display(){
        console.log("name :", this.name);
        console.log("id : ", this.id);
    }
}


function generateUniqueId() {
    let id;
    do {
      id = Math.floor(Math.random() * 1000);
    } while ([...Clients].some(client => client.id === id));
    return id;
}

function displayClients() {
    Clients.forEach(client => {
        if (client.admin){
            console.log("admin");
            client.display();
        } else {
            client.display();
        }
    });
}


//Partie socket
wss.on('connection', function connection(ws) {

    const client = new Client(ws, generateUniqueId());
    Clients.add(client);


    console.log('\nNouvelle connexion WebSocket. Id : ', client.id);

    ws.on('message', function incoming(raw_message) {
        message = JSON.parse(raw_message);
        console.log('\nReçu : %s', message, 'from', client.id, '\n');

        const type = message.type;
        const data = message.data;
        
        switch(type){
            case 'NAME':
                client.name = data;
                sendClientsToAdmin();
                break;
            case 'ADMIN' : 
                client.name = "admin";
                client.admin = true;
                Admins.add(ws);
                break;
            case 'REFRESH' : 
                sendClientsToAdmin();
                break;
            case 'AUDIO' : //work in progress
                console.log("audio received succefully from", client.name, client.id);
                //sendAudio(receiver, data);
                startStream(data);
                break;
            case 'REQUEST_AUDIO':
                const filePath = `audio/test.mp3`;
                const stream = fs.createReadStream(filePath, { highWaterMark: 65536 });
                stream.on('data', (chunk) => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(chunk);
                    }
                });
                stream.on('end', () => {
                    ws.send(JSON.stringify({ end: true }));
                });
                break;
            case 'SEND_AUDIO':
                sendAudio(message.receiver);
                break;
            case 'AUDIO_CONTROL':
                sendAudioControl(message.control);
            default:
                console.log("wrong message format")           
        }

        
        displayClients();
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

function sendClientsToAdmin() {
    const client_list = [];
    Clients.forEach(client =>{
        if(!client.admin){
            client_list.push(client.name);
        }
    })
    const message = {type : 'CLIENT_LIST', data : client_list};
    Admins.forEach(admin => {
        if (admin.readyState === WebSocket.OPEN) {
            admin.send(JSON.stringify(message));
        }
    });
}

function sendAudio(receiver){
    let ws;

    Clients.forEach(client => {
        if (client.name == receiver){
            ws = client.ws;
            return;
        }
    });
    
    const filePath = `audio/test.mp3`;
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

function sendAudioControl(control){
    let ws;
    const message = {type: 'AUDIO_CONTROL', control: control};
    Clients.forEach(client => {
        if (client.name == receiver){
            ws = client.ws;
            ws.send(JSON.stringify(message));
        }
    })
}



function startStream(audio, ws){
    const stream = fs.createReadStream(path.join(__dirname, 'audio/test.mp3'), { highWaterMark: 65536 });
    stream.on('data', (chunk) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(chunk);
        }
    });

}
>>>>>>> 0790880475f27199ce4320e56153595aa60567ff
