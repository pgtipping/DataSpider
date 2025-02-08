import traceback
from typing import Dict, Any

def get_error_context(error: Exception) -> Dict[str, Any]:
    """Capture detailed error context including stack trace"""
    return {
        "error_type": type(error).__name__,
        "error_message": str(error),
        "stack_trace": traceback.format_exc(),
    }

class UserAgentGenerator:
    """Generates realistic user agents"""
    def generate(self, platform: str = "desktop", browser: str = "chrome") -> str:
        # Simplified user agent generation
        agents = {
            "desktop": {
                "chrome": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
                "firefox": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0"
            },
            "mobile": {
                "safari": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
            }
        }
        return agents[platform][browser]
