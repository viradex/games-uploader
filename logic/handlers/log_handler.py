import logging

from PySide6.QtCore import QObject, Signal


class UILogHandler(QObject, logging.Handler):
    logged = Signal(str, int)

    def emit(self, record: logging.LogRecord):
        try:
            message = self.format(record)
            self.logged.emit(message, record.levelno)
        except Exception:  # noqa: BLE001
            self.handleError(record)
