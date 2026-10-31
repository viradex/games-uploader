from PySide6.QtCore import Qt
from PySide6.QtWidgets import QScrollArea, QTabWidget, QVBoxLayout, QWidget

from ui.screens.settings_tabs.account import AccountTab
from ui.screens.settings_tabs.advanced import AdvancedTab
from ui.screens.settings_tabs.games import GamesTab
from ui.screens.settings_tabs.general import GeneralTab
from ui.screens.settings_tabs.uploads import UploadsTab
from ui.screens.settings_tabs.videos import VideosTab


class SettingsScreen(QWidget):
    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)

        self.setup_ui()
        self.setup_tabs()

    def setup_ui(self) -> None:
        self.tabs = QTabWidget()
        self.tabs.setStyleSheet("""
            QTabWidget::pane {
                border: 0;
                border-top: 2px solid #333333; 
            }

            QTabBar::tab {
                margin-right: 8px;   
                padding: 6px 12px;
                color: #c8c8c8;       
                background: #2b2b2b;  
                border: 1px solid #3f3f3f;
                border-bottom: none; 
                border-top-left-radius: 4px;
                border-top-right-radius: 4px;
            }

            QTabBar::tab:selected {
                color: #ffffff;       
                background: #1e1e1e;  
                border-color: #333333;
                margin-bottom: -2px; 
                border-bottom: 2px solid #1e1e1e; 
            }

            QTabBar::tab:!selected:hover {
                color: #ffffff;
                background: #363636;  
            }

            QTabBar::tab:last {
                margin-right: 0px;
            }
        """)

        layout = QVBoxLayout()
        layout.setContentsMargins(20, 20, 20, 20)
        layout.addWidget(self.tabs, stretch=1)

        self.setLayout(layout)

    def setup_tabs(self) -> None:
        self.tabs.addTab(self.make_scrollable(GeneralTab()), "General")
        self.tabs.addTab(self.make_scrollable(UploadsTab()), "Uploads")
        self.tabs.addTab(self.make_scrollable(VideosTab()), "Videos")
        self.tabs.addTab(self.make_scrollable(GamesTab()), "Games")
        self.tabs.addTab(self.make_scrollable(AccountTab()), "Account")
        self.tabs.addTab(self.make_scrollable(AdvancedTab()), "Advanced")

    def make_scrollable(self, tab: QWidget) -> QScrollArea:
        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
        scroll_area.setFrameShape(QScrollArea.Shape.NoFrame)
        scroll_area.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        scroll_area.setWidget(tab)
        return scroll_area
