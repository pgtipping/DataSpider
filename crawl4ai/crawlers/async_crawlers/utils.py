import os
import platform
import traceback
from pathlib import Path

def get_home_folder() -> Path:
    """Get cross-platform home directory path"""
    home = Path.home()
    if platform.system() == "Windows":
        return home / "AppData/Local"
    return home

def get_chromium_path() -> Path:
    """Get Chromium executable path based on OS"""
    if platform.system() == "Windows":
        return get_home_folder() / "Chromium/Application/chrome.exe"
    elif platform.system() == "Darwin":
        return Path("/Applications/Chromium.app/Contents/MacOS/Chromium")
    else:  # Linux
        return Path("/usr/bin/chromium")

def get_error_context(error: Exception) -> str:
    """Get context information for an error"""
    return f"Error: {str(error)}\nType: {type(error).__name__}\nTraceback: {''.join(traceback.format_tb(error.__traceback__))}"
