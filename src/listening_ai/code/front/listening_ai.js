
// Tania : MODIF
// const { spawn } = require('child_process');



         
// Tania : MODIF START HERE                
// case 'GET_DEVICE':
//     const pythonProcess = spawn('python3', ['src/listening_ai/code/py_solutions/config_device.py']);
    
//     pythonProcess.stdout.on('data', (data) => {
//         try {
//             const result = JSON.parse(data.toString());
//             if (result && result.type === 'DEVICE_LIST') {
//                 ws.send(JSON.stringify(result)); // Envoyer le résultat directement sans encapsulation
//             } else {
//                 console.error("Unexpected data format:", result);
//             }
//         } catch (error) {
//             console.error("Error parsing JSON:", error);
//         }
//     });

//     pythonProcess.stderr.on('data', (data) => {
//     console.error(`stderr: ${data}`);
//     });

//     pythonProcess.on('close', (code) => {
//     console.log(`child process exited with code ${code}`);
//     });
//     break; 
// case 'RUN_SCRIPT' : 
//     const pythonProcess2 = spawn('python3', ['../listening_ai/code/py_solutions/main.py']);
    
//     // Send main.py args
//     const scriptArgs = {
//     input_device_id : data.input_device_id,
//     stream_mode : data.stream_mode,
//     file : data.file 
//     }

//     pythonProcess2.stdin.write(JSON.stringify(scriptArgs));
//     pythonProcess2.stdin.end();

//     pythonProcess2.stdout.on('data', (data) => {
//     const result = JSON.parse(data.toString());
//     ws.send(JSON.stringify({ type: 'OUTPUT_CLASS', data: result }));
//     });

//     pythonProcess2.stderr.on('data', (data) => {
//     console.error(`stderr: ${data}`);
//     });

//     pythonProcess2.on('close', (code) => {
//     console.log(`child process exited with code ${code}`);
//     });
//     break;
// MODIF END HERE
// MODIF END





document.addEventListener('DOMContentLoaded', (event) => {
    const socket = new WebSocket('ws://localhost:8080');

    const run_get_device = document.getElementById('run-get-device-btn');
    const device_output = document.getElementById('device-output');
    const input_args = document.getElementById('input-args');
    const device = document.getElementById('device');
    const checkbox = document.getElementById('checkbox');
    const file_input = document.getElementById('file');
    const output_class = document.getElementById('output-class');

    socket.addEventListener('open', () => {
        console.log('WebSocket connection established');
    });

    socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'DEVICE_LIST') {
            device_output.innerHTML = 'Input devices available, choose one of them : ' + data.data.join(', ');
            input_args.style.display = 'block';
        } else if (data.type === 'OUTPUT_CLASS') {
            output_class.innerHTML = 'Classification results : ' + JSON.stringify(data);
        }
    });

    run_get_device.addEventListener('click', () => {
        socket.send(JSON.stringify({ type: 'GET_DEVICE' }));
    });

    input_args.addEventListener('submit', (event) => {
        event.preventDefault();

        const input_device_id = device.value;
        const is_checked = checkbox.checked;
        let file_content = null;

        if (!is_checked && file_input.files.length > 0) {
            const file = file_input.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                file_content = e.target.result;
                socket.send(JSON.stringify({
                    type: 'RUN_SCRIPT',
                    input_device_id: input_device_id,
                    stream_mode: is_checked,
                    file: { content: file_content }
                }));
            };
            reader.readAsText(file);
        } else {
            socket.send(JSON.stringify({
                type: 'RUN_SCRIPT',
                input_device_id: input_device_id,
                is_checked: is_checked
            }));
        }
    });
});
