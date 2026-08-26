from PySide6.QtGui import QColor
from PySide6.QtWidgets import QFrame, QGraphicsDropShadowEffect, QWidget


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
