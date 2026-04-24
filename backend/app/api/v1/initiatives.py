from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.github_client import GitHubClient, get_github_client
from app.schemas.initiative import InitiativeCreate, InitiativeResponse
from app.services import initiative_service

router = APIRouter(prefix="/initiatives", tags=["initiatives"])
Client = Annotated[GitHubClient, Depends(get_github_client)]


@router.get("/", response_model=list[InitiativeResponse])
def list_initiatives(client: Client):
    return initiative_service.list_initiatives(client)


@router.post("/", response_model=InitiativeResponse, status_code=201)
def create_initiative(data: InitiativeCreate, client: Client):
    return initiative_service.create_initiative(data, client)


@router.delete("/{slug}", status_code=204)
def delete_initiative(slug: str, client: Client):
    initiative_service.delete_initiative(slug, client)
