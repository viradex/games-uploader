from PySide6.QtWidgets import (
    QDialog,
    QHBoxLayout,
    QLabel,
    QMessageBox,
    QVBoxLayout,
    QWidget,
)

from ui.components.input import SearchableCombobox


class UnidentifiedGameDialog(QDialog):
    def __init__(self, parent: QWidget | None = None):
        super().__init__(parent)

        self.setup_dialog()

    def setup_dialog(self) -> None:
        self.setWindowTitle("Unidentified Game")
        self.setFixedSize(500, 220)

        icon = QLabel()
        icon.setPixmap(QMessageBox.standardIcon(QMessageBox.Icon.Warning))

        message = QLabel(
            "The name of the game could not be derived from the filename. Please enter the name of the game that was recorded."
        )
        message.setWordWrap(True)

        self.game_name_selection = SearchableCombobox()
        self.game_name_selection.set_items(
            [
                "Minecraft",
                "Grand Theft Auto V",
                "Grand Theft Auto IV",
                "Red Dead Redemption 2",
            ]
        )

        vbox_icon = QVBoxLayout()
        vbox_icon.addSpacing(2)
        vbox_icon.addWidget(icon)
        vbox_icon.addStretch()

        vbox_contents = QVBoxLayout()
        vbox_contents.addSpacing(2)
        vbox_contents.addWidget(message)
        vbox_contents.addSpacing(5)
        vbox_contents.addWidget(self.game_name_selection)
        vbox_contents.addStretch()

        layout = QHBoxLayout()
        layout.addLayout(vbox_icon)
        layout.addSpacing(8)
        layout.addLayout(vbox_contents, stretch=1)

        self.setLayout(layout)
