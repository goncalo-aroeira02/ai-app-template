"""CRUD for initiative folders via GitHub API."""

from __future__ import annotations

import re

from fastapi import HTTPException

from app.core.github_client import GitHubClient
from app.schemas.initiative import InitiativeCreate, InitiativeResponse


def _slugify(name: str) -> str:
    slug = name.lower().strip()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    return slug.strip("-")


def _display_name(slug: str) -> str:
    return slug.replace("-", " ").title()


def list_initiatives(client: GitHubClient) -> list[InitiativeResponse]:
    contents = client.list_contents("")
    initiatives: list[InitiativeResponse] = []
    for item in contents:
        if item.type != "dir":
            continue
        slug = item.name
        # Count entity sub-dirs
        sub = client.list_contents(slug)
        entity_count = sum(1 for s in sub if s.type == "dir")
        initiatives.append(
            InitiativeResponse(slug=slug, name=_display_name(slug), entity_count=entity_count)
        )
    return initiatives


def create_initiative(data: InitiativeCreate, client: GitHubClient) -> InitiativeResponse:
    slug = _slugify(data.name)
    client.create_folder(slug, f"feat: create initiative {slug}")
    return InitiativeResponse(slug=slug, name=_display_name(slug), entity_count=0)


def delete_initiative(slug: str, client: GitHubClient) -> None:
    contents = client.list_contents(slug)
    if not contents:
        raise HTTPException(status_code=404, detail=f"Initiative '{slug}' not found")
    client.delete_folder(slug, f"delete: remove initiative {slug}")
