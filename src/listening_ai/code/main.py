from audio_streaming import *
from audio_classifier import *
import time

from mediapipe.tasks import python
# Initialise MediaPipe AudioClassifier
from mediapipe.tasks.python import audio

# Customize and associate model for Classifier
base_options = python.BaseOptions(model_asset_path='src/listening_ai/resources/classifier.tflite')
options = audio.AudioClassifierOptions(base_options = base_options)

def launchListeningMachine():
    input_device_id = 4  # Vous pouvez ajuster l'index de l'appareil d'entrée ici
    audio_stream = AudioStream(chunk_size=1024, buffer_duration=10, input_device_index=input_device_id)
    audio_stream.start_stream()

    segment_duration_ms = 1000  # Vous pouvez ajuster la longueur des segments ici

    with audio.AudioClassifier.create_from_options(options) as classifier:
        try:
            elapsed_time_ms = 0 # Temps écoulé depuis le début du traitement
            while True:
                # Capture et classification de l'audio
                audio_stream.fill_buffer()
                classification_result_list = classify_audio(audio_stream.audio_buffer, audio_stream.rate, classifier)

                # Prise de décision basée sur la classification
                output_class(classification_result_list, segment_duration_ms, elapsed_time_ms)
                
                # Mise à jour du temps écoulé
                elapsed_time_ms += segment_duration_ms

                # Pause entre les analyses
                time.sleep(segment_duration_ms / 1000)

        except KeyboardInterrupt:
            audio_stream.stop_stream()

    


if __name__ == "__main__":
    launchListeningMachine()