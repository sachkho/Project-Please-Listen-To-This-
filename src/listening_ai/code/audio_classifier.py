import tensorflow_hub as hub
import numpy as np
import mediapipe as mp
import tensorflow as tf
from mediapipe.tasks.python.components import containers



def classify_audio(audio_data, sample_rate, classifier):
    audio_clip = containers.AudioData.create_from_array(
        audio_data.astype(float) / np.iinfo(np.int16).max, sample_rate)
    classification_result_list = classifier.classify(audio_clip)
    return classification_result_list

def output_class(classification_result_list, iter):
    # Result output
    for idx, timestamp in enumerate(iter):
        classification_result = classification_result_list[idx]
        top_category = classification_result.classifications[0].categories[0]
        print(f'Timestamp {timestamp}: {top_category.category_name} ({top_category.score:.2f})')

def take_action(class_name):
    print(f"Class detected: {class_name}")
    if class_name == "Speech":
        print("Action for speech detected")
    # Ajoutez d'autres classes et actions ici






