import logging

from PySide6.QtCore import QObject, Signal


def setup_logging():
    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG)
