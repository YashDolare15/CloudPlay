from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import cloud_pc, games, session, host


app = FastAPI(
    title="CloudPlay API",
    description="Backend API for CloudPlay",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# CLOUD PC ROUTES
# =========================

app.include_router(
    cloud_pc.router,
    prefix="/api/cloud-pc",
    tags=["Cloud PC"],
)


# =========================
# GAME ROUTES
# =========================

app.include_router(
    games.router,
    prefix="/api/games",
    tags=["Games"],
)


# =========================
# SESSION ROUTES
# =========================

app.include_router(
    session.router,
)


# =========================
# HOST ROUTES
# =========================

app.include_router(
    host.router,
)


# =========================
# ROOT
# =========================

@app.get("/")
def root():
    return {"message": "CloudPlay API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}