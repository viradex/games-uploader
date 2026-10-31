from PySide6.QtCore import QUrl, Signal
from PySide6.QtGui import QAction, QDesktopServices
from PySide6.QtWidgets import QApplication, QMenuBar, QWidget

from core.app.dialog_ids import Dialog


class ApplicationMenuBar(QMenuBar):
    maximize_clicked = Signal()
    minimize_clicked = Signal()
    restore_clicked = Signal()
    center_window_clicked = Signal()
    always_on_top_clicked = Signal(bool)

    dialog_clicked = Signal(Dialog)

    def __init__(self, parent: QWidget | None = None):
        super().__init__(parent)

        self.setup_ui()

    def setup_ui(self) -> None:
        self.setStyleSheet("""
            QMenuBar {
                background-color: #1f1f1f;
            }
        """)

        # File
        file_menu = self.addMenu("File")

        self.logs_action = QAction("View Logs...", self)
        self.settings_action = QAction("Settings...", self)
        self.exit_action = QAction("Exit", self)

        self.exit_action.triggered.connect(QApplication.exit)

        file_menu.addAction(self.logs_action)
        file_menu.addAction(self.settings_action)
        file_menu.addSeparator()
        file_menu.addAction(self.exit_action)

        # Videos
        videos_menu = self.addMenu("Videos")

        self.upload_action = QAction("Upload Videos...", self)
        self.combine_action = QAction("Combine Videos...", self)
        self.cancel_current_action = QAction(
            "Cancel Current Upload", self, enabled=False
        )
        self.cancel_pending_action = QAction(
            "Cancel Pending Uploads", self, enabled=False
        )
        self.cancel_all_action = QAction("Cancel All Uploads", self, enabled=False)

        videos_menu.addAction(self.upload_action)
        videos_menu.addAction(self.combine_action)
        videos_menu.addSeparator()
        videos_menu.addAction(self.cancel_current_action)
        videos_menu.addAction(self.cancel_pending_action)
        videos_menu.addAction(self.cancel_all_action)

        # Dialogs
        # TODO remove when dialogs have logic
        dialogs_menu = self.addMenu("Dialogs")

        self.dialog_actions = {}

        for dialog in Dialog:
            self.dialog_actions[dialog] = QAction(dialog.name, self)
            self.dialog_actions[dialog].triggered.connect(
                lambda checked=False, dialog=dialog: self.dialog_clicked.emit(dialog)
            )
            dialogs_menu.addAction(self.dialog_actions[dialog])

        # Window
        window_menu = self.addMenu("Window")

        self.maximize_action = QAction("Maximize", self)
        self.minimize_action = QAction("Minimize", self)
        self.restore_action = QAction("Restore", self)
        self.center_action = QAction("Center Window", self)
        self.always_on_top_action = QAction(
            "Always on Top", self, checkable=True, checked=False
        )

        self.maximize_action.triggered.connect(self.maximize_clicked.emit)
        self.minimize_action.triggered.connect(self.minimize_clicked.emit)
        self.restore_action.triggered.connect(self.restore_clicked.emit)
        self.center_action.triggered.connect(self.center_window_clicked.emit)
        self.always_on_top_action.triggered.connect(
            lambda: self.always_on_top_clicked.emit(
                self.always_on_top_action.isChecked()
            )
        )

        window_menu.addAction(self.maximize_action)
        window_menu.addAction(self.minimize_action)
        window_menu.addAction(self.restore_action)
        window_menu.addSeparator()
        window_menu.addAction(self.center_action)
        window_menu.addAction(self.always_on_top_action)

        # Help
        help_menu = self.addMenu("Help")

        self.documentation_action = QAction("Documentation", self)
        self.report_issue_action = QAction("Report an Issue...", self)
        self.about_qt_action = QAction("About Qt", self)
        self.about_action = QAction("About Games Uploader", self)

        self.report_issue_action.triggered.connect(self._report_an_issue)
        self.about_qt_action.triggered.connect(QApplication.aboutQt)

        help_menu.addAction(self.documentation_action)
        help_menu.addAction(self.report_issue_action)
        help_menu.addSeparator()
        help_menu.addAction(self.about_qt_action)
        help_menu.addAction(self.about_action)

    def _report_an_issue(self) -> None:
        url = QUrl("https://github.com/viradex/games-uploader/issues/new")
        QDesktopServices.openUrl(url)

    def handle_window_state_change(self, is_maximized: bool) -> None:
        if is_maximized:
            self.center_action.setEnabled(False)
        else:
            self.center_action.setEnabled(True)
