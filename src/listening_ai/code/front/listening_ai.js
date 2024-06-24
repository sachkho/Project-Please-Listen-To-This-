// Route POST pour appeler le script Python
app.post('/run-python-script', (req, res) => {
        // Appeler le script Python
        const pythonProcess = spawn('python', ['src/listening_ai/code/main.py']);
    
        pythonProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
            res.send(data.toString());
        });
    
        pythonProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
    
        pythonProcess.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    });
    