from abc import ABC, abstractmethod
import re
from typing import List, Optional, Dict, Any, Type, TypeVar, Final
import warnings

from crawl4ai.core.model_loader import load_model
from crawl4ai.utils.utils import sanitize_text

T = TypeVar('T', bound='ChunkingStrategy')

# Constants
DEFAULT_REGEX_PATTERN: Final[str] = r"\n\n+"
DEFAULT_WORDS_PER_CHUNK: Final[int] = 100
DEFAULT_WINDOW_SIZE: Final[int] = 100
DEFAULT_STEP_SIZE: Final[int] = 50
DEFAULT_OVERLAP: Final[int] = 20

# Define the abstract base class for chunking strategies
class ChunkingStrategy(ABC):
    """
    Base class for content chunking strategies.
    
    This abstract class defines the interface for all chunking strategies.
    Each strategy must implement the chunk_content method to split content
    into meaningful chunks according to its specific algorithm.
    """
    
    @abstractmethod
    def chunk_content(self, content: str) -> List[str]:
        """
        Split content into chunks according to the strategy.
        
        Args:
            content (str): The text content to be chunked.
            
        Returns:
            List[str]: A list of text chunks. Empty list if content is empty.
        """
        pass

# Create an identity chunking strategy f(x) = [x]
class IdentityChunking(ChunkingStrategy):
    """
    Returns content as a single chunk.
    
    This is the simplest chunking strategy that returns the entire content
    as a single chunk. Useful as a baseline or when chunking is not needed.
    """
    
    def chunk_content(self, content: str) -> List[str]:
        """
        Return the content as a single chunk.
        
        Args:
            content (str): The text content to be chunked.
            
        Returns:
            List[str]: A single-element list containing the entire content,
                      or an empty list if content is empty.
        """
        return [content] if content else []

# Regex-based chunking
class RegexChunking(ChunkingStrategy):
    """
    Splits content based on regex pattern.
    
    This strategy uses regular expressions to split content into chunks.
    By default, it splits on multiple consecutive newlines, but can be
    configured with any valid regex pattern.
    """
    
    def __init__(self, pattern: str = DEFAULT_REGEX_PATTERN) -> None:
        """
        Initialize the regex chunking strategy.
        
        Args:
            pattern (str, optional): The regex pattern to split on.
                                   Defaults to multiple newlines.
        """
        self.pattern: str = pattern
        
    def chunk_content(self, content: str) -> List[str]:
        """
        Split content using the regex pattern.
        
        Args:
            content (str): The text content to be chunked.
            
        Returns:
            List[str]: List of chunks created by splitting on the pattern.
                      Empty list if content is empty.
        """
        if not content:
            return []
        chunks: List[str] = re.split(self.pattern, content)
        return [chunk.strip() for chunk in chunks if chunk.strip()]
    
# NLP-based sentence chunking 
class NlpSentenceChunking(ChunkingStrategy):
    """
    Splits content into sentences using NLTK.
    
    This strategy uses NLTK's sentence tokenizer to split content into
    natural language sentences. Requires NLTK to be installed and the
    'punkt' tokenizer to be available.
    
    Raises:
        ImportError: If NLTK is not installed or initialization fails.
    """
    
    def __init__(self) -> None:
        """
        Initialize the NLTK sentence chunking strategy.
        
        Raises:
            ImportError: If NLTK is not installed or initialization fails.
        """
        if not _check_nltk_installed():
            raise ImportError(
                "NLTK is required for NlpSentenceChunking. "
                "Please install it with: pip install nltk"
            )
        
        try:
            from nltk.tokenize import sent_tokenize
            self.tokenizer = sent_tokenize
            
            # Ensure punkt tokenizer is downloaded
            import nltk
            try:
                nltk.data.find('tokenizers/punkt')
            except LookupError:
                nltk.download('punkt')
        except Exception as e:
            raise ImportError(f"Failed to initialize NLTK sentence tokenizer: {str(e)}")
    
    def chunk_content(self, content: str) -> List[str]:
        """
        Split content into sentences using NLTK.
        
        Args:
            content (str): The text content to be chunked.
            
        Returns:
            List[str]: List of sentences. Empty list if content is empty.
        """
        if not content:
            return []
        return self.tokenizer(content)
    
# Topic-based segmentation using TextTiling
class TopicSegmentationChunking(ChunkingStrategy):
    """
    Splits content into topic-based segments using NLTK.
    
    This strategy attempts to identify topic boundaries in the text and
    split accordingly. Falls back to regex chunking if NLTK fails.
    
    Raises:
        ImportError: If NLTK is not installed or initialization fails.
    """
    
    def __init__(self) -> None:
        """
        Initialize the topic segmentation chunking strategy.
        
        Raises:
            ImportError: If NLTK is not installed or initialization fails.
        """
        if not _check_nltk_installed():
            raise ImportError(
                "NLTK is required for TopicSegmentationChunking. "
                "Please install it with: pip install nltk"
            )
            
        try:
            import nltk
            try:
                nltk.data.find('tokenizers/punkt')
            except LookupError:
                nltk.download('punkt')
        except Exception as e:
            raise ImportError(f"Failed to initialize NLTK for topic segmentation: {str(e)}")
    
    def chunk_content(self, content: str) -> List[str]:
        """
        Split content into topic-based segments.
        
        Args:
            content (str): The text content to be chunked.
            
        Returns:
            List[str]: List of topic segments. Falls back to regex chunking on failure.
                      Empty list if content is empty.
        """
        if not content:
            return []
            
        try:
            import nltk
            sentences: List[str] = nltk.sent_tokenize(content)
            chunks: List[str] = []
            current_chunk: List[str] = []
            
            for sentence in sentences:
                if "\n\n" in sentence:
                    if current_chunk:
                        chunks.append(" ".join(current_chunk))
                        current_chunk = []
                current_chunk.append(sentence)
            
            if current_chunk:
                chunks.append(" ".join(current_chunk))
            
            return chunks
        except Exception as e:
            warnings.warn(f"Topic segmentation failed: {str(e)}. Falling back to paragraph splitting.")
            return RegexChunking().chunk_content(content)

