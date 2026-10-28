import sys

from PySide6.QtWidgets import QApplication, QMessageBox

from ui.main_window import MainWindow


def run() -> None:
    app = QApplication(sys.argv)

    _run_compatibility_checks()

    window = MainWindow()
    window.show()

    sys.exit(app.exec())


def _run_compatibility_checks() -> None:
    if sys.platform != "win32":
        QMessageBox.critical(
            None,
            "Compatibility Error",
            "This program only supports the Windows operating system.",
        )
        sys.exit(1)

    if sys.getwindowsversion().build < 22000:
        QMessageBox.warning(
            None,
            "Compatibility Warning",
            "This program is designed for Windows 11. On Windows 10 and earlier, some visual features (such as native dark mode) are unavailable, and UI elements may not render as intended. Continue at your own risk.",
        )
