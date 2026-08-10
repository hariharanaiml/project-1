"""
Centralized structured logging configuration.

Provides a `get_logger(name)` helper that returns a pre-configured logger.
Log output is JSON-friendly in production and human-readable in development.
"""

import logging
import sys
from typing import Optional

from app.core.config import settings

_CONFIGURED = False


def _get_level() -> int:
    """Map the configured log level string to a logging level."""
    return getattr(logging, settings.log_level.upper(), logging.INFO)


def configure_logging(level: Optional[str] = None) -> None:
    """
    Configure the root logger with a consistent console handler.

    Safe to call multiple times — the root handler is installed once.
    """
    global _CONFIGURED

    if _CONFIGURED:
        return

    log_level = _get_level() if level is None else getattr(logging, level.upper(), logging.INFO)

    root = logging.getLogger()
    root.setLevel(log_level)

    # Remove any pre-existing handlers to avoid duplicate output.
    for handler in root.handlers[:]:
        root.removeHandler(handler)

    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    root.addHandler(handler)

    # Keep third-party loggers at a sane level to avoid noisy output.
    for noisy in ("uvicorn.access", "uvicorn.error", "sqlalchemy.engine"):
        logging.getLogger(noisy).setLevel(logging.WARNING)

    _CONFIGURED = True


def get_logger(name: str) -> logging.Logger:
    """Return a logger for the given module name, ensuring logging is configured."""
    configure_logging()
    return logging.getLogger(name)

