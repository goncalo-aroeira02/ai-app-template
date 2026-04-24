from pydantic import BaseModel


class InitiativeCreate(BaseModel):
    name: str


class InitiativeResponse(BaseModel):
    slug: str
    name: str
    entity_count: int
