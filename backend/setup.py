from setuptools import setup, find_packages

# Read requirements
with open("requirements.txt") as f:
    requirements = [line.strip() for line in f if line.strip() and not line.startswith("#")]

# Read dev requirements
with open("requirements-dev.txt") as f:
    dev_requirements = [
        line.strip() for line in f
        if line.strip() and not line.startswith("#") and not line.startswith("-r")
    ]

# Read long description
with open("README.md", encoding="utf-8") as f:
    long_description = f.read()

setup(
    name="crawl4ai-backend",
    version="1.0.0",
    description="Backend server for the Crawl4AI project",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="Your Name",
    author_email="your.email@example.com",
    url="https://github.com/yourusername/crawl4ai",
    packages=find_packages(exclude=["tests*"]),
    install_requires=requirements,
    extras_require={
        "dev": dev_requirements,
        "test": [
            "pytest>=8.0.0",
            "pytest-asyncio>=0.23.5",
            "pytest-cov>=4.1.0",
            "pytest-env>=1.1.3",
            "pytest-mock>=3.12.0",
            "pytest-xdist>=3.5.0",
            "coverage>=7.4.1",
        ],
        "lint": [
            "black>=24.1.1",
            "isort>=5.13.2",
            "flake8>=7.0.0",
            "mypy>=1.8.0",
            "pylint>=3.0.3",
        ],
        "docs": [
            "mkdocs>=1.5.3",
            "mkdocs-material>=9.5.3",
            "mkdocstrings>=0.24.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "crawl4ai=app.main:app",
        ],
    },
    python_requires=">=3.8",
    classifiers=[
        "Development Status :: 4 - Beta",
        "Environment :: Web Environment",
        "Framework :: FastAPI",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: Internet :: WWW/HTTP",
        "Topic :: Software Development :: Libraries :: Python Modules",
    ],
    project_urls={
        "Bug Reports": "https://github.com/yourusername/crawl4ai/issues",
        "Source": "https://github.com/yourusername/crawl4ai",
        "Documentation": "https://yourusername.github.io/crawl4ai",
    },
    include_package_data=True,
    zip_safe=False,
) 