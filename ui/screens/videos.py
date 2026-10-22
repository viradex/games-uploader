from PySide6.QtCore import Qt
from PySide6.QtWidgets import (
    QFileDialog,
    QPushButton,
    QScrollArea,
    QVBoxLayout,
    QWidget,
)

from ui.components.card import Card, VideoUploadCard


class VideosScreen(QWidget):
    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)

        self.setup_ui()

    def setup_ui(self) -> None:
        self.upload_videos_btn = QPushButton("Upload Videos...")
        self.upload_videos_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.upload_videos_btn.setStyleSheet("font-size: 13px;")
        self.upload_videos_btn.setFixedHeight(35)
        self.upload_videos_btn.clicked.connect(self._on_upload_videos)

        self.videos_card = Card(radius=10)

        self.scroll_area = QScrollArea()
        self.scroll_area.setWidgetResizable(True)
        self.scroll_area.setFrameShape(QScrollArea.Shape.NoFrame)

        self.scroll_contents = QWidget()
        self.scroll_area.setWidget(self.scroll_contents)

        self.quiz_vbox = QVBoxLayout(self.scroll_contents)
        self.quiz_vbox.setSpacing(15)

        # TODO temp
        self.quiz_vbox.addWidget(VideoUploadCard())
        self.quiz_vbox.addStretch(1)

        card_vbox = QVBoxLayout(self.videos_card)
        card_vbox.addWidget(self.scroll_area)

        layout = QVBoxLayout()
        layout.setContentsMargins(30, 20, 30, 20)
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
