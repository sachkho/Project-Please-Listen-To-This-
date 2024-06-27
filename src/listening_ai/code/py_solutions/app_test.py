import sys
from PyQt5.QtWidgets import (QApplication, QWidget, QVBoxLayout, QLabel, QRadioButton, QPushButton, QFileDialog,
                             QMessageBox, QInputDialog, QTextEdit)
from PyQt5.QtCore import pyqtSlot, QThread, pyqtSignal
import matplotlib.pyplot as plt

from audio_processing import list_input_devices, launchListeningMachine

class ClassificationThread(QThread):
    result_signal = pyqtSignal(str, float, float)

    def __init__(self, stream_mode, input_device_id, audio_data, class_distribution_graph):
        super().__init__()
        self.stream_mode = stream_mode
        self.input_device_id = input_device_id
        self.audio_data = audio_data
        self.class_distribution_graph = class_distribution_graph
        self.classification_results = []

    def run(self):
        launchListeningMachine(self.stream_mode, self.input_device_id, self.audio_data, self.emit_result)

    def emit_result(self, class_name, score, timestamp):
        self.classification_results.append((class_name, score, timestamp))
        self.result_signal.emit(class_name, score, timestamp)
        self.class_distribution_graph.add_classification(class_name)

    def get_classification_results(self):
        return self.classification_results

class ClassDistributionGraph:
    def __init__(self):
        self.class_counts = {}

    def add_classification(self, class_name):
        if class_name in self.class_counts:
            self.class_counts[class_name] += 1
        else:
            self.class_counts[class_name] = 1

    def generate_and_display_graph(self):
        plt.figure(figsize=(10, 6))
        plt.bar(self.class_counts.keys(), self.class_counts.values(), color='skyblue')
        plt.xlabel('Class Name')
        plt.ylabel('Count')
        plt.title('Class Distribution')
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.show()

class AudioApp(QWidget):
    def __init__(self):
        super().__init__()
        
        self.stream_mode = None
        self.input_device_id = None
        self.audio_data = None
        self.classification_thread = None
        self.class_distribution_graph = ClassDistributionGraph()
        
        self.initUI()
    
    def initUI(self):
        layout = QVBoxLayout()
        
        self.mode_label = QLabel("Select Mode:", self)
        layout.addWidget(self.mode_label)
        
        self.stream_mode_radio = QRadioButton("Stream Mode", self)
        self.stream_mode_radio.clicked.connect(self.select_mode)
        layout.addWidget(self.stream_mode_radio)
        
        self.file_mode_radio = QRadioButton("File Mode", self)
        self.file_mode_radio.clicked.connect(self.select_mode)
        layout.addWidget(self.file_mode_radio)
        
        self.device_button = QPushButton("Select Input Device", self)
        self.device_button.clicked.connect(self.select_input_device)
        self.device_button.setEnabled(False)
        layout.addWidget(self.device_button)
        
        self.file_button = QPushButton("Select Audio File", self)
        self.file_button.clicked.connect(self.select_audio_file)
        self.file_button.setEnabled(False)
        layout.addWidget(self.file_button)
        
        self.start_button = QPushButton("Start Classification", self)
        self.start_button.clicked.connect(self.start_classification)
        layout.addWidget(self.start_button)
        
        self.stop_button = QPushButton("Stop Classification", self)
        self.stop_button.clicked.connect(self.stop_classification)
        self.stop_button.setEnabled(False)
        layout.addWidget(self.stop_button)
        
        self.results_text = QTextEdit(self)
        self.results_text.setReadOnly(True)
        layout.addWidget(self.results_text)
        
        self.setLayout(layout)
        self.setWindowTitle('Audio Classification App')
        self.show()
    
    @pyqtSlot()
    def select_mode(self):
        if self.stream_mode_radio.isChecked():
            self.stream_mode = True
            self.device_button.setEnabled(True)
            self.file_button.setEnabled(False)
        elif self.file_mode_radio.isChecked():
            self.stream_mode = False
            self.device_button.setEnabled(False)
            self.file_button.setEnabled(True)
    
    @pyqtSlot()
    def select_input_device(self):
        devices = list_input_devices()
        device_list = "\n".join([f"ID: {d[0]}, Name: {d[1]}" for d in devices])
        device_id, ok = QInputDialog.getInt(self, "Select Input Device", f"Available devices:\n{device_list}\nEnter device ID:")
        if ok:
            self.input_device_id = device_id
    
    @pyqtSlot()
    def select_audio_file(self):
        options = QFileDialog.Options()
        file_path, _ = QFileDialog.getOpenFileName(self, "Select Audio File", "", "Audio Files (*.wav);;All Files (*)", options=options)
        if file_path:
            self.audio_data = file_path
    
    @pyqtSlot()
    def start_classification(self):
        if self.stream_mode and self.input_device_id is None:
            QMessageBox.critical(self, "Error", "Please select an input device.")
        elif not self.stream_mode and self.audio_data is None:
            QMessageBox.critical(self, "Error", "Please select an audio file.")
        else:
            self.classification_thread = ClassificationThread(self.stream_mode, self.input_device_id, self.audio_data, self.class_distribution_graph)
            self.classification_thread.result_signal.connect(self.display_results)
            self.classification_thread.start()
            self.start_button.setEnabled(False)
            self.stop_button.setEnabled(True)
    
    @pyqtSlot()
    def stop_classification(self):
        if self.classification_thread:
            self.classification_thread.terminate()  # Terminates the thread
            self.start_button.setEnabled(True)
            self.stop_button.setEnabled(False)
            self.class_distribution_graph.generate_and_display_graph()

    @pyqtSlot(str, float, float)
    def display_results(self, class_name, score, timestamp):
        result = f"Timestamp: {timestamp / 1000:.2f}s\nClass: {class_name}, Score: {score:.2f}\n"
        self.results_text.append(result)

if __name__ == '__main__':
    app = QApplication(sys.argv)
    ex = AudioApp()
    sys.exit(app.exec_())
