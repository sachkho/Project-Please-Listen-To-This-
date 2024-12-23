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

from mediapipe.tasks import python
from mediapipe.tasks.python import audio

# Customize and associate model for Classifier
base_options = python.BaseOptions(model_asset_path='src/listening_ai/resources/classifier.tflite')
options = audio.AudioClassifierOptions(base_options=base_options,
                                       max_results=1)

pyaudio_instance = pyaudio.PyAudio()

def list_input_devices():
    """List all available input devices."""
    devices = []
    for i in range(pyaudio_instance.get_device_count()):
        dev = pyaudio_instance.get_device_info_by_index(i)
        if dev['maxInputChannels'] > 0:
            devices.append((i, dev['name']))
    return devices

def output(classification_result_list, segment_duration_ms, start_time_ms=0, callback=None):
    """Output the classification results and processing each results
    :param classification_result_list: The classification results
    :type classification_result_list: mediapipe.tasks.python.components.containers.classification_result.ClassificationResult
    :param segment_duration_ms: The duration of each audio segment in milliseconds
    :type segment_duration_ms: int
    :param start_time_ms: The start time of the audio data in milliseconds
    :type start_time_ms: int
    """
    
    for idx, classification_result in enumerate(classification_result_list):   
        top_category = classification_result.classifications[0].categories[0] # Get the top category
        class_name = top_category.category_name # Get the class name
        score = top_category.score # Get the score
        timestamp = start_time_ms + idx * segment_duration_ms
        if callback : 
            callback(class_name, score, timestamp)
        else : 
            take_action(class_name, score, timestamp) # Just print in terminal


def launchListeningMachine(stream_mode, input_device_id, audio_data=None, callback=None):
    '''Launch the listening machine with the given parameters

    :param stream_mode:  True if the listening machine should listen to the audio stream, False if it should listen to a file
    :type stream_mode: bool
    :param input_device_id: The id of the input device
    :type input_device_id: int
    :param audio_data: The audio data to listen to
    :type audio_data: str
    '''
    segment_duration_ms = 1000  # length of each audio segment in milliseconds
    elapsed_time_ms = 0  # time elapsed since the beginning of the listening


    with audio.AudioClassifier.create_from_options(options) as classifier:
        if stream_mode:
            audio_stream = AudioStream(chunk_size=1024, buffer_duration=10, input_device_index=input_device_id)  # Init audio stream
            audio_stream.start_stream()  # Start audio stream
            try:
                while True:
                    audio_stream.fill_buffer()  # fill the buffer with audio data
                    classification_result_list = classify_audio(audio_stream.audio_buffer, audio_stream.rate, classifier)  # classify the audio data

                    output(classification_result_list, segment_duration_ms, elapsed_time_ms, callback)  # output the classification results
                    elapsed_time_ms += segment_duration_ms  # update the elapsed time
                    time.sleep(segment_duration_ms / 1000)  # wait for the next segment

            except KeyboardInterrupt:
                audio_stream.stop_stream()
        else:
            sample_rate, wav_data = wavfile.read(audio_data)  # read the audio file
            audio_clip = containers.AudioData.create_from_array(
                wav_data.astype(float) / np.iinfo(np.int16).max, sample_rate)  # create an audio clip from audio array returned by wavfile.read()
            classification_result_list = classifier.classify(audio_clip)

            output(classification_result_list, segment_duration_ms, elapsed_time_ms, callback)