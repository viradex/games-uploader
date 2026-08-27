import logging

from PySide6.QtGui import QColor, QFont, QTextCharFormat, QTextCursor
from PySide6.QtWidgets import QPlainTextEdit

LEVEL_COLORS = {
    logging.DEBUG: "#808080",
    logging.INFO: "#D4D4D4",
    logging.WARNING: "#E5C07B",
    logging.ERROR: "#F44747",
    logging.CRITICAL: "#FF6B6B",
}


class LogViewer(QPlainTextEdit):
    def __init__(self, parent=None):
        super().__init__(parent)

        self.setup_component()

    def setup_component(self) -> None:
        self.setReadOnly(True)
        self.setLineWrapMode(QPlainTextEdit.LineWrapMode.NoWrap)

        self.setFont(QFont("Cascadia Mono", 10))

        self.setStyleSheet("""
            QPlainTextEdit {
                background-color: #0D0D0D;
                border: 1px solid #2A2A2A;
                border-radius: 6px;
                padding: 6px;
            }
        """)

        self.setMaximumBlockCount(5000)

    def add_log(self, message: str, level: int):
        color = LEVEL_COLORS.get(
            level,
            "#D4D4D4",
        )

        text_format = QTextCharFormat()
        text_format.setForeground(QColor(color))

        if level == logging.CRITICAL:
            text_format.setFontWeight(QFont.Weight.Bold)

        cursor = self.textCursor()
        cursor.movePosition(QTextCursor.MoveOperation.End)
        cursor.insertText(
            message + "\n",
            text_format,
        )

        self.setTextCursor(cursor)
        self.ensureCursorVisible()
