from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.github_client import GitHubClient, get_github_client
from app.schemas.tree import InitiativeTree
from app.services import tree_service

router = APIRouter(prefix="/initiatives", tags=["tree"])
Client = Annotated[GitHubClient, Depends(get_github_client)]


@router.get("/tree", response_model=list[InitiativeTree])
def get_tree(client: Client):
    return tree_service.get_tree(client)
