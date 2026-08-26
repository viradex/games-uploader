from pathlib import Path

from PySide6.QtGui import QIcon
from PySide6.QtWidgets import (
    QGridLayout,
    QLabel,
    QLineEdit,
    QPushButton,
    QVBoxLayout,
    QWizard,
    QWizardPage,
)


class IntroPage(QWizardPage):
    def __init__(self) -> None:
        super().__init__()

        self.setTitle("Create a New Filename Rule")
        self.setSubTitle(
            "Create a new filename rule for formatting filenames into video titles."
        )

        self.setup_ui()

    def setup_ui(self) -> None:
        introduction = QLabel(
            "Games Uploader can automatically extract information from your video filenames. You'll define how your recorder names videos so Games Uploader can easily identify the game, date, and time.\n\nClick Next to continue.",
            wordWrap=True,
        )

        layout = QVBoxLayout()
        layout.addWidget(introduction)
        self.setLayout(layout)


class ExampleFilenamePage(QWizardPage):
    def __init__(self) -> None:
        super().__init__()

        self.setTitle("Example Filename")
        self.setSubTitle("Provide an example filename to test your rule.")

        self.setup_ui()

    def setup_ui(self) -> None:
        instructions = QLabel(
            "Paste a filename produced by your recording software, or select a file to extract the filename from directly. This step is optional, however, it will help to test the rule before saving it.",
            wordWrap=True,
        )

        filename = QLineEdit(placeholderText="Enter example filename (optional)...")
        filename.setFixedHeight(30)

        select_file = QPushButton("Select file...")

        layout = QVBoxLayout()
        layout.addWidget(instructions)
        layout.addSpacing(10)
        layout.addWidget(filename)
        layout.addSpacing(5)
        layout.addWidget(select_file)

        self.setLayout(layout)


class FilenameFormatPage(QWizardPage):
    def __init__(self) -> None:
        super().__init__()

        self.setTitle("Filename Format")
        self.setSubTitle(
            "Tell Game Master how your recording software saves video files, and where the data is saved."
        )

        self.setup_ui()

    def setup_ui(self) -> None:
        instructions = QLabel(
            "Enter the filename rule, with the tokens to extract from the filename. The explicit characters entered into the field are ignored when obtaining the data.",
            wordWrap=True,
        )

        self.filename_format = QLineEdit(placeholderText="Enter filename format...")
        self.filename_format.setFixedHeight(30)

        game_token = QPushButton(r"{GAME}")
        game_token.clicked.connect(lambda: self.insert_token(game_token))
        game_token.setFixedWidth(80)

        date_token = QPushButton(r"{DATE}")
        date_token.clicked.connect(lambda: self.insert_token(date_token))
        date_token.setFixedWidth(80)

        time_token = QPushButton(r"{TIME}")
        time_token.clicked.connect(lambda: self.insert_token(time_token))
        time_token.setFixedWidth(80)

        tokens_grid = QGridLayout()
        tokens_grid.addWidget(game_token, 0, 0)
        tokens_grid.addWidget(date_token, 0, 1)
        tokens_grid.addWidget(time_token, 0, 2)

        layout = QVBoxLayout()
        layout.addWidget(instructions)
        layout.addSpacing(10)
        layout.addWidget(self.filename_format)
        layout.addSpacing(5)
        layout.addLayout(tokens_grid)

        self.setLayout(layout)

    def insert_token(self, token_btn: QPushButton) -> None:
        original_text = self.filename_format.text()
        token_text = token_btn.text()

        self.filename_format.setText(original_text + token_text)


class CreateFilenameRuleWizard(QWizard):
    def __init__(self) -> None:
        super().__init__()

        self.setWindowTitle("Create New Filename Rule Wizard")
        self.setWizardStyle(QWizard.WizardStyle.ModernStyle)

        self.setMinimumWidth(600)
        self.setFixedSize(600, 400)

        base_dir = Path(__file__).resolve().parent.parent
        icon_path = base_dir / "assets" / "icons" / "wizard_icon.ico"

        self.setWindowIcon(QIcon(str(icon_path)))

        self.intro_page = IntroPage()
        self.example_filename_page = ExampleFilenamePage()
        self.filename_format_page = FilenameFormatPage()

        self.addPage(self.intro_page)
        self.addPage(self.example_filename_page)
        self.addPage(self.filename_format_page)

    def showEvent(self, event):
        super().showEvent(event)
        self.restart()
