"""Validation utilities for the Crawl4AI backend."""

from typing import List
from urllib.parse import urlparse
import re
import logging

logger = logging.getLogger(__name__)

def validate_url(url: str) -> bool:
    """
    Validate if a given string is a valid URL.
    
    Args:
        url: The URL string to validate
        
    Returns:
        bool: True if the URL is valid, False otherwise
    """
    try:
        # Basic URL format validation
        result = urlparse(url)
        
        # Check for scheme and netloc
        if not all([result.scheme, result.netloc]):
            return False
            
        # Check if scheme is http or https
        if result.scheme not in ["http", "https"]:
            return False
            
        # Additional validation for common URL patterns
        url_pattern = re.compile(
            r'^(?:http|https)://'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|'  # domain...
            r'localhost|'  # localhost...
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
            
        return bool(url_pattern.match(url))
        
    except Exception as e:
        logger.error(f"URL validation failed: {str(e)}")
        return False

def validate_selector(selector: str) -> bool:
    """
    Validate if a given string is a valid CSS selector.
    
    Args:
        selector: The CSS selector string to validate
        
    Returns:
        bool: True if the selector is valid, False otherwise
    """
    try:
        # Basic selector format validation
        if not selector:
            return False
            
        # Check for common invalid characters
        invalid_chars = ["<", ">", "{", "}", "\\"]
        if any(char in selector for char in invalid_chars):
            return False
            
        # Check for balanced parentheses and brackets
        brackets: dict[str, str] = {"(": ")", "[": "]"}
        stack: List[str] = []
        
        for char in selector:
            if char in brackets:
                stack.append(char)
            elif char in brackets.values():
                if not stack or brackets[stack.pop()] != char:
                    return False
                    
        return len(stack) == 0
        
    except Exception as e:
        logger.error(f"Selector validation failed: {str(e)}")
        return False

def validate_file_path(path: str) -> bool:
    """
    Validate if a given string is a valid file path.
    
    Args:
        path: The file path string to validate
        
    Returns:
        bool: True if the path is valid, False otherwise
    """
    try:
        # Basic path format validation
        if not path:
            return False
            
        # Check for common invalid characters
        invalid_chars = ["<", ">", "|", "*", "?", '"', "'"]
        if any(char in path for char in invalid_chars):
            return False
            
        # Check for absolute path attempts
        if path.startswith("/") or path.startswith("\\"):
            return False
            
        # Check for parent directory traversal
        if ".." in path:
            return False
            
        return True
        
    except Exception as e:
        logger.error(f"File path validation failed: {str(e)}")
        return False

def validate_json_data(data: str) -> bool:
    """
    Validate if a given string is valid JSON.
    
    Args:
        data: The JSON string to validate
        
    Returns:
        bool: True if the JSON is valid, False otherwise
    """
    try:
        import json
        json.loads(data)
        return True
        
    except Exception as e:
        logger.error(f"JSON validation failed: {str(e)}")
        return False 