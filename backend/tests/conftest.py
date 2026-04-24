"""Test fixtures with mocked GitHub client."""

from pathlib import Path
from unittest.mock import MagicMock

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.github_client import GitHubClient, get_github_client
from main import app

FIXTURES = Path(__file__).parent / "fixtures"


def load_fixture(name: str) -> str:
    return (FIXTURES / name).read_text()


@pytest.fixture
def mock_github_client():
    """Return a MagicMock that stands in for GitHubClient."""
    mock = MagicMock(spec=GitHubClient)
    mock.base_path = "initiatives"
    mock.branch = "main"
    return mock


@pytest.fixture
async def async_client(mock_github_client):
    """AsyncClient with the GitHub client dependency overridden."""
    app.dependency_overrides[get_github_client] = lambda: mock_github_client
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
    app.dependency_overrides.clear()
