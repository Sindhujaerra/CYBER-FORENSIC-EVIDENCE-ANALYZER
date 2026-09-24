import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from tkinter.scrolledtext import ScrolledText
from tkinterdnd2 import TkinterDnD, DND_FILES
from PIL import Image, ImageTk
from stegano import lsb
from cryptography.fernet import Fernet
import base64, hashlib, os
import pygame.mixer
import customtkinter as ctk 
import webbrowser
MARKER = b"::hiddenmsg::"

class SteganographyApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Steganography App")
        self.root.attributes('-fullscreen', True)
        self.root.bind("<Escape>", lambda e: self.root.attributes("-fullscreen", False))

        self.bg_main = ImageTk.PhotoImage(Image.open("bg.jpg").resize((self.root.winfo_screenwidth(), self.root.winfo_screenheight())))
        self.bg_media = ImageTk.PhotoImage(Image.open("bg3.jpg").resize((self.root.winfo_screenwidth(), self.root.winfo_screenheight())))
        self.bg_encrypt = ImageTk.PhotoImage(Image.open("bg_encrypt.jpg").resize((self.root.winfo_screenwidth(), self.root.winfo_screenheight())))
        self.bg_reveal = ImageTk.PhotoImage(Image.open("bg_reveal.png").resize((self.root.winfo_screenwidth(), self.root.winfo_screenheight())))

        self.filename = None
        self.filetype = None
        self.secret = None
        self.reveal_file_path = None

        pygame.mixer.init()
        self.show_main_menu()

    def clear_screen(self, bg=None):
        for widget in self.root.winfo_children():
            widget.destroy()
        bg_img = bg if bg else self.bg_main
        self.background_label = tk.Label(self.root, image=bg_img)
        self.background_label.image = bg_img
        self.background_label.place(x=0, y=0, relwidth=1, relheight=1)

    def fade_in(self, func, *args):
        self.root.attributes("-alpha", 0.0)
        func(*args)
        for i in range(0, 11):
            self.root.after(i * 30, lambda i=i: self.root.attributes("-alpha", i / 10.0))

    def show_main_menu(self):
        self.fade_in(self._show_main_menu)

    def _show_main_menu(self):
        self.clear_screen(self.bg_main)

        # Top-right buttons
        top_frame = ctk.CTkFrame(self.root, fg_color="transparent")
        top_frame.place(relx=1.0, x=-10, y=10, anchor="ne")

        minimize_btn = tk.Button(top_frame, text="_", font=("Arial", 9, "bold"),
                                 command=lambda: self.root.iconify(), bg="lightgray", relief="groove", bd=1, width=4)
        minimize_btn.pack(side="left", padx=2)

        menu_btn = tk.Button(top_frame, text="☰", font=("Arial", 9, "bold"),
                             command=self.show_help, bg="lightgray", relief="groove", bd=1, width=4)
        menu_btn.pack(side="left", padx=2)

        exit_btn = tk.Button(top_frame, text="X", font=("Arial", 9, "bold"),
                             command=self.root.quit, bg="red", fg="white", relief="groove", bd=1, width=4)
        exit_btn.pack(side="left", padx=2)

        # Logo and Title
        self.logo_img = ImageTk.PhotoImage(Image.open("logo.png").resize((100, 100)))
        tk.Label(self.root, image=self.logo_img, bg="white").pack(pady=30)

        tk.Label(self.root, text="STEGANOGRAPHY", font=("Castellar", 40, "bold"), fg="red", bg="white").pack(pady=20)
        tk.Label(self.root, text="WELCOME USER", font=("Arial", 18, "bold"), fg="blue", bg="white").pack(pady=10)

        # Main frame
        self.current_frame = ctk.CTkFrame(self.root, corner_radius=15, fg_color=("transparent"), width=800, height=500)
        self.current_frame.place(relx=0.5, rely=0.5, anchor="center")

        # Button container for side-by-side layout
        button_container = ctk.CTkFrame(self.current_frame, fg_color="transparent")
        button_container.pack(pady=10)

        # Side-by-side buttons
        btn1 = ctk.CTkButton(button_container, text="ENCRYPT", width=300, height=40, command=self.show_encrypt_screen)
        btn2 = ctk.CTkButton(button_container, text="Reveal & Decrypt", width=300, height=40, command=self.show_reveal_screen)

        btn1.pack(side="left", padx=10)
        btn2.pack(side="left", padx=10)

        # Footer
        
        # Social Links Frame
        footer_frame = tk.Frame(self.root, bg="white")
        footer_frame.pack(side="bottom", pady=10)

        # Footer text
        tk.Label(
        footer_frame,
        text="Contact us on:",
        font=("Arial", 12),
        fg="black",
        bg="white"
        ).pack(side="left")

        # LinkedIn link
        linkedin_label = tk.Label(
        footer_frame,
        text="LinkedIn",
        font=("Arial", 12, "underline"),
        fg="blue",
        bg="white",
        cursor="hand2"
        )
        linkedin_label.pack(side="left", padx=5)
        linkedin_label.bind("<Button-1>", lambda e: webbrowser.open_new("https://www.linkedin.com/in/swaranjith-goud-5590302aa"))

        # GitHub link
        github_label = tk.Label(
        footer_frame,
        text="GitHub",
        font=("Arial", 12, "underline"),
        fg="blue",
        bg="white",
        cursor="hand2"
        )
        github_label.pack(side="left", padx=5)
        github_label.bind("<Button-1>", lambda e: webbrowser.open_new("https://github.com/swaran14"))


        # Created by text
        tk.Label(
        self.root,
        text="Created by E SINDHUJA REDDY, A. SWARANJITH GOUD, D PAVAN KUMAR, A VASANTH KUMAR",
        font=("Arial", 10),
        fg="black",
        bg="white"
        ).pack(side="bottom", pady=5)

    def show_help(self):
        help_window = tk.Toplevel(self.root)
        help_window.title("Help")
        help_window.geometry("400x300")
        help_text = (
            "Contact us at:\n"
            "Email: akulaswaranjith@gmail.com\n"
            "Phone: 7569686603\n"
            "Email: sindhujareddyerra@gmail.com\n"
            "phone: 8309777128\n"
        )
        tk.Label(help_window, text=help_text, font=("Arial", 12), fg="black").pack(pady=30)

    def show_media_options(self):
        self.fade_in(self._show_media_options)

    def _show_media_options(self):
        self.clear_screen(self.bg_media)
        tk.Label(self.root, text="Choose Media Type", font=("Arial", 30, "bold"), bg="#ffe414", fg="black").pack(pady=50)

        button_container = ctk.CTkFrame(self.current_frame, fg_color="transparent")
        button_container.pack(pady=10)

        ctk.CTkButton(self.root, text="Photo", command=self.load_photo, **button_style).pack(pady=10)
        ctk.CTkButton(self.root, text="Video", command=self.load_video, **button_style).pack(pady=10)
        ctk.CTkButton(self.root, text="Audio", command=self.load_audio, **button_style).pack(pady=10)
        ctk.CTkButton(self.root, text="Back", command=self.show_main_menu, font=("Arial", 12), bg="gray", fg="white").pack(pady=30)

    def display_selected_media(self, path, type_):
        self.filename = path
        self.filetype = type_
        self.fade_in(self._display_selected_media)

    def _display_selected_media(self):
        self.clear_screen(self.bg_media)
        if self.filetype == "image":
            img = Image.open(self.filename)
            img.thumbnail((500, 500))
            self.tk_img = ImageTk.PhotoImage(img)
            tk.Label(self.root, image=self.tk_img).pack(pady=20)
        else:
            tk.Label(self.root, text=f"{self.filetype.capitalize()} Selected:\n{self.filename}", font=("Arial", 18), bg="white").pack(pady=30)
            ttk.Button(self.root, text="Play", command=self.play_media).pack(pady=5)

        ttk.Button(self.root, text="Encrypt & Hide", command=self.show_encrypt_screen).pack(pady=40)
        ttk.Button(self.root, text="Back", command=self.show_media_options).pack(pady=10)

    def play_media(self):
        if self.filetype == "audio":
            pygame.mixer.music.load(self.filename)
            pygame.mixer.music.play()
        elif self.filetype == "video":
            os.system(f'start "" "{self.filename}"')

    def load_photo(self):
        path = filedialog.askopenfilename(filetypes=[("Image Files", "*.png;*.jpg;*.jpeg")])
        if path:
            self.display_selected_media(path, "image")

    def load_video(self):
        path = filedialog.askopenfilename(filetypes=[("Video Files", "*.mp4;*.avi;*.mov")])
        if path:
            self.display_selected_media(path, "video")

    def load_audio(self):
        path = filedialog.askopenfilename(filetypes=[("Audio Files", "*.mp3;*.wav")])
        if path:
            self.display_selected_media(path, "audio")

    def generate_key(self, password):
        return base64.urlsafe_b64encode(hashlib.sha256(password.encode()).digest())

    def show_encrypt_screen(self):
        self.fade_in(self._show_encrypt_screen)

    def _show_encrypt_screen(self):
        self.clear_screen(self.bg_encrypt)
        tk.Label(self.root, text="Encrypt and Hide", font=("Arial", 30, "bold"), fg="black").pack(pady=20)

        button_frame = tk.Frame(self.root, bg="#ffffff")
        button_frame.pack(pady=20)

        if self.filetype == "image":
            img = Image.open(self.filename)
            img.thumbnail((400, 400))
            self.tk_img = ImageTk.PhotoImage(img)
            tk.Label(self.root, image=self.tk_img).pack(pady=20)

        tk.Label(self.root, text="Password:", font=("Arial", 14)).pack()
        self.password_entry = ttk.Entry(self.root, show="*")
        self.password_entry.pack(pady=5)

        self.message_input = ScrolledText(self.root, width=80, height=10, font=("Arial", 12))
        self.message_input.pack(pady=20)

        if self.filetype == "image":
            ttk.Button(button_frame, text="Encrypt & Hide", command=self.encrypt_and_hide).pack(side="left", padx=10)
            ttk.Button(button_frame, text="Save Image", command=self.save_image).pack(side="left", padx=10)
        else:
            ttk.Button(button_frame, text="Encrypt & Save", command=lambda: self.encrypt_file(self.filename, self.password_entry.get())).pack(side="left", padx=10)

        tk.Button(button_frame, text="Back", command=self.show_main_menu, font=("Arial", 12), bg="gray", fg="white").pack(side="left", padx=10)

    def play_media(self):
        if self.filetype == "audio":
            pygame.mixer.music.load(self.filename)
            pygame.mixer.music.play()
        elif self.filetype == "video":
            os.system(f'start "" "{self.filename}"')

    def load_photo(self):
        path = filedialog.askopenfilename(filetypes=[("Image Files", "*.png;*.jpg;*.jpeg")])
        if path:
            self.display_selected_media(path, "image")

    def load_video(self):
        path = filedialog.askopenfilename(filetypes=[("Video Files", "*.mp4;*.avi;*.mov")])
        if path:
            self.display_selected_media(path, "video")

    def load_audio(self):
        path = filedialog.askopenfilename(filetypes=[("Audio Files", "*.mp3;*.wav")])
        if path:
            self.display_selected_media(path, "audio")

    def generate_key(self, password):
        return base64.urlsafe_b64encode(hashlib.sha256(password.encode()).digest())

    def show_encrypt_screen(self):
        self.fade_in(self._show_encrypt_screen)

    def _show_encrypt_screen(self):
        self.clear_screen(self.bg_encrypt)
        tk.Label(self.root, text="Encrypt and Hide", font=("Arial", 30, "bold"), fg="black").pack(pady=20)

        button_frame = tk.Frame(self.root, bg="#ffffff")
        button_frame.pack(pady=20)

        if self.filetype == "image":
            img = Image.open(self.filename)
            img.thumbnail((400, 400))
            self.tk_img = ImageTk.PhotoImage(img)
            tk.Label(self.root, image=self.tk_img).pack(pady=20)

        tk.Label(self.root, text="Password:", font=("Arial", 14)).pack()
        self.password_entry = ttk.Entry(self.root, show="*")
        self.password_entry.pack(pady=5)

        self.message_input = ScrolledText(self.root, width=80, height=10, font=("Arial", 12))
        self.message_input.pack(pady=20)

        if self.filetype == "image":
            ttk.Button(button_frame, text="Encrypt & Hide", command=self.encrypt_and_hide).pack(side="left", padx=10)
            ttk.Button(button_frame, text="Save Image", command=self.save_image).pack(side="left", padx=10)
        else:
            ttk.Button(button_frame, text="Encrypt & Save", command=lambda: self.encrypt_file(self.filename, self.password_entry.get())).pack(side="left", padx=10)

        tk.Button(button_frame, text="Back", command=self.show_main_menu, font=("Arial", 12), bg="gray", fg="white").pack(side="left", padx=10)

    def encrypt_and_hide(self):
        try:
            password = self.password_entry.get().strip()
            message = self.message_input.get("1.0", tk.END).strip()
            if not message:
                messagebox.showwarning("Warning", "Message is empty.")
                return
            if password:
                key = self.generate_key(password)
                cipher = Fernet(key)
                message = cipher.encrypt(message.encode()).decode()
            self.secret = lsb.hide(self.filename, message)
            messagebox.showinfo("Success", "Message hidden successfully.")
        except Exception as e:
            messagebox.showerror("Error", f"Hiding failed: {e}")

    def save_image(self):
        if not self.secret:
            messagebox.showwarning("Warning", "Please hide a message first.")
            return
        path = filedialog.asksaveasfilename(defaultextension=".png", filetypes=[("PNG Files", "*.png")])
        if path:
            self.secret.save(path)
            messagebox.showinfo("Saved", f"Image saved to {path}")

    def encrypt_file(self, filepath, password):
        try:
            key = self.generate_key(password)
            cipher = Fernet(key)
            message = self.message_input.get("1.0", tk.END).strip()
            encrypted_message = cipher.encrypt(message.encode()) if message else b""
            with open(filepath, 'rb') as file:
                data = file.read()
            final_data = data + MARKER + encrypted_message if encrypted_message else cipher.encrypt(data)
            save_path = filedialog.asksaveasfilename(defaultextension=".enc", filetypes=[("Encrypted Files", "*.enc")])
            if save_path:
                with open(save_path, 'wb') as file:
                    file.write(final_data)
                messagebox.showinfo("Success", f"Encrypted file saved to:\n{save_path}")
        except Exception as e:
            messagebox.showerror("Error", f"Encryption failed: {e}")

    def show_reveal_screen(self):
        self.fade_in(self._show_reveal_screen)

    def _show_reveal_screen(self):
        self.clear_screen(self.bg_reveal)
        tk.Label(self.root, text="Reveal & Decrypt", font=("Arial", 30, "bold"), fg="black").pack(pady=20)
        ttk.Button(self.root, text="Upload Image (with message)", command=self.load_image).pack(pady=5)
        ttk.Button(self.root, text="Upload Encrypted File (.enc)", command=self.load_encrypted_file).pack(pady=5)
        self.revealed_message = ScrolledText(self.root, width=80, height=10, font=("Arial", 12))
        self.revealed_message.pack(pady=10)
        tk.Label(self.root, text="Password:", font=("Arial", 14)).pack()
        self.reveal_password_entry = ttk.Entry(self.root, show="*")
        self.reveal_password_entry.pack(pady=5)
        ttk.Button(self.root, text="Reveal Message", command=self.reveal_message).pack(pady=10)
        ttk.Button(self.root, text="Decrypt File", command=self.decrypt_file).pack(pady=5)
        tk.Button(self.root, text="Back", command=self.show_main_menu, font=("Arial", 12), bg="gray", fg="white").pack(pady=20)

    def load_image(self):
        path = filedialog.askopenfilename(filetypes=[("Image Files", "*.png;*.jpg;*.jpeg")])
        if path:
            self.filename = path
            img = Image.open(path)
            img.thumbnail((400, 400))
            self.tk_img = ImageTk.PhotoImage(img)
            tk.Label(self.root, image=self.tk_img).pack(pady=20)

    def load_encrypted_file(self):
        self.reveal_file_path = filedialog.askopenfilename(filetypes=[("Encrypted Files", "*.enc")])
        if self.reveal_file_path:
            tk.Label(self.root, text=f"Loaded File:\n{self.reveal_file_path}", font=("Arial", 12), bg="white").pack()

    def reveal_message(self):
        if not self.filename:
            messagebox.showwarning("Warning", "Please load an image first.")
            return
        try:
            clear_message = lsb.reveal(self.filename)
            if clear_message is None:
                self.revealed_message.insert(tk.END, "No hidden message found.")
                return
            password = self.reveal_password_entry.get().strip()
            if password:
                key = self.generate_key(password)
                cipher = Fernet(key)
                clear_message = cipher.decrypt(clear_message.encode()).decode()
            self.revealed_message.delete("1.0", tk.END)
            self.revealed_message.insert(tk.END, clear_message)
        except Exception as e:
            messagebox.showerror("Error", f"Reveal failed: {e}")

    def decrypt_file(self):
        if not self.reveal_file_path:
            messagebox.showwarning("Warning", "Please upload an encrypted file.")
            return
        password = self.reveal_password_entry.get().strip()
        if not password:
            messagebox.showwarning("Warning", "Enter password before decrypting.")
            return
        try:
            with open(self.reveal_file_path, 'rb') as file:
                content = file.read()
            if MARKER in content:
                data, hidden = content.split(MARKER)
                key = self.generate_key(password)
                message = Fernet(key).decrypt(hidden).decode()
                self.revealed_message.delete("1.0", tk.END)
                self.revealed_message.insert(tk.END, message)
            else:
                decrypted_data = Fernet(self.generate_key(password)).decrypt(content)
                save_path = filedialog.asksaveasfilename(filetypes=[("All Files", "*.*")])
                if save_path:
                    with open(save_path, 'wb') as f:
                        f.write(decrypted_data)
                    messagebox.showinfo("Success", f"Decrypted file saved to:\n{save_path}")
        except Exception as e:
            messagebox.showerror("Error", f"Decryption failed: {e}")

if __name__ == '__main__':
    root = TkinterDnD.Tk()
    app = SteganographyApp(root)
    root.mainloop()
