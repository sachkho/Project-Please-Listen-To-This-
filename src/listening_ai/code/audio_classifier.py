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

# def output_class(classification_result_list, iter):
#     # Result output
#     for idx, timestamp in enumerate(iter):
#         classification_result = classification_result_list[idx]
#         top_category = classification_result.classifications[0].categories[0]
#         # print(f'Timestamp {timestamp}: {top_category.category_name} ({top_category.score:.2f})')
#         take_action(class_name, score, timestamp)

def output_class(classification_result_list, segment_duration_ms, start_time_ms=0):
    # Result output
    for idx, classification_result in enumerate(classification_result_list):
        top_category = classification_result.classifications[0].categories[0]
        class_name = top_category.category_name
        score = top_category.score
        timestamp = start_time_ms + idx * segment_duration_ms
        take_action(class_name, score, timestamp)

def take_action(class_name, score, timestamp):
    if score > 0.5:
        print("Class detected:", class_name, score)
        # if class_name == "Speech":
        #     print("Action for loud speech detected at timestamp", timestamp)
        # elif class_name == "Animal Noise":
        #     print("Action for loud animal noise detected at timestamp", timestamp)
        # elif class_name == "Silence":
        #     print("Action for prolonged silence detected at timestamp", timestamp)
        # elif class_name == "Engine Noise":
        #     print("Action for loud engine noise detected at timestamp", timestamp)
    # Ajoutez d'autres classes et actions ici si nécessaire






