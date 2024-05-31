//Partie socket
const socket = new WebSocket('ws://localhost:8080');



socket.onopen = function() {
  console.log('Connexion établie.');
};


socket.onerror = function(error) {
  console.error('Erreur WebSocket : ', error);
};
  
socket.onclose = function() {
  console.log('Connexion WebSocket fermée : ');
};


async function sendName() {
  const name = document.getElementById('nameInput');
  const message = {type: 'NAME', data: name.value};
  socket.send(JSON.stringify(message));
  name.value = ''; // Efface le champ d'entrée après l'envoi
  name.disabled = true;
  name.style.opacity = '0.5';
}






//partie audio
  let audioChunks = [];

  socket.binaryType = 'arraybuffer';

  socket.onmessage = (event) => {
      if (typeof event.data === 'string') {
          const message = JSON.parse(event.data);
          if (message.end) {
              const blob = new Blob(audioChunks, { type: 'audio/mpeg' });
              const url = URL.createObjectURL(blob);

              const sound = new Howl({
                  src: [url],
                  format: ['mp3'],
                  autoplay: true,
                  onend: function() {
                      console.log('Finished playing audio.');
                  }
              });

              // Clean up the URL object after the audio is loaded
              sound.on('load', () => {
                  URL.revokeObjectURL(url);
              });
          }
      } else {
          audioChunks.push(event.data);
      }
  };
 


  