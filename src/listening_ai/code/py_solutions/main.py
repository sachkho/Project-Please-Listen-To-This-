# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from audio_streaming import *
from audio_classifier import *
import time
from scipy.io import wavfile
import warnings
warnings.filterwarnings("ignore")

import json
import sys

from mediapipe.tasks import python
# Initialise MediaPipe AudioClassifier
from mediapipe.tasks.python import audio

# Customize and associate model for Classifier
base_options = python.BaseOptions(model_asset_path='src/listening_ai/resources/classifier.tflite')
options = audio.AudioClassifierOptions(base_options = base_options,
                                        max_results = 1)
                                        # category_allowlist = ["Speech", "Mechanisms", "Silence", "Animal"]) #à remplir selon les catégories que l'on souhaite détecter


def launchListeningMachine(stream_mode, input_device_id, audio_data = None):
    segment_duration_ms = 1000  # Vous pouvez ajuster la longueur des segments ici
    elapsed_time_ms = 0 # Temps écoulé depuis le début du traitement


    if stream_mode : 
        input_device_id = input_device_id  # Vous pouvez ajuster l'index de l'appareil d'entrée ici 
                            # (à voir si on le mets pas directement dans les arg du prompt)
        audio_stream = AudioStream(chunk_size=1024, buffer_duration=10, input_device_index=input_device_id)
        audio_stream.start_stream()


        with audio.AudioClassifier.create_from_options(options) as classifier:
            try:
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
    else : 
        with audio.AudioClassifier.create_from_options(options) as classifier:
            sample_rate, wav_data = wavfile.read(audio_data)
            audio_clip = containers.AudioData.create_from_array(
                wav_data.astype(float) / np.iinfo(np.int16).max, sample_rate)
            classification_result_list = classifier.classify(audio_clip)

            output_class(classification_result_list, segment_duration_ms, elapsed_time_ms)


def main () : 
    input_data = sys.stdin.read()
    try : 
        data = json.loads(input_data)

        input_device_id = data.get('input_device_id', 1) # Valeur par défaut = 1
        stream_mode = data.get('stream_mode', False) # Valeur par défaut False
        file_content = data.get('file_content', None) # Valeur par défaut Rien
    except json.JSONDecodeError as e:
        print(f"Erreur de décodage du JSON : {e}")
        sys.exit(1)
        
    launchListeningMachine(stream_mode, input_device_id, file_content)

if __name__ == "__main__":
    main()