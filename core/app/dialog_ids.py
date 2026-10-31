from enum import Enum


class Dialog(Enum):
    LOGS = "logs"
    FILENAME_RULE_WIZARD = "filename_rule_wizard"
    NO_MATCHING_RULE = "no_matching_rule"
    OAUTH_WAITING = "oauth_waiting"
    UNIDENTIFIED_GAME = "unidentified_game"
    UPLOAD_ERROR = "upload_error"
