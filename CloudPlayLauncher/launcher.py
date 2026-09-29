from http.server import BaseHTTPRequestHandler, HTTPServer
import subprocess
import json

MOONLIGHT = r"C:\Program Files\Moonlight Game Streaming\Moonlight.exe"

# Tailscale IP of the GAMING PC running Sunshine
HOST = "100.124.137.122"

APP = "Desktop"


class Handler(BaseHTTPRequestHandler):

    def do_GET(self):

        if self.path == "/connect":

            try:
                subprocess.Popen([
                    MOONLIGHT,
                    "stream",
                    HOST,
                    APP
                ])

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()

                self.wfile.write(
                    json.dumps({
                        "success": True,
                        "message": "Moonlight is starting"
                    }).encode()
                )

            except Exception as e:

                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()

                self.wfile.write(
                    json.dumps({
                        "success": False,
                        "error": str(e)
                    }).encode()
                )

        else:
            self.send_response(404)
            self.end_headers()


    def log_message(self, format, *args):
        pass


server = HTTPServer(("127.0.0.1", 8765), Handler)

print("===================================")
print(" CloudPlay Launcher")
print("===================================")
print("Running on http://127.0.0.1:8765")

server.serve_forever()