import sys

from PySide6.QtWidgets import QApplication

from core.app.app_logging import setup_logging
from ui.main_window import MainWindow


def run() -> None:
    setup_logging()

    app = QApplication(sys.argv)

    window = MainWindow()
    window.show()

    sys.exit(app.exec())
