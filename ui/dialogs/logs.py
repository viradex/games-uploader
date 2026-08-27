from PySide6.QtCore import Qt
from PySide6.QtWidgets import QDialog, QVBoxLayout, QWidget

from ui.components.log_viewer import LogViewer


class LogsDialog(QDialog):
    def __init__(self, log_viewer: LogViewer, parent: QWidget | None = None):
        super().__init__(parent)

        self.log_viewer = log_viewer

        self.setup_dialog()

    def setup_dialog(self) -> None:
        self.setWindowTitle("Games Uploader Logs")
        self.resize(800, 500)
        self.setWindowFlags(
            Qt.WindowType.Window
            | Qt.WindowType.WindowMaximizeButtonHint
            | Qt.WindowType.WindowCloseButtonHint
        )

        layout = QVBoxLayout()
        layout.addWidget(self.log_viewer, stretch=1)

        self.setLayout(layout)
