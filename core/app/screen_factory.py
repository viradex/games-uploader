from PySide6.QtWidgets import QWidget

from core.app.screen_ids import Screen
from logic.screens.settings import SettingsLogic
from logic.screens.videos import VideosLogic
from ui.screens.settings import SettingsScreen
from ui.screens.videos import VideosScreen

SCREEN_DATA = {
    Screen.SETTINGS: (SettingsScreen, SettingsLogic),
    Screen.VIDEOS: (VideosScreen, VideosLogic),
}


def create_screen_bundle(screen: Screen, parent: QWidget | None = None) -> tuple:
    try:
        screen_cls, logic_cls = SCREEN_DATA[screen]

        widget = screen_cls(parent)
        logic = logic_cls(widget)

        return widget, logic
    except KeyError as e:
        raise ValueError(f"Unknown screen: {screen}") from e
