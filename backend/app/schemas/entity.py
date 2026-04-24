from pydantic import BaseModel


class EntityCreate(BaseModel):
    name: str


class EntityResponse(BaseModel):
    slug: str
    initiative_slug: str
    name: str
    feature_count: int
