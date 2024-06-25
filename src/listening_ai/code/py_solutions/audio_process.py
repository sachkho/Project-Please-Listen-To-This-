import wave
import numpy as np
from pydub import AudioSegment

def read_wave_file(filename):
    """Read a wave file and return the frame rate and data as a numpy array."""
    with wave.open(filename, 'rb') as wf:
        frame_rate = wf.getframerate()
        n_frames = wf.getnframes()
        n_channels = wf.getnchannels()
        data = wf.readframes(n_frames)
        audio_data = np.frombuffer(data, dtype=np.int16)
        if n_channels == 2:
            audio_data = audio_data.reshape(-1, 2)
        return frame_rate, audio_data

def write_wave_file(filename, frame_rate, audio_data):
    """Write a numpy array to a wave file."""
    n_channels = 1 if audio_data.ndim == 1 else audio_data.shape[1]
    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(n_channels)
        wf.setsampwidth(2)
        wf.setframerate(frame_rate)
        wf.writeframes(audio_data.tobytes())

def normalize_audio(input_file, output_file, intensity_threshold):
    """Normalize an audio file by keeping only high-intensity sounds."""
    frame_rate, audio_data = read_wave_file(input_file)

    # Calculate the intensity of the audio signal
    intensity = np.abs(audio_data)
    
    # Identify frames above the intensity threshold
    if audio_data.ndim == 2:
        intensity = np.max(intensity, axis=1)
    high_intensity_frames = intensity > intensity_threshold

    # Extract high-intensity audio segments
    normalized_audio = audio_data[high_intensity_frames]

    # Write the resulting audio to a new file
    write_wave_file(output_file, frame_rate, normalized_audio)
