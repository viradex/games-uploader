import ctypes
import sys
from pathlib import Path

from PySide6.QtCore import Qt
from PySide6.QtGui import QIcon
from PySide6.QtWidgets import (
    QApplication,
    QHBoxLayout,
    QLabel,
    QMainWindow,
    QStackedWidget,
    QStatusBar,
    QVBoxLayout,
    QWidget,
)

from ui.components.menu_bar import ApplicationMenuBar
from ui.components.nav_sidebar import NavigationSidebar
from ui.screens.settings import SettingsScreen
from ui.screens.videos import VideosScreen

WINDOW_WIDTH = 1000
WINDOW_HEIGHT = 600


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()

        self.setMinimumSize(WINDOW_WIDTH, WINDOW_HEIGHT)
        self.setWindowTitle("Games Uploader")

        self.center_window()
        self._setup_icon()
        self._setup_ui()
        self._setup_menu_bar()

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

    def _setup_ui(self) -> None:
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        main_layout = QHBoxLayout(central_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # Sidebar
        self.sidebar = NavigationSidebar()

        base_dir = Path(__file__).resolve().parent.parent
        icon_path = base_dir / "ui" / "assets" / "icons"

        self.games_button = self.sidebar.add_button(
            QIcon(str(icon_path / "icon.ico")), "Videos", checked=True
        )
        self.upload_button = self.sidebar.add_button(
            QIcon(str(icon_path / "settings.png")), "Settings"
        )

        self.sidebar.add_stretch()

        self.logs_button = self.sidebar.add_button(
            QIcon(str(icon_path / "terminal.png")), "Logs", checkable=False
        )

        # Main content area
        content_widget = QWidget()
        content_layout = QVBoxLayout(content_widget)
        content_layout.setContentsMargins(0, 0, 0, 0)
        content_layout.setSpacing(0)

        self.stack = QStackedWidget()

        self.videos_screen = VideosScreen()
        self.settings_screen = SettingsScreen()

        self.stack.addWidget(self.videos_screen)
        self.stack.addWidget(self.settings_screen)

        content_layout.addWidget(self.stack)

        # Status bar inside content area
        self.status_bar = QStatusBar()
        self.status_bar.setSizeGripEnabled(False)

        self.status_label = QLabel("Ready")
        self.status_label.setStyleSheet("padding-left: 8px;" "padding-bottom: 8px;")

        self.status_bar.addWidget(self.status_label, stretch=1)

        content_layout.addWidget(self.status_bar)

        # Put sidebar and content next to each other
        main_layout.addWidget(self.sidebar)
        main_layout.addWidget(content_widget)

        self.stack.setCurrentIndex(0)

    def _setup_menu_bar(self) -> None:
        self.menu_bar = ApplicationMenuBar()
        self.menu_bar.always_on_top_clicked.connect(self._always_on_top)

        self.setMenuBar(self.menu_bar)

    def _always_on_top(self, enable: bool) -> None:
        self.setWindowFlag(Qt.WindowType.WindowStaysOnTopHint, enable)
        self.hide()
        self.show()
