import pyaudio

def list_input_devices():
    """List all available input devices."""
    p = pyaudio.PyAudio()
    for i in range(p.get_device_count()):
        dev = p.get_device_info_by_index(i)
        if dev['maxInputChannels'] > 0:
            print(f"Device ID: {i}, Name: {dev['name']}")
    p.terminate()


list_input_devices() # Launch the function
