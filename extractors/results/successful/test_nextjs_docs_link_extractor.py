import asyncio
import json
import os
import pytest
from typing import Dict
from nextjs_docs_link_extractor import NextJsDocsLinkExtractor

@pytest.mark.asyncio
async def test_link_extraction():
    """Test the Next.js docs link extractor"""
    
    # Initialize extractor
    extractor = NextJsDocsLinkExtractor()
    
    # Extract links
    results = await extractor.extract_links(save_to_file=False)
    
    # Basic validation
    assert isinstance(results, dict), "Results should be a dictionary"
    assert 'all_links' in results, "Results should contain 'all_links'"
    assert 'sections' in results, "Results should contain 'sections'"
    assert 'stats' in results, "Results should contain 'stats'"
    
    # Validate links
    all_links = results['all_links']
    assert len(all_links) > 0, "Should find at least some links"
    
    # Check link structure
    for link in all_links[:5]:  # Check first 5 links
        assert isinstance(link, dict), "Each link should be a dictionary"
        assert 'href' in link, "Link should have href"
        assert 'text' in link, "Link should have text"
        assert link['href'].startswith('https://nextjs.org/docs'), "Links should be Next.js doc links"
    
    # Validate sections
    sections = results['sections']
    expected_sections = {'getting_started', 'app_router', 'pages_router', 'api_reference', 'other'}
    assert set(sections.keys()) == expected_sections, "Should have all expected sections"
    
    # Validate stats
    stats = results['stats']
    assert stats['total_links'] == len(all_links), "Total links count should match"
    assert sum(len(links) for links in sections.values()) >= stats['total_links'], "Section links should account for all links"
    
    print("\nTest Results:")
    print(f"Total links found: {stats['total_links']}")
    print("\nBreakdown by section:")
    for section, count in stats.items():
        if section != 'total_links':
            print(f"- {section.replace('_', ' ').title()}: {count}")
    
    return results

@pytest.mark.asyncio
async def test_error_handling():
    """Test error handling with invalid URL"""
    
    extractor = NextJsDocsLinkExtractor()
    
    # Test with invalid URL
    with pytest.raises(Exception):
        await extractor.extract_links(base_url="https://invalid-url-that-doesnt-exist.com")

if __name__ == "__main__":
    # Run tests
    asyncio.run(test_link_extraction()) 