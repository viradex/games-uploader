from PySide6.QtCore import Qt
from PySide6.QtWidgets import QDialog, QLabel, QVBoxLayout, QWidget


class LogsDialog(QDialog):
    def __init__(self, parent: QWidget | None = None):
        super().__init__(parent)

        self.setup_dialog()

    def setup_dialog(self) -> None:
        self.setWindowTitle("Games Uploader Logs")
        self.resize(800, 500)
        self.setWindowFlags(
            Qt.WindowType.Window
            | Qt.WindowType.WindowMaximizeButtonHint
            | Qt.WindowType.WindowCloseButtonHint
        )

        temp = QLabel("Coming soon!")
        temp.setStyleSheet("font-size: 24px;" "font-weight: 600;")
        temp.setAlignment(Qt.AlignmentFlag.AlignCenter)

        layout = QVBoxLayout()
        layout.addWidget(temp, stretch=1)

        self.setLayout(layout)
