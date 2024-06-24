from audio_streaming import *
from audio_classifier import *
import time

from mediapipe.tasks import python
# Initialise MediaPipe AudioClassifier
from mediapipe.tasks.python import audio

# Customize and associate model for Classifier
base_options = python.BaseOptions(model_asset_path='../resources/classifier.tflite')
options = audio.AudioClassifierOptions(base_options = base_options)

if __name__ == "__main__":
    audio_stream = AudioStream(chunk_size=1024, buffer_duration=5)
    audio_stream.start_stream()

    with audio.AudioClassifier.create_from_options(options) as classifier:
        try:
            while True:
                # Capture et classification de l'audio
                audio_stream.fill_buffer()
                classification_result_list = classify_audio(audio_stream.audio_buffer, audio_stream.rate, classifier)

                # Génération des timestamps pour chaque segment
                iter = [i * 975 for i in range(6)]  # Vous pouvez ajuster la longueur des segments ici

                # Prise de décision basée sur la classification
                output_class(classification_result_list, iter)

                # Pause entre les analyses
                time.sleep(0.1)

        except KeyboardInterrupt:
            audio_stream.stop_stream()

    