# Fixed-length word chunks
class FixedLengthWordChunking(ChunkingStrategy):
    """
    Splits content into chunks of approximately fixed word length.
    
    This strategy creates chunks containing approximately the same number
    of words, useful for creating uniform-sized chunks for processing.
    """
    
    def __init__(self, words_per_chunk: int = DEFAULT_WORDS_PER_CHUNK) -> None:
        """
        Initialize the fixed-length word chunking strategy.
        
        Args:
            words_per_chunk (int, optional): Number of words per chunk.
                                           Defaults to 100.
        """
        self.words_per_chunk: int = words_per_chunk
    
    def chunk_content(self, content: str) -> List[str]:
        """
        Split content into fixed-length word chunks.
        
        Args:
            content (str): The text content to be chunked.
            
        Returns:
            List[str]: List of chunks with approximately words_per_chunk words each.
                      Empty list if content is empty.
        """
        if not content:
            return []
            
        words: List[str] = content.split()
        chunks: List[str] = []
        current_chunk: List[str] = []
        word_count: int = 0
        
        for word in words:
            current_chunk.append(word)
            word_count += 1
            
            if word_count >= self.words_per_chunk:
                chunks.append(" ".join(current_chunk))
                current_chunk = []
                word_count = 0
        
        if current_chunk:
            chunks.append(" ".join(current_chunk))
        
        return chunks
    
# Sliding window chunking
class SlidingWindowChunking(ChunkingStrategy):
    """
    Splits content using a sliding window approach.
    
    This strategy creates overlapping chunks by sliding a window over the text.
    The window size and step size can be configured to control the chunk size
    and amount of overlap.
    """
    
    def __init__(self, window_size: int = DEFAULT_WINDOW_SIZE, 
                 step_size: int = DEFAULT_STEP_SIZE) -> None:
        """
        Initialize the sliding window chunking strategy.
        
        Args:
            window_size (int, optional): Size of the sliding window in words.
                                       Defaults to 100.
            step_size (int, optional): Number of words to move the window.
                                     Defaults to 50.
        """
        self.window_size: int = window_size
        self.step_size: int = step_size
    
    def chunk_content(self, content: str) -> List[str]:
        """
        Split content using a sliding window.
        
        Args:
            content (str): The text content to be chunked.
            
        Returns:
            List[str]: List of overlapping chunks created by sliding the window.
                      Empty list if content is empty.
        """
        if not content:
            return []
            
        words: List[str] = content.split()
        chunks: List[str] = []
        
        for i in range(0, len(words), self.step_size):
            chunk: List[str] = words[i:i + self.window_size]
            if chunk:
                chunks.append(" ".join(chunk))
        
        return chunks
    
class OverlappingWindowChunking(ChunkingStrategy):
    """
    Splits content into overlapping chunks to maintain context.
    
    Similar to sliding window, but specifically designed to maintain context
    between chunks by ensuring a minimum overlap between consecutive chunks.
    """
    
    def __init__(self, chunk_size: int = DEFAULT_WINDOW_SIZE, 
                 overlap: int = DEFAULT_OVERLAP) -> None:
        """
        Initialize the overlapping window chunking strategy.
        
        Args:
            chunk_size (int, optional): Size of each chunk in words.
                                      Defaults to 100.
            overlap (int, optional): Number of words to overlap between chunks.
                                   Defaults to 20.
        """
        self.chunk_size: int = chunk_size
        self.overlap: int = min(overlap, chunk_size - 1)  # Ensure overlap is smaller than chunk size
    
    def chunk_content(self, content: str) -> List[str]:
        """
        Split content into overlapping chunks.
        
        Args:
            content (str): The text content to be chunked.
            
        Returns:
            List[str]: List of chunks with specified overlap between consecutive chunks.
                      Empty list if content is empty.
        """
        if not content:
            return []
            
        words: List[str] = content.split()
        chunks: List[str] = []
        
        for i in range(0, len(words), self.chunk_size - self.overlap):
            chunk: List[str] = words[i:i + self.chunk_size]
            if chunk:
                chunks.append(" ".join(chunk))
        
        return chunks

def _check_nltk_installed() -> bool:
    """
    Check if nltk is installed without importing it directly.
    
    Returns:
        bool: True if nltk is installed, False otherwise.
    
    Note:
        This is an internal utility function used to check for optional
        dependencies without causing import errors.
    """
    try:
        import importlib.util
        return importlib.util.find_spec("nltk") is not None
    except ImportError:
        return False