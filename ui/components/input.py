from PySide6.QtCore import Qt
from PySide6.QtWidgets import QComboBox, QCompleter, QWidget


class SearchableCombobox(QComboBox):
    def __init__(
        self, items: list[str] | None = None, parent: QWidget | None = None
    ) -> None:
        super().__init__(parent)
        self.items: list[str] = items if items is not None else []

        self._setup_component()

    def _setup_component(self) -> None:
        self.setEditable(True)
        self.setInsertPolicy(QComboBox.InsertPolicy.NoInsert)
        self.setMaxVisibleItems(10)

        if self.items:
            self.addItems(self.items)
            self.setCurrentIndex(-1)

        completer = QCompleter(self.model(), self)
        completer.setCaseSensitivity(Qt.CaseSensitivity.CaseInsensitive)
        completer.setFilterMode(Qt.MatchFlag.MatchContains)

        self.setCompleter(completer)

    def set_items(self, items: list[str]) -> None:
        self.items = items

        self.clear()
        self.addItems(self.items)

        self.setCurrentIndex(-1)
