from PySide6.QtGui import QFont
from PySide6.QtWidgets import QLabel, QVBoxLayout, QWidget


class DiagnosticsTab(QWidget):
    def __init__(self):
        super().__init__()

        self.setup_tab()

    def setup_tab(self):
        title_font = QFont()
        title_font.setPointSize(18)
        title_font.setBold(True)

        desc_font = QFont()
        desc_font.setPointSize(12)

        title = QLabel("Diagnostics")
        title.setFont(title_font)

        desc = QLabel("Logs, troubleshooting, and advanced settings.")
        desc.setFont(desc_font)

        vbox = QVBoxLayout()
        vbox.addWidget(title)
        vbox.addSpacing(2)
        vbox.addWidget(desc)
        vbox.addStretch()

        self.setLayout(vbox)
