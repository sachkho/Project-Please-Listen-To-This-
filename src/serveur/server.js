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
