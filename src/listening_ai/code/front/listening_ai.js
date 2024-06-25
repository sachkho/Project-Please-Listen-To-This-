// rajouter case : 'LM_ON' dans le switch(type) et LM_OFF



function startListeningMachine(ws) {
    const pythonProcess = spawn('python3', ['src/listening_ai/code/py_solutions/main.py']);

    pythonProcess.stdout.on('data', (data) => {
        try {
            const result = JSON.parse(data.toString());
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'CLASSIFICATION_RESULT', data: result }));
            }
        } catch (err) {
            console.error('Error parsing Python output:', err);
        }
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
    });
}