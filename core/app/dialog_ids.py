from enum import Enum


class Dialog(Enum):
    LOGS = "logs"
    FILENAME_RULE_WIZARD = "filename_rule_wizard"
    NO_MATCHING_RULE = "no_matching_rule"
    UNIDENTIFIED_GAME = "unidentified_game"
