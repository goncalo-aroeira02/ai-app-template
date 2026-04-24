from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.github_client import GitHubClient, get_github_client
from app.schemas.entity import EntityCreate, EntityResponse
from app.services import entity_service

router = APIRouter(
    prefix="/initiatives/{initiative_slug}/entities",
    tags=["entities"],
)
Client = Annotated[GitHubClient, Depends(get_github_client)]


@router.get("/", response_model=list[EntityResponse])
def list_entities(initiative_slug: str, client: Client):
    return entity_service.list_entities(initiative_slug, client)


@router.post("/", response_model=EntityResponse, status_code=201)
def create_entity(initiative_slug: str, data: EntityCreate, client: Client):
    return entity_service.create_entity(initiative_slug, data, client)


@router.delete("/{entity_slug}", status_code=204)
def delete_entity(initiative_slug: str, entity_slug: str, client: Client):
    entity_service.delete_entity(initiative_slug, entity_slug, client)
