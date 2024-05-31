import media as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import audio
import numpy as np
from scipy.io import wavfile
import numpy as np
import sounddevice as sd
import time

model_path = 'src/listening_ai/resources/classifier.tflite'
base_options = python.BaseOptions(model_asset_path=model_path)
sample_rate = 44100
duration = 5


AudioClassifier = mp.tasks.audio.AudioClassifier
AudioClassifierOptions = mp.tasks.audio.AudioClassifierOptions
AudioClassifierResult = mp.tasks.audio.AudioClassifierResult
AudioRunningMode = mp.tasks.audio.RunningMode
BaseOptions = mp.tasks.BaseOptions

def print_result(result: AudioClassifierResult, timestamp_ms: int):
        print('AudioClassifierResult result : {}'.format(result))



options = AudioClassifierOptions(
base_options=BaseOptions(model_asset_path=model_path),
running_mode=AudioRunningMode.AUDIO_STREAM,
max_results=5,
result_callback=print_result)

with AudioClassifier.create_from_options(options) as classifier:

        AudioData = mp.tasks.components.containers.AudioData

        async def record_audio():
                while True:
                        buffer = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=1, dtype='int16')
                        sd.wait()

                        audio_data = AudioData.create_from_array(
                                buffer.astype(float) / np.iinfo(np.int16).max, sample_rate)

                        timestamp_ms = time.time() * 1000

                        await classifier.classify_async(audio_data, timestamp_ms)
  