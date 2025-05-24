import logging
import sys
from typing import Any, Dict

def setup_logging(debug: bool = False) -> Dict[str, Any]:
    """Configure logging for the application."""
    log_level = logging.DEBUG if debug else logging.INFO
    
    logging_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
        },
        "handlers": {
            "default": {
                "formatter": "default",
                "class": "logging.StreamHandler",
                "stream": sys.stdout,
            },
        },
        "loggers": {
            "": {  # Root logger
                "handlers": ["default"],
                "level": log_level,
            },
            "uvicorn": {
                "handlers": ["default"],
                "level": log_level,
            },
            "fastapi": {
                "handlers": ["default"],
                "level": log_level,
            },
        },
    }
    
    return logging_config
