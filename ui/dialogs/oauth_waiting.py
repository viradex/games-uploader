from PySide6.QtCore import Qt
from PySide6.QtWidgets import QDialog, QHBoxLayout, QLabel, QWidget

from ui.components.spinner import Spinner


class OAuthWaitingDialog(QDialog):
    def __init__(self, parent: QWidget | None = None):
        super().__init__(parent)

        self.setup_dialog()

    def setup_dialog(self) -> None:
        self.setWindowTitle("OAuth Flow")
        self.setFixedSize(300, 60)

        self.setWindowFlags(self.windowFlags() & ~Qt.WindowCloseButtonHint)

        spinner = Spinner(25)
        spinner.start()

        status = QLabel("Waiting for authorization...")
        status.setStyleSheet("font-size: 14px; font-weight: 600;")

        layout = QHBoxLayout()
        layout.addStretch()
        layout.addWidget(spinner)
        layout.addSpacing(5)
        layout.addWidget(status)
        layout.addStretch()

        self.setLayout(layout)
