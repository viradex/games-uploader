import ctypes
import sys
from pathlib import Path

from PySide6.QtCore import Qt
from PySide6.QtGui import QAction, QIcon
from PySide6.QtWidgets import QApplication, QLabel, QMainWindow

WINDOW_WIDTH = 1000
WINDOW_HEIGHT = 600


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()

        self.setMinimumSize(WINDOW_WIDTH, WINDOW_HEIGHT)
        self.setWindowTitle("Games Uploader")

        self.center_window()
        self._setup_icon()
        self._setup_menu_bar()
        self._setup_status_bar()

    def center_window(self) -> None:
        screen = QApplication.primaryScreen().availableGeometry()

        x = (screen.width() - WINDOW_WIDTH) // 2
        y = (screen.height() - WINDOW_HEIGHT) // 2

        self.move(x, y)

    def _setup_icon(self) -> None:
        base_dir = Path(__file__).resolve().parent.parent
        icon_path = base_dir / "ui" / "assets" / "icons" / "icon.ico"

        self.setWindowIcon(QIcon(str(icon_path)))

        # Set icon on taskbar
        if sys.platform == "win32":
            ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID(
                "com.viradex.gamesuploader"
            )

    def _setup_menu_bar(self) -> None:
        menu_bar = self.menuBar()

        # File
        file_menu = menu_bar.addMenu("File")

        logs_action = QAction("View Logs", self)
        settings_action = QAction("Settings", self)
        exit_action = QAction("Exit", self)

        exit_action.triggered.connect(QApplication.exit)

        file_menu.addAction(logs_action)
        file_menu.addAction(settings_action)
        file_menu.addSeparator()
        file_menu.addAction(exit_action)

        # Videos
        videos_menu = menu_bar.addMenu("Videos")

        upload_action = QAction("Upload Videos", self)
        combine_action = QAction("Combine Videos", self)
        cancel_current_action = QAction("Cancel Current Upload", self, enabled=False)
        cancel_pending_action = QAction("Cancel Pending Uploads", self, enabled=False)
        cancel_all_action = QAction("Cancel All Uploads", self, enabled=False)

        videos_menu.addAction(upload_action)
        videos_menu.addAction(combine_action)
        videos_menu.addSeparator()
        videos_menu.addAction(cancel_current_action)
        videos_menu.addAction(cancel_pending_action)
        videos_menu.addAction(cancel_all_action)

        # Window
        window_menu = menu_bar.addMenu("Window")

        minimize_action = QAction("Minimize", self)
        maximize_action = QAction("Maximize", self)
        restore_action = QAction("Restore", self)
        always_on_top_action = QAction(
            "Always on Top", self, checkable=True, checked=False
        )

        minimize_action.triggered.connect(self.showMinimized)
        maximize_action.triggered.connect(self.showMaximized)
        restore_action.triggered.connect(self.showNormal)
        always_on_top_action.triggered.connect(self._always_on_top)

        window_menu.addAction(minimize_action)
        window_menu.addAction(maximize_action)
        window_menu.addAction(restore_action)
        window_menu.addSeparator()
        window_menu.addAction(always_on_top_action)

        # Help
        help_menu = menu_bar.addMenu("Help")

        documentation_action = QAction("Documentation", self)
        report_issue_action = QAction("Report an Issue", self)
        about_qt_action = QAction("About Qt", self)
        about_action = QAction("About Games Uploader", self)

        about_qt_action.triggered.connect(QApplication.aboutQt)

        help_menu.addAction(documentation_action)
        help_menu.addAction(report_issue_action)
        help_menu.addSeparator()
        help_menu.addAction(about_qt_action)
        help_menu.addAction(about_action)

    def _always_on_top(self, checked: bool) -> None:
        self.setWindowFlag(Qt.WindowType.WindowStaysOnTopHint, checked)
        self.hide()
        self.show()

    def _setup_status_bar(self) -> None:
        # FIXME status bar disappears when hovering over menu bar
        status_bar = self.statusBar()
        status_bar.setSizeGripEnabled(False)

        status_label = QLabel("Ready")
        status_label.setStyleSheet("padding-left: 4px;" "padding-bottom: 4px;")
        status_bar.addWidget(status_label, stretch=1)
