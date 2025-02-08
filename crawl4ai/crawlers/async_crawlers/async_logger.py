import os
from datetime import datetime
from typing import Optional

class AsyncLogger:
    def __init__(self, log_file: str, verbose: bool = True, tag_width: int = 10):
        self.log_file = log_file
        self.verbose = verbose
        self.tag_width = tag_width
        os.makedirs(os.path.dirname(log_file), exist_ok=True)

    def _log(self, message: str, tag: str, params: dict):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        tag = tag.ljust(self.tag_width)
        log_entry = f"[{timestamp}] {tag} {message.format(**params)}\n"
        
        with open(self.log_file, "a", encoding="utf-8") as f:
            f.write(log_entry)
            
        if self.verbose:
            print(log_entry.strip())

    def info(self, message: str, tag: str, params: dict = None):
        self._log(message, tag, params or {})

    def warning(self, message: str, tag: str, params: dict = None):
        self._log(f"WARNING: {message}", tag, params or {})

    def error(self, message: str, tag: str, params: dict = None):
        self._log(f"ERROR: {message}", tag, params or {})

    def error_status(self, url: str, error: str, tag: str):
        self._log(f"Failed: {url}\n{error}", tag, {})

    def url_status(self, url: str, success: bool, timing: float, tag: str):
        status = "SUCCESS" if success else "FAILED"
        self._log(f"{url:.50}... | Status: {status} | Time: {timing:.2f}s", tag, {})
