from __future__ import annotations

from pydantic import BaseModel


class GherkinStep(BaseModel):
    keyword: str  # Given, When, Then, And, But
    text: str


class StoryCreate(BaseModel):
    title: str
    steps: list[GherkinStep] = []
    status: str = "draft"


class StoryUpdate(BaseModel):
    title: str | None = None
    steps: list[GherkinStep] | None = None
    status: str | None = None


class StoryResponse(BaseModel):
    index: int
    title: str
    status: str
    steps: list[GherkinStep]
