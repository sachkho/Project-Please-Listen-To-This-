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
                sendToAdmin();
                break;
            case 'ADMIN' : 
                client.name = "admin";
                client.admin = true;
                Admins.add(ws);
                break;
            case 'REFRESH' : 
                sendToAdmin();
                break;
            case 'AUDIO' :
                console.log("audio received succefully from", client.name, client.id);
                const receiver = message.receiver;
                sendAudio(receiver, data);
                break;
            case 'READ_AUDIO':
                const filePath = `audio/test.mp3`;
                fs.readFile(filePath, (err, audio_data) => {
                    
                    if (err) {
                        console.error('Error reading file:', err);
                        return;
                    }
                    const message = {type: 'AUDIO', data: audio_data}
                    ws.send(JSON.stringify(message));
                });
                break;
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

function sendToAdmin() {
    const message = {type : 'CLIENT_LIST', data : Array.from(Clients).map(client => client.name)}; // #enlever les admin
    Admins.forEach(admin => {
        if (admin.readyState === WebSocket.OPEN) {
            admin.send(JSON.stringify(message));
        }
    });
}

function sendAudio(receiver, audio){
    const message = {type: 'AUDIO', data: audio};
    Clients.forEach(client => {
        if (client.name == receiver){
            client.ws.send(JSON.stringify(message));
            return;
        }
    });
}


