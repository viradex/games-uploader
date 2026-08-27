from PySide6.QtWidgets import QWidget

from core.app.dialog_ids import Dialog
from logic.dialogs.filename_rule_wizard import FilenameRuleWizardLogic
from logic.dialogs.logs import LogsDialogLogic
from ui.dialogs.filename_rule_wizard import FilenameRuleWizardDialog
from ui.dialogs.logs import LogsDialog

DIALOG_DATA = {
    Dialog.FILENAME_RULE_WIZARD: (FilenameRuleWizardDialog, FilenameRuleWizardLogic),
    Dialog.LOGS: (LogsDialog, LogsDialogLogic),
}


def create_dialog_bundle(
    dialog: Dialog, parent: QWidget | None = None, screen_args: tuple | None = None
) -> tuple:
    try:
        dialog_cls, logic_cls = DIALOG_DATA[dialog]

        if screen_args is not None:
            widget = dialog_cls(*screen_args, parent)
        else:
            widget = dialog_cls(parent)

        logic = logic_cls(widget)

        return widget, logic
    except KeyError as e:
        raise ValueError(f"Unknown dialog: {dialog}") from e
