import ctypes
import logging
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

from core.app.dialog_factory import create_dialog_bundle
from core.app.dialog_ids import Dialog
from core.app.screen_factory import create_screen_bundle
from core.app.screen_ids import Screen
from logic.handlers.log_handler import UILogHandler
from ui.components.log_viewer import LogViewer
from ui.components.menu_bar import ApplicationMenuBar
from ui.components.nav_sidebar import NavigationSidebar

WINDOW_WIDTH = 1000
WINDOW_HEIGHT = 600

logger = logging.getLogger(__name__)


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()

        self._setup_ui_logging()

        self.dialog_widgets = {}
        self.dialog_logic = {}

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

    def _setup_ui_logging(self) -> None:
        self.log_viewer = LogViewer()

        self.ui_log_handler = UILogHandler()
        self.ui_log_handler.setLevel(logging.DEBUG)

        self.ui_log_handler.setFormatter(
            logging.Formatter(
                "(%(asctime)s) [%(levelname)s] %(name)s | %(message)s",
                datefmt="%H:%M:%S",
            )
        )

        self.ui_log_handler.logged.connect(self.log_viewer.add_log)
        logging.getLogger().addHandler(self.ui_log_handler)

    def _setup_ui(self) -> None:
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        main_layout = QHBoxLayout(central_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # Sidebar
        self.sidebar = NavigationSidebar()

        self.videos_screen, self.videos_logic = create_screen_bundle(
            Screen.VIDEOS, self
        )
        self.settings_screen, self.settings_logic = create_screen_bundle(
            Screen.SETTINGS, self
        )

        self.stack = QStackedWidget()
        self.stack.addWidget(self.videos_screen)
        self.stack.addWidget(self.settings_screen)

        base_dir = Path(__file__).resolve().parent.parent
        icon_path = base_dir / "ui" / "assets" / "icons"

        self.videos_button = self.sidebar.add_button(
            QIcon(str(icon_path / "icon.ico")), "Videos", checked=True
        )
        self.videos_button.clicked.connect(lambda: self.go_to(Screen.VIDEOS))

        self.settings_button = self.sidebar.add_button(
            QIcon(str(icon_path / "settings.png")), "Settings"
        )
        self.settings_button.clicked.connect(lambda: self.go_to(Screen.SETTINGS))

        self.sidebar.add_stretch()

        self.logs_button = self.sidebar.add_button(
            QIcon(str(icon_path / "terminal.png")), "Logs", checkable=False
        )
        self.logs_button.clicked.connect(
            lambda: self.open_dialog(Dialog.LOGS, is_modal=False)
        )

        # Main content area
        content_widget = QWidget()
        content_layout = QVBoxLayout(content_widget)
        content_layout.setContentsMargins(0, 0, 0, 0)
        content_layout.setSpacing(0)

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

    def go_to(self, screen: Screen) -> None:
        if screen is Screen.VIDEOS:
            self.stack.setCurrentWidget(self.videos_screen)
        elif screen is Screen.SETTINGS:
            self.stack.setCurrentWidget(self.settings_screen)

    def open_dialog(self, dialog: Dialog, is_modal: bool = True):
        if dialog not in self.dialog_widgets:
            if dialog is Dialog.LOGS:
                widget, logic = create_dialog_bundle(dialog, self, (self.log_viewer,))
            else:
                widget, logic = create_dialog_bundle(dialog, self)

            self.dialog_widgets[dialog] = widget
            self.dialog_logic[dialog] = logic

        if is_modal:
            self.dialog_widgets[dialog].exec()
        else:
            self.dialog_widgets[dialog].show()

    def _setup_menu_bar(self) -> None:
        self.menu_bar = ApplicationMenuBar()
        self.menu_bar.always_on_top_clicked.connect(self._always_on_top)

        self.setMenuBar(self.menu_bar)

    def _always_on_top(self, enable: bool) -> None:
        self.setWindowFlag(Qt.WindowType.WindowStaysOnTopHint, enable)
        self.hide()
        self.show()
