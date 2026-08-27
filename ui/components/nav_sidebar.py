from PySide6.QtCore import QSize, Qt
from PySide6.QtWidgets import QButtonGroup, QFrame, QToolButton, QVBoxLayout


class NavigationSidebar(QFrame):
    def __init__(self, parent=None) -> None:
        super().__init__(parent)

        self.setFixedWidth(60)

        self._setup_ui()

    def _setup_ui(self) -> None:
        self.vbox = QVBoxLayout(self)
        self.vbox.setContentsMargins(6, 6, 6, 6)
        self.vbox.setSpacing(6)

        self.button_group = QButtonGroup(self)
        self.button_group.setExclusive(True)

        self.setStyleSheet("""
            NavigationSidebar {
                background-color: #232323;
            }

            QToolButton {
                border: none;
                border-radius: 8px;
                background-color: transparent;
            }

            QToolButton:hover {
                background-color: #292929;
            }

            QToolButton:checked {
                background-color: #303030;
            }
        """)

    def add_button(
        self, icon: str, tooltip: str, checked: bool = False, checkable: bool = True
    ) -> QToolButton:
        button = QToolButton()
        button.setIcon(icon)
        button.setIconSize(QSize(24, 24))
        button.setFixedSize(48, 48)
        button.setToolTip(tooltip)
        button.setCheckable(checkable)
        button.setChecked(checked)
        button.setAutoRaise(True)
        button.setCursor(Qt.CursorShape.PointingHandCursor)

        self.button_group.addButton(button)
        self.vbox.addWidget(button)

        return button

    def add_stretch(self) -> None:
        self.vbox.addStretch(1)
