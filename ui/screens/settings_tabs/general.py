from PySide6.QtGui import QFont
from PySide6.QtWidgets import (
    QCheckBox,
    QComboBox,
    QFrame,
    QLabel,
    QPushButton,
    QVBoxLayout,
    QWidget,
)


class GeneralTab(QWidget):
    def __init__(self):
        super().__init__()

        self.setup_tab()

    def setup_tab(self):
        title_font = QFont()
        title_font.setPointSize(18)
        title_font.setBold(True)

        self.subheading_font = QFont()
        self.subheading_font.setPointSize(14)
        self.subheading_font.setWeight(QFont.Weight.DemiBold)

        self.settings_font = QFont()
        self.settings_font.setPointSize(10)

        title = QLabel("General")
        title.setFont(title_font)

        desc = QLabel(
            "General application behavior relating to Windows and display settings."
        )
        desc.setStyleSheet("font-size: 14px; color: #aaa;")

        windows_subsettings = self.create_windows_subsettings()
        display_subsettings = self.create_display_subsettings()

        vbox = QVBoxLayout()
        vbox.setContentsMargins(10, 10, 10, 10)
        vbox.addWidget(title)
        vbox.addWidget(desc)
        vbox.addLayout(windows_subsettings)
        vbox.addLayout(display_subsettings)
        vbox.addStretch()

        self.setLayout(vbox)

    def create_windows_subsettings(self) -> QVBoxLayout:
        windows_subheading = QLabel("Windows")
        windows_subheading.setFont(self.subheading_font)

        start_with_windows = QCheckBox("Start with Windows")
        start_with_windows.setFont(self.settings_font)

        exiting_warning = QCheckBox(
            "Show a warning when exiting while uploads are active"
        )
        exiting_warning.setChecked(True)
        exiting_warning.setFont(self.settings_font)

        minimize_to_tray = QCheckBox("Minimize to tray")
        minimize_to_tray.setFont(self.settings_font)

        close_to_tray = QCheckBox("Close to tray")
        close_to_tray.setFont(self.settings_font)

        vbox = QVBoxLayout()
        vbox.addSpacing(5)
        vbox.addWidget(windows_subheading)
        vbox.addWidget(self.create_hline())
        vbox.addSpacing(2)
        vbox.addWidget(start_with_windows)
        vbox.addWidget(exiting_warning)
        vbox.addWidget(minimize_to_tray)
        vbox.addWidget(close_to_tray)

        return vbox

    def create_display_subsettings(self) -> QVBoxLayout:
        display_subheading = QLabel("Display")
        display_subheading.setFont(self.subheading_font)

        remember_window_stats = QCheckBox("Remember window position and size")
        remember_window_stats.setChecked(True)
        remember_window_stats.setFont(self.settings_font)

        always_on_top = QCheckBox("Always on top")
        always_on_top.setFont(self.settings_font)

        monitor = QLabel("Startup monitor:")
        monitor.setFont(self.settings_font)

        default_monitor = QComboBox()
        default_monitor.addItems(
            ["Generic Monitor (Acer KA271)", "Generic Monitor (D27-30)"]
        )
        default_monitor.setFont(self.settings_font)

        center_window = QPushButton("Center Window")
        center_window.setFixedWidth(120)
        center_window.setFont(self.settings_font)

        vbox = QVBoxLayout()
        vbox.addSpacing(15)
        vbox.addWidget(display_subheading)
        vbox.addWidget(self.create_hline())
        vbox.addSpacing(2)
        vbox.addWidget(remember_window_stats)
        vbox.addWidget(always_on_top)
        vbox.addSpacing(10)
        vbox.addWidget(monitor)
        vbox.addWidget(default_monitor)
        vbox.addSpacing(10)
        vbox.addWidget(center_window)

        return vbox

    def create_hline(self) -> QFrame:
        hline = QFrame()
        hline.setFrameShape(QFrame.Shape.HLine)
        hline.setFrameShadow(QFrame.Shadow.Sunken)

        return hline
