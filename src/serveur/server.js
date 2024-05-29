const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
const Clients = new  Set();
const Admins = new Set();


class Client {
    constructor(id, name='', admin = false){
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

    const client = new Client(generateUniqueId());
    Clients.add(client);


    console.log('\nNouvelle connexion WebSocket. Id : ', client.id);

    displayClients();

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
                console.log("audio received succefully from", client.id);
                // a faire
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
    Admins.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    });
}




