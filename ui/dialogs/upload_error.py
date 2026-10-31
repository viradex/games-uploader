from PySide6.QtWidgets import (
    QDialog,
    QHBoxLayout,
    QLabel,
    QLayout,
    QMessageBox,
    QPlainTextEdit,
    QPushButton,
    QVBoxLayout,
    QWidget,
)


class UploadErrorDialog(QDialog):
    def __init__(self, parent: QWidget | None = None):
        super().__init__(parent)

        self.details_expanded: bool = False

        self.setup_dialog()

    def setup_dialog(self) -> None:
        self.setWindowTitle("Upload Error")

        icon = QLabel()
        icon.setPixmap(QMessageBox.standardIcon(QMessageBox.Icon.Critical))

        message = QLabel(
            "An unexpected error occurred while uploading the video. You can attempt to retry uploading the video, or accept defeat.\n\nAuto-retry will be run in 5 seconds (3 attempts left)."
        )
        message.setWordWrap(True)

        self.error_details = QPlainTextEdit("Error: Upload failed")
        self.error_details.setReadOnly(True)
        self.error_details.setFixedHeight(160)
        self.error_details.hide()

        self.details_button = QPushButton("Details >>")
        self.details_button.clicked.connect(self.on_details_clicked)

        retry_button = QPushButton("Retry (5s)")

        ok_button = QPushButton("OK")
        ok_button.clicked.connect(self.accept)

        vbox_icon = QVBoxLayout()
        vbox_icon.addSpacing(2)
        vbox_icon.addWidget(icon)
        vbox_icon.addStretch()

        hbox_btns = QHBoxLayout()
        hbox_btns.addWidget(self.details_button)
        hbox_btns.addStretch()
        hbox_btns.addWidget(retry_button)
        hbox_btns.addWidget(ok_button)

        vbox_contents = QVBoxLayout()
        vbox_contents.addSpacing(2)
        vbox_contents.addWidget(message)

        hbox_main = QHBoxLayout()
        hbox_main.addLayout(vbox_icon)
        hbox_main.addSpacing(8)
        hbox_main.addLayout(vbox_contents, stretch=1)

        layout = QVBoxLayout()
        layout.addLayout(hbox_main)
        layout.addSpacing(8)
        layout.addLayout(hbox_btns)
        layout.addWidget(self.error_details)

        self.setLayout(layout)
        layout.setSizeConstraint(QLayout.SizeConstraint.SetFixedSize)

    def on_details_clicked(self) -> None:
        if not self.details_expanded:
            self.error_details.show()
            self.details_button.setText("Details <<")
        else:
            self.error_details.hide()
            self.details_button.setText("Details >>")

        self.details_expanded = not self.details_expanded
