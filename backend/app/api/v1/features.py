from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.github_client import GitHubClient, get_github_client
from app.schemas.feature import FeatureBrief, FeatureCreate, FeatureResponse, FeatureUpdate
from app.services import feature_service

# Nested router: list & create scoped to initiative + entity
nested_router = APIRouter(
    prefix="/initiatives/{initiative_slug}/entities/{entity_slug}/features",
    tags=["features"],
)

# Flat router: get, update, delete by all three slugs
flat_router = APIRouter(prefix="/features", tags=["features"])

Client = Annotated[GitHubClient, Depends(get_github_client)]


@nested_router.get("/", response_model=list[FeatureBrief])
def list_features(initiative_slug: str, entity_slug: str, client: Client):
    return feature_service.list_features(initiative_slug, entity_slug, client)


@nested_router.post("/", response_model=FeatureResponse, status_code=201)
def create_feature(
    initiative_slug: str, entity_slug: str, data: FeatureCreate, client: Client
):
    return feature_service.create_feature(initiative_slug, entity_slug, data, client)


@flat_router.get(
    "/{initiative_slug}/{entity_slug}/{feature_slug}",
    response_model=FeatureResponse,
)
def get_feature(
    initiative_slug: str, entity_slug: str, feature_slug: str, client: Client
):
    return feature_service.get_feature(initiative_slug, entity_slug, feature_slug, client)


@flat_router.put(
    "/{initiative_slug}/{entity_slug}/{feature_slug}",
    response_model=FeatureResponse,
)
def update_feature(
    initiative_slug: str,
    entity_slug: str,
    feature_slug: str,
    data: FeatureUpdate,
    client: Client,
):
    return feature_service.update_feature(
        initiative_slug, entity_slug, feature_slug, data, client
    )


@flat_router.delete(
    "/{initiative_slug}/{entity_slug}/{feature_slug}",
    status_code=204,
)
def delete_feature(
    initiative_slug: str, entity_slug: str, feature_slug: str, client: Client
):
    feature_service.delete_feature(initiative_slug, entity_slug, feature_slug, client)
