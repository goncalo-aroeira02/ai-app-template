"""Happy-path router tests with mocked GitHub client."""

from unittest.mock import MagicMock

import pytest

from tests.conftest import load_fixture


# ── Helpers ──────────────────────────────────────────────────────────

def _make_content_file(name: str, file_type: str = "dir", sha: str = "abc123"):
    """Create a mock ContentFile-like object."""
    m = MagicMock()
    m.name = name
    m.type = file_type
    m.path = f"initiatives/{name}"
    m.sha = sha
    return m


# ── Initiative tests ─────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_list_initiatives(async_client, mock_github_client):
    initiative_dir = _make_content_file("improve-onboarding", "dir")
    entity_dir = _make_content_file("authentication", "dir")

    mock_github_client.list_contents.side_effect = lambda path: {
        "": [initiative_dir],
        "improve-onboarding": [entity_dir],
    }.get(path, [])

    resp = await async_client.get("/api/v1/initiatives/")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["slug"] == "improve-onboarding"
    assert data[0]["entity_count"] == 1


@pytest.mark.asyncio
async def test_create_initiative(async_client, mock_github_client):
    resp = await async_client.post("/api/v1/initiatives/", json={"name": "New Initiative"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["slug"] == "new-initiative"
    mock_github_client.create_folder.assert_called_once()


@pytest.mark.asyncio
async def test_delete_initiative(async_client, mock_github_client):
    mock_github_client.list_contents.return_value = [_make_content_file(".gitkeep", "file")]
    resp = await async_client.delete("/api/v1/initiatives/improve-onboarding")
    assert resp.status_code == 204
    mock_github_client.delete_folder.assert_called_once()


# ── Entity tests ─────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_list_entities(async_client, mock_github_client):
    entity_dir = _make_content_file("authentication", "dir")
    entity_dir.path = "initiatives/improve-onboarding/authentication"

    mock_github_client.list_contents.side_effect = lambda path: {
        "improve-onboarding": [entity_dir],
        "improve-onboarding/authentication": [],
    }.get(path, [])

    resp = await async_client.get("/api/v1/initiatives/improve-onboarding/entities/")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["slug"] == "authentication"


@pytest.mark.asyncio
async def test_create_entity(async_client, mock_github_client):
    resp = await async_client.post(
        "/api/v1/initiatives/improve-onboarding/entities/",
        json={"name": "Authentication"},
    )
    assert resp.status_code == 201
    assert resp.json()["slug"] == "authentication"


# ── Feature tests ────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_list_features(async_client, mock_github_client):
    feature_file = _make_content_file("login-flow.feature", "file")
    feature_file.path = "initiatives/improve-onboarding/authentication/login-flow.feature"
    content = load_fixture("sample_login.feature")

    mock_github_client.list_contents.return_value = [feature_file]
    mock_github_client.get_file_content.return_value = (content, "sha123")

    resp = await async_client.get(
        "/api/v1/initiatives/improve-onboarding/entities/authentication/features/"
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["slug"] == "login-flow"
    assert data[0]["story_count"] == 2


@pytest.mark.asyncio
async def test_create_feature(async_client, mock_github_client):
    resp = await async_client.post(
        "/api/v1/initiatives/improve-onboarding/entities/authentication/features/",
        json={"title": "Login Flow", "description": "User login", "status": "draft"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["slug"] == "login-flow"
    assert data["title"] == "Login Flow"
    mock_github_client.create_file.assert_called_once()


@pytest.mark.asyncio
async def test_get_feature(async_client, mock_github_client):
    content = load_fixture("sample_login.feature")
    mock_github_client.get_file_content.return_value = (content, "sha123")

    resp = await async_client.get(
        "/api/v1/features/improve-onboarding/authentication/login-flow"
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "Login Flow"
    assert len(data["stories"]) == 2
    assert data["stories"][0]["title"] == "Successful login with valid credentials"


# ── Tree test ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_tree(async_client, mock_github_client):
    initiative_dir = _make_content_file("improve-onboarding", "dir")
    entity_dir = _make_content_file("authentication", "dir")
    entity_dir.path = "initiatives/improve-onboarding/authentication"
    feature_file = _make_content_file("login-flow.feature", "file")
    feature_file.path = "initiatives/improve-onboarding/authentication/login-flow.feature"
    content = load_fixture("sample_login.feature")

    mock_github_client.list_contents.side_effect = lambda path: {
        "": [initiative_dir],
        "improve-onboarding": [entity_dir],
        "improve-onboarding/authentication": [feature_file],
    }.get(path, [])
    mock_github_client.get_file_content.return_value = (content, "sha123")

    resp = await async_client.get("/api/v1/initiatives/tree")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["slug"] == "improve-onboarding"
    assert len(data[0]["entities"]) == 1
    assert len(data[0]["entities"][0]["features"]) == 1
    assert data[0]["entities"][0]["features"][0]["story_count"] == 2
