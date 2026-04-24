"""CRUD for entity folders within an initiative."""

from __future__ import annotations

import re

from fastapi import HTTPException

from app.core.github_client import GitHubClient
from app.schemas.entity import EntityCreate, EntityResponse


def _slugify(name: str) -> str:
    slug = name.lower().strip()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    return slug.strip("-")


def _display_name(slug: str) -> str:
    return slug.replace("-", " ").title()


def list_entities(initiative_slug: str, client: GitHubClient) -> list[EntityResponse]:
    path = initiative_slug
    contents = client.list_contents(path)
    entities: list[EntityResponse] = []
    for item in contents:
        if item.type != "dir":
            continue
        slug = item.name
        # Count .feature files
        sub = client.list_contents(f"{path}/{slug}")
        feature_count = sum(1 for s in sub if s.type == "file" and s.name.endswith(".feature"))
        entities.append(
            EntityResponse(
                slug=slug,
                initiative_slug=initiative_slug,
                name=_display_name(slug),
                feature_count=feature_count,
            )
        )
    return entities


def create_entity(
    initiative_slug: str, data: EntityCreate, client: GitHubClient
) -> EntityResponse:
    slug = _slugify(data.name)
    path = f"{initiative_slug}/{slug}"
    client.create_folder(path, f"feat: create entity {slug} in {initiative_slug}")
    return EntityResponse(
        slug=slug,
        initiative_slug=initiative_slug,
        name=_display_name(slug),
        feature_count=0,
    )


def delete_entity(initiative_slug: str, entity_slug: str, client: GitHubClient) -> None:
    path = f"{initiative_slug}/{entity_slug}"
    contents = client.list_contents(path)
    if not contents:
        raise HTTPException(status_code=404, detail=f"Entity '{entity_slug}' not found")
    client.delete_folder(path, f"delete: remove entity {entity_slug} from {initiative_slug}")
