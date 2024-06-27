import pyaudio

def list_input_devices():
    """List all available input devices."""
    p = pyaudio.PyAudio()
    devices = []
    for i in range(p.get_device_count()):
        dev = p.get_device_info_by_index(i)
        if dev['maxInputChannels'] > 0:
            devices.append((i, dev['name']))
    p.terminate()
    return devices
