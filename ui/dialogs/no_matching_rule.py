from PySide6.QtWidgets import (
    QButtonGroup,
    QDialog,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QMessageBox,
    QRadioButton,
    QVBoxLayout,
    QWidget,
)


class NoMatchingRuleDialog(QDialog):
    def __init__(self, parent: QWidget | None = None):
        super().__init__(parent)

        self.setup_dialog()

    def setup_dialog(self) -> None:
        self.setWindowTitle("No Rule Matched Video Title")
        self.setFixedSize(500, 220)

        icon = QLabel()
        icon.setPixmap(QMessageBox.standardIcon(QMessageBox.Icon.Warning))

        message = QLabel(
            "No existing rule matched the video title of 'Recording 2026/06/04 11:31:31'. What would you like to do?"
        )
        message.setWordWrap(True)

        self.cancel = QRadioButton(
            "Cancel the upload and open the Add Filename Rule wizard"
        )
        self.filename_title = QRadioButton(
            "Continue uploading this video with the video filename"
        )
        self.temp_title = QRadioButton(
            "Continue uploading this video with a temporary title:"
        )

        self.options = QButtonGroup()
        self.options.addButton(self.cancel)
        self.options.addButton(self.filename_title)
        self.options.addButton(self.temp_title)

        self.temp_title_input = QLineEdit(placeholderText="Video title...")
        self.temp_title_input.setDisabled(True)

        vbox_icon = QVBoxLayout()
        vbox_icon.addSpacing(2)
        vbox_icon.addWidget(icon)
        vbox_icon.addStretch()

        vbox_contents = QVBoxLayout()
        vbox_contents.addSpacing(2)
        vbox_contents.addWidget(message)
        vbox_contents.addSpacing(5)
        vbox_contents.addWidget(self.cancel)
        vbox_contents.addWidget(self.filename_title)
        vbox_contents.addWidget(self.temp_title)
        vbox_contents.addWidget(self.temp_title_input)
        vbox_contents.addStretch()

        layout = QHBoxLayout()
        layout.addLayout(vbox_icon)
        layout.addSpacing(8)
        layout.addLayout(vbox_contents, stretch=1)

        self.setLayout(layout)
