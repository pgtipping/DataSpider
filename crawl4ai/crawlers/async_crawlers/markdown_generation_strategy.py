from .base_strategy import BaseStrategy
from typing import Dict, Any
import markdown

class MarkdownGenerationStrategy(BaseStrategy):
    def __init__(self, config: Dict[str, Any] = None):
        super().__init__(config)
        self.md = markdown.Markdown(extensions=['extra', 'tables'])

    def execute(self, content: str) -> str:
        """Convert HTML content to markdown format"""
        try:
            # Convert HTML to markdown
            markdown_content = self.md.convert(content)
            return markdown_content
        except Exception as e:
            self.logger.error(f"Error converting to markdown: {str(e)}")
            return content
class DefaultMarkdownGenerator(MarkdownGenerationStrategy):
    def __init__(self, config: Dict[str, Any] = None):
        super().__init__(config)

    def execute(self, content: str) -> str:
        """Default implementation for markdown generation"""
        try:
            return self.md.convert(content)
        except Exception as e:
            self.logger.error(f"Error in DefaultMarkdownGenerator: {str(e)}")
            return content
