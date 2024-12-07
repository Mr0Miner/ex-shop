import os
import http.server
import socketserver
import threading
import tkinter as tk
from tkinter import messagebox
from pystray import Icon, MenuItem, Menu
from PIL import Image, ImageDraw

# تنظیم پورت و مسیر دایرکتوری
PORT = 8000
DIRECTORY = os.getcwd()  # مسیر فعلی دایرکتوری

class Handler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        path = super().translate_path(path)
        return path

def start_server():
    handler = Handler
    httpd = socketserver.TCPServer(("", PORT), handler)
    print(f"Serving at port {PORT}")
    httpd.serve_forever()

# شروع سرور در یک ترد
def start_server_thread():
    server_thread = threading.Thread(target=start_server)
    server_thread.daemon = True
    server_thread.start()

# بستن سرور
def stop_server():
    try:
        # کاربر را تایید می‌کند
        if messagebox.askyesno("Exit", "Do you really want to stop the server?"):
            os._exit(0)
    except Exception as e:
        print(f"Error stopping the server: {e}")

# ساخت آیکون نوار وظیفه
def create_tray_icon():
    image = Image.new('RGB', (64, 64), color=(255, 255, 255))
    draw = ImageDraw.Draw(image)
    draw.text((10, 10), "Server", fill="black")

    menu = Menu(MenuItem('Quit', stop_server))
    icon = Icon("test", image, "Local Server", menu)
    icon.run()

# رابط کاربری برای نمایش وضعیت سرور
def create_gui():
    root = tk.Tk()
    root.title("Server Status")
    
    label = tk.Label(root, text="Server is running...", padx=20, pady=20)
    label.pack()

    stop_button = tk.Button(root, text="Stop Server", command=stop_server, padx=10, pady=5)
    stop_button.pack()

    root.protocol("WM_DELETE_WINDOW", stop_server)  # بستن با دکمه X

    root.mainloop()

# شروع سرور و رابط کاربری
if __name__ == "__main__":
    start_server_thread()
    create_tray_icon()
    create_gui()
