from PySide6.QtWidgets import QWidget

from core.app.dialog_ids import Dialog
from ui.dialogs.filename_rule_wizard import FilenameRuleWizardDialog
from ui.dialogs.logs import LogsDialog
from ui.dialogs.no_matching_rule import NoMatchingRuleDialog

DIALOG_DATA = {
    Dialog.LOGS: LogsDialog,
    Dialog.FILENAME_RULE_WIZARD: FilenameRuleWizardDialog,
    Dialog.NO_MATCHING_RULE: NoMatchingRuleDialog,
}


def create_dialog_widget(dialog: Dialog, parent: QWidget | None = None) -> tuple:
    try:
        dialog_cls = DIALOG_DATA[dialog]

        widget = dialog_cls(parent)
        return widget
    except KeyError as e:
        raise ValueError(f"Unknown dialog: {dialog}") from e
