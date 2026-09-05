from pathlib import Path

from PySide6.QtCore import QSize, Qt
from PySide6.QtGui import QColor, QIcon
from PySide6.QtWidgets import (
    QFrame,
    QGraphicsDropShadowEffect,
    QHBoxLayout,
    QLabel,
    QProgressBar,
    QToolButton,
    QVBoxLayout,
    QWidget,
)


class Card(QFrame):
    def __init__(
        self,
        radius: int = 20,
        blur_radius: int = 30,
        accent: QColor | str | None = None,
        parent: QWidget | None = None,
    ) -> None:
        super().__init__(parent)
        self.blur_radius: int = blur_radius
        self.radius: int = radius

        self.accent: QColor | None = QColor(accent) if accent else None

        self.setup_component()

    def setup_component(self) -> None:
        border_color = "#2a2a2a"

        if self.accent:
            border_color = self.accent.name()

        self.setObjectName("card")
        self.setStyleSheet(f"""
            QFrame#card {{
                background-color: #1e1e1e;
                border: 1px solid {border_color};
                border-radius: {self.radius}px;
            }}
        """)

        shadow = QGraphicsDropShadowEffect(self)
        shadow.setBlurRadius(self.blur_radius)
        shadow.setOffset(0, 6)

        if self.accent:
            color = QColor(self.accent)
            color.setAlpha(120)
        else:
            color = QColor(0, 0, 0, 160)

        shadow.setColor(color)
        self.setGraphicsEffect(shadow)

    def set_accent(self, accent: QColor | str) -> None:
        self.accent = QColor(accent)
        self.setup_component()

    def reset_accent(self) -> None:
        self.accent = None
        self.setup_component()


class VideoUploadCard(QFrame):
    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)

        self.setup_component()

    def setup_component(self) -> None:
        self.setObjectName("videoUploadCard")
        self.setStyleSheet("""
            QFrame#videoUploadCard {
                background-color: #242424;
                border-radius: 10px;
            }
        """)

        self.title_lbl = QLabel("Minecraft 2026/06/04 11:31:31")
        self.title_lbl.setToolTip("Upload ID: d5ad3719dbb5be36")
        self.title_lbl.setStyleSheet("""
            QLabel {
                font-size: 17px;
                font-weight: 600;
                color: white;
            }
        """)

        self.duration_lbl = QLabel("• 1:41:22")
        self.duration_lbl.setStyleSheet("""
            QLabel {
                font-size: 13px;
                color: #aaa;
            }
        """)

        self.filename_lbl = QLabel("MedalTVMinecraft20260604113131640.mp4")
        self.filename_lbl.setStyleSheet("""
            QLabel {
                font-size: 13px;
                color: #8a8a8a;
            }
        """)

        base_dir = Path(__file__).resolve().parent.parent
        icon_path = base_dir / "assets" / "icons"

        self.cancel_btn = QToolButton()
        self.cancel_btn.setIcon(QIcon(str(icon_path / "trash.png")))
        self.cancel_btn.setIconSize(QSize(16, 16))
        self.cancel_btn.setFixedSize(20, 20)
        self.cancel_btn.setToolTip("Cancel upload")
        self.cancel_btn.setAutoRaise(True)
        self.cancel_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.cancel_btn.setStyleSheet("""
            QToolButton {
                background-color: transparent;
                border: none;
                padding: 0px;
            }
                                        
            QToolButton:hover {
                background-color: transparent;
                border: none;
            }
                                        
            QToolButton:pressed {
                background-color: transparent;
                border: none;
            }
        """)

        self.progress_bar = QProgressBar()
        self.progress_bar.setRange(0, 10000)
        self.progress_bar.setTextVisible(False)
        self.progress_bar.setValue(2000)
        self.progress_bar.setFixedHeight(6)
        self.progress_bar.setStyleSheet("""
            QProgressBar {
                background-color: #3a3a3a;
                border: none;
                border-radius: 3px;
            }

            QProgressBar::chunk {
                background-color: #ff3d00;
                border-radius: 3px;
            }
        """)

        self.status_lbl = QLabel("Uploading... (20%)")
        self.status_lbl.setStyleSheet("""
            QLabel {
                font-size: 13px;
                color: #ccc;
            }
        """)

        self.progress_lbl = QLabel("1575 MB / 7878 MB (5.52 MB/s) • ETA: 5m 22s")
        self.progress_lbl.setStyleSheet("""
            QLabel {
                font-size: 13px;
                color: #ccc;
            }
        """)

        top_hbox = QHBoxLayout()
        top_hbox.addWidget(self.title_lbl)
        top_hbox.addWidget(self.duration_lbl)
        top_hbox.addStretch(1)
        top_hbox.addWidget(self.filename_lbl)
        top_hbox.addWidget(self.cancel_btn)

        bottom_hbox = QHBoxLayout()
        bottom_hbox.addWidget(self.status_lbl)
        bottom_hbox.addStretch(1)
        bottom_hbox.addWidget(self.progress_lbl)

        layout = QVBoxLayout()
        layout.setContentsMargins(16, 12, 16, 12)
        layout.addLayout(top_hbox)
        layout.addSpacing(3)
        layout.addWidget(self.progress_bar)
        layout.addSpacing(3)
        layout.addLayout(bottom_hbox)

        self.setLayout(layout)
