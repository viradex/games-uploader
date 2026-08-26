from PySide6.QtCore import Qt
from PySide6.QtWidgets import QFileDialog, QPushButton, QVBoxLayout, QWidget

from ui.components.card import Card


class VideosScreen(QWidget):
    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)

        self.setup_ui()

    def setup_ui(self) -> None:
        self.upload_videos_btn = QPushButton("Upload Videos...")
        self.upload_videos_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.upload_videos_btn.setStyleSheet("font-size: 14px;")
        self.upload_videos_btn.setFixedHeight(35)
        self.upload_videos_btn.clicked.connect(self._on_upload_videos)

        self.videos_card = Card(radius=10)

        layout = QVBoxLayout()
        layout.setContentsMargins(40, 20, 40, 20)
        layout.addWidget(self.upload_videos_btn)
        layout.addSpacing(10)
        layout.addWidget(self.videos_card, stretch=1)

        self.setLayout(layout)

    def _on_upload_videos(self) -> None:
        video_filter = "Video Files (*.mp4 *.mov *.avi *.wmv *.flv *.webm)"
        file_paths, _ = QFileDialog.getOpenFileNames(
            self, "Select Videos", "", video_filter
        )

        if file_paths:
            print(f"User selected {len(file_paths)} files:")
            for path in file_paths:
                print(f"- {path}")
