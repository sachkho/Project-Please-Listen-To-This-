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

import numpy as np
from mediapipe.tasks.python.components import containers

def classify_audio(audio_data, sample_rate, classifier):
    """Classify audio data using the provided classifier.
    
    :param audio_data: The audio data to classify
    :type audio_data: np.array
    :param sample_rate: The sample rate of the audio data
    :type sample_rate: int
    :param classifier: The classifier to use
    :type classifier: mediapipe.tasks.python.audio.AudioClassifier
    :return: The classification results
    :type: mediapipe.tasks.python.components.containers.classification_result.ClassificationResult
    """
    audio_clip = containers.AudioData.create_from_array(
        audio_data.astype(float) / np.iinfo(np.int16).max, sample_rate)
    classification_result_list = classifier.classify(audio_clip)
    return classification_result_list

 
def output_class(classification_result_list, segment_duration_ms, start_time_ms=0):
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
        take_action(class_name, score, timestamp) # Take action based on the class name and score



def take_action(class_name, score, timestamp):
    """Take action based on the class name and score.
    :param class_name: The class name
    :type class_name: str
    :param score: The score
    :type score: float
    :param timestamp: The timestamp
    :type timestamp: int
    """
    if score > 0.5: 
        print("Class detected:", class_name, score)







