from PySide6.QtCore import Qt, QTimer
from PySide6.QtGui import QColor, QPainter, QPaintEvent, QPen
from PySide6.QtWidgets import QWidget

ARC_LENGTH = 120


class Spinner(QWidget):
    def __init__(
        self,
        size: int,
        interval_ms: int = 20,
        color: QColor | str | None = None,
        parent: QWidget | None = None,
    ) -> None:
        super().__init__(parent)
        self.interval_ms: int = interval_ms
        self.color: QColor = QColor(color) if color is not None else QColor("#fff")
        self._angle: int = 0

        self.setFixedSize(size, size)

        self._setup_timer()

    def _setup_timer(self) -> None:
        self.timer = QTimer(self)
        self.timer.setInterval(self.interval_ms)
        self.timer.timeout.connect(self._rotate)

    def start(self) -> None:
        if not self.timer.isActive():
            self.timer.start()

    def stop(self) -> None:
        self.timer.stop()

    def paintEvent(self, event: QPaintEvent) -> None:
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)

        thickness = max(2, self.width() // 18)
        margin = thickness + 2

        pen = QPen(self.color, thickness)
        pen.setCapStyle(Qt.PenCapStyle.RoundCap)
        painter.setPen(pen)

        rect = self.rect().adjusted(margin, margin, -margin, -margin)
        painter.drawArc(rect, int(self._angle * 16), int(ARC_LENGTH * 16))

    def _rotate(self) -> None:
        self._angle = (self._angle - 6) % 360
        self.update()
