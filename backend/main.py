from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.initiatives import router as initiatives_router
from app.api.v1.entities import router as entities_router
from app.api.v1.features import nested_router as features_nested_router
from app.api.v1.features import flat_router as features_flat_router
from app.api.v1.stories import nested_router as stories_nested_router
from app.api.v1.stories import flat_router as stories_flat_router
from app.api.v1.tree import router as tree_router

app = FastAPI(title="Product Initiative Manager")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(initiatives_router, prefix="/api/v1")
app.include_router(entities_router, prefix="/api/v1")
app.include_router(features_nested_router, prefix="/api/v1")
app.include_router(features_flat_router, prefix="/api/v1")
app.include_router(stories_nested_router, prefix="/api/v1")
app.include_router(stories_flat_router, prefix="/api/v1")
app.include_router(tree_router, prefix="/api/v1")


@app.get("/")
async def read_root():
    return {"message": "Product Initiative Manager API"}


@app.get("/health")
async def health():
    return {"status": "ok"}
