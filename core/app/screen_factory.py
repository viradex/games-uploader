from PySide6.QtWidgets import QWidget

from core.app.screen_ids import Screen
from ui.screens.settings import SettingsScreen
from ui.screens.videos import VideosScreen

SCREEN_DATA = {
    Screen.SETTINGS: SettingsScreen,
    Screen.VIDEOS: VideosScreen,
}


def create_screen_widget(screen: Screen, parent: QWidget | None = None) -> tuple:
    try:
        screen_cls = SCREEN_DATA[screen]

        widget = screen_cls(parent)
        return widget
    except KeyError as e:
        raise ValueError(f"Unknown screen: {screen}") from e
