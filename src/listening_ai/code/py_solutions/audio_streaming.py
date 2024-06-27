import pyaudio
import numpy as np

class AudioStream:
    """Class to handle audio streaming using PyAudio."""
    def __init__(self, chunk_size=1024, rate=44100, channels=1, buffer_duration=5, input_device_index=None):
        self.chunk_size = chunk_size # Number of frames per buffer
        self.rate = rate # Sampling rate
        self.channels = channels # Number of audio channels
        self.format = pyaudio.paInt16 # Audio format 
        self.stream = None # PyAudio stream
        self.p = pyaudio.PyAudio() # PyAudio object
        self.buffer_duration = buffer_duration # Duration of the buffer in seconds
        self.buffer_size = int(rate / chunk_size * buffer_duration) # Number of buffers in the buffer
        self.audio_buffer = [] # Audio buffer
        self.input_device_index = input_device_index # Input device index

    def start_stream(self):
        """Start the audio stream."""
        self.stream = self.p.open(format=self.format,
                                  channels=self.channels,
                                  rate=self.rate,
                                  input=True,
                                  frames_per_buffer=self.chunk_size,
                                  input_device_index=self.input_device_index)

    def read_chunk(self):
        """Read a chunk of audio data."""
        data = self.stream.read(self.chunk_size)
        return np.frombuffer(data, dtype=np.int16) # Convert the data to a numpy array

    def stop_stream(self):
        """Stop the audio stream."""
        self.stream.stop_stream()
        self.stream.close()
        self.p.terminate()

    def fill_buffer(self):
        """Fill the audio buffer with audio data."""
        self.audio_buffer = []
        for _ in range(self.buffer_size):
            chunk = self.read_chunk()
            self.audio_buffer.append(chunk)
        self.audio_buffer = np.concatenate(self.audio_buffer, axis=0) # Concatenate the chunks
