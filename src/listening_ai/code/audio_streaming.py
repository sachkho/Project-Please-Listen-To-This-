import pyaudio
import numpy as np
import tensorflow as tf
import mediapipe as mp

class AudioStream:
    def __init__(self, chunk_size=1024, rate=44100, channels=1, buffer_duration=5, input_device_index=None):
        self.chunk_size = chunk_size
        self.rate = rate
        self.channels = channels
        self.format = pyaudio.paInt16
        self.stream = None
        self.p = pyaudio.PyAudio()
        self.buffer_duration = buffer_duration
        self.buffer_size = int(rate / chunk_size * buffer_duration)
        self.audio_buffer = []
        self.input_device_index = input_device_index

    def start_stream(self):
        self.stream = self.p.open(format=self.format,
                                  channels=self.channels,
                                  rate=self.rate,
                                  input=True,
                                  frames_per_buffer=self.chunk_size,
                                  input_device_index=self.input_device_index)

    def read_chunk(self):
        data = self.stream.read(self.chunk_size)
        return np.frombuffer(data, dtype=np.int16)

    def stop_stream(self):
        self.stream.stop_stream()
        self.stream.close()
        self.p.terminate()

    def fill_buffer(self):
        self.audio_buffer = []
        for _ in range(self.buffer_size):
            chunk = self.read_chunk()
            self.audio_buffer.append(chunk)
        self.audio_buffer = np.concatenate(self.audio_buffer, axis=0)
