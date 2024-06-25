const WebSocket = require('ws');
const fs = require('fs');

// Tania : MODIF
const { spawn } = require('child_process');
// MODIF END
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
            case 'AUDIO' :
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
            case 'PLAY_AUDIO':
                const receiver = message.receiver;
                sendAudio(receiver);
                break;
         
// Tania : MODIF START HERE                
            case 'GET_DEVICE':
                    const pythonProcess = spawn('python3', ['src/listening_ai/code/py_solutions/config_device.py']);
                    
                    pythonProcess.stdout.on('data', (data) => {
                        try {
                            const result = JSON.parse(data.toString());
                            if (result && result.type === 'DEVICE_LIST') {
                                ws.send(JSON.stringify(result)); // Envoyer le résultat directement sans encapsulation
                            } else {
                                console.error("Unexpected data format:", result);
                            }
                        } catch (error) {
                            console.error("Error parsing JSON:", error);
                        }
                    });
    
                    pythonProcess.stderr.on('data', (data) => {
                    console.error(`stderr: ${data}`);
                    });
    
                    pythonProcess.on('close', (code) => {
                    console.log(`child process exited with code ${code}`);
                    });
                    break; 
            case 'RUN_SCRIPT' : 
                    const pythonProcess2 = spawn('python3', ['../listening_ai/code/py_solutions/main.py']);
                    
                    // Send main.py args
                    const scriptArgs = {
                    input_device_id : data.input_device_id,
                    stream_mode : data.stream_mode,
                    file : data.file 
                    }
    
                    pythonProcess2.stdin.write(JSON.stringify(scriptArgs));
                    pythonProcess2.stdin.end();
    
                    pythonProcess2.stdout.on('data', (data) => {
                    const result = JSON.parse(data.toString());
                    ws.send(JSON.stringify({ type: 'OUTPUT_CLASS', data: result }));
                    });
            
                    pythonProcess2.stderr.on('data', (data) => {
                    console.error(`stderr: ${data}`);
                    });
            
                    pythonProcess2.on('close', (code) => {
                    console.log(`child process exited with code ${code}`);
                    });
                    break;
// MODIF END HERE
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
        ws.send(JSON.stringify({ end: true }));
    });
}

function startStream(audio, ws){
    const stream = fs.createReadStream(path.join(__dirname, 'audio/test.mp3'), { highWaterMark: 65536 });
    stream.on('data', (chunk) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(chunk);
        }
    });

}
