import numpy as np

def normalize_audio(audio_clip, target_peak=-1.0):
    """Normalize the audio clip to the target peak level.
    :param audio_clip: The audio clip to normalize
    :type audio_clip: np.array
    :param target_peak: The target peak level in dBFS
    :type target_peak: float
    :return: The normalized audio clip
    :type: np.array"""
    
    target_peak_linear = 10 ** (target_peak / 20.0) # Convert target peak from dBFS to a linear scale

    current_peak = np.max(np.abs(audio_clip)) # Find the current peak value in the audio clip
    
    normalization_factor = target_peak_linear / current_peak # Calculate the normalization factor
    
    normalized_audio_clip = audio_clip * normalization_factor # Apply the normalization factor to the audio clip
    
    return normalized_audio_clip
