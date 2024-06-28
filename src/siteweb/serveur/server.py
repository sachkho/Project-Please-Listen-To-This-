from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer
import subprocess
import multiprocessing

# Définir le port sur lequel écouter
PORT = 8000

# Créer une classe personnalisée héritant de SimpleHTTPRequestHandler
class CustomHandler(SimpleHTTPRequestHandler):
    # Surcharge de la méthode do_GET pour spécifier le fichier par défaut
    def do_GET(self):
        if self.path == '/':
            self.path = 'html/home_page.html'  # Définir home_page.html comme page par défaut
        return SimpleHTTPRequestHandler.do_GET(self)
    


def run_node_server():
    subprocess.run(['node', 'server.js'], check=True)

if __name__ == '__main__':
    # Démarrer le sous-processus
    node_process = multiprocessing.Process(target=run_node_server)
    node_process.start()

    # Démarrer le serveur TCP sur le port spécifié avec le gestionnaire personnalisé
    with TCPServer(("", PORT), CustomHandler) as httpd:
        print(f"Serving at port {PORT}")
        # Laisser le serveur en écoute indéfiniment
        httpd.serve_forever()
        node_process.join()