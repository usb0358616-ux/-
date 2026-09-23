import tkinter as tk
from tkinter import messagebox


APP_NAME = "مكتب معلومات وبيانات"


def show_message():
    messagebox.showinfo(
        "اختبار النظام",
        "تم تشغيل برنامج مكتب معلومات وبيانات بنجاح."
    )


def main():
    root = tk.Tk()

    root.title(APP_NAME)
    root.geometry("1000x650")
    root.minsize(900, 600)

    title = tk.Label(
        root,
        text=APP_NAME,
        font=("Arial", 24, "bold")
    )

    title.pack(pady=40)

    subtitle = tk.Label(
        root,
        text="النظام المركزي لإدارة المعلومات والبيانات",
        font=("Arial", 14)
    )

    subtitle.pack(pady=10)

    button = tk.Button(
        root,
        text="اختبار البرنامج",
        font=("Arial", 14),
        padx=30,
        pady=10,
        command=show_message
    )

    button.pack(pady=40)

    root.mainloop()


if __name__ == "__main__":
    main()
