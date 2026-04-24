from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.github_client import GitHubClient, get_github_client
from app.schemas.story import StoryCreate, StoryResponse, StoryUpdate
from app.services import story_service

# Nested: list & create under a specific feature
nested_router = APIRouter(
    prefix="/features/{initiative_slug}/{entity_slug}/{feature_slug}/stories",
    tags=["stories"],
)

# Flat: update & delete by index
flat_router = APIRouter(prefix="/stories", tags=["stories"])

Client = Annotated[GitHubClient, Depends(get_github_client)]


@nested_router.get("/", response_model=list[StoryResponse])
def list_stories(
    initiative_slug: str, entity_slug: str, feature_slug: str, client: Client
):
    return story_service.list_stories(initiative_slug, entity_slug, feature_slug, client)


@nested_router.post("/", response_model=StoryResponse, status_code=201)
def create_story(
    initiative_slug: str,
    entity_slug: str,
    feature_slug: str,
    data: StoryCreate,
    client: Client,
):
    return story_service.create_story(
        initiative_slug, entity_slug, feature_slug, data, client
    )


@flat_router.put(
    "/{initiative_slug}/{entity_slug}/{feature_slug}/{story_index}",
    response_model=StoryResponse,
)
def update_story(
    initiative_slug: str,
    entity_slug: str,
    feature_slug: str,
    story_index: int,
    data: StoryUpdate,
    client: Client,
):
    return story_service.update_story(
        initiative_slug, entity_slug, feature_slug, story_index, data, client
    )


@flat_router.delete(
    "/{initiative_slug}/{entity_slug}/{feature_slug}/{story_index}",
    status_code=204,
)
def delete_story(
    initiative_slug: str,
    entity_slug: str,
    feature_slug: str,
    story_index: int,
    client: Client,
):
    story_service.delete_story(
        initiative_slug, entity_slug, feature_slug, story_index, client
    )
