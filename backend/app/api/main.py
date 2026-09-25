"""
FastAPI application entry point for the Interview Analyzer API.

Run with:
    uv run uvicorn app.api.main:app --reload

OpenAPI docs:
    http://localhost:8000/docs
    http://localhost:8000/redoc
"""

from __future__ import annotations

import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.analysis import router as analysis_router
from app.api.routes.corpus import router as corpus_router
from app.api.routes.health import router as health_router

# ============================================================
# Logging
# ============================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)

logger = logging.getLogger(__name__)


# ============================================================
# FastAPI Application
# ============================================================

app = FastAPI(
    title="Interview Analyzer API",
    description=(
        "API for expert interview transcript analysis. "
        "Analyzes individual expert interviews, extracts evidence, "
        "performs cross-expert analysis, and validates results."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


# ============================================================
# CORS
# ============================================================

_cors_origins_env = os.getenv("CORS_ALLOWED_ORIGINS", "")

if _cors_origins_env:
    _allowed_origins = [
        origin.strip()
        for origin in _cors_origins_env.split(",")
        if origin.strip()
    ]
else:
    # Development defaults. The Vite app uses port 5172; 5173 and 3000
    # remain for the previous local ports. Both localhost and 127.0.0.1
    # are listed because the browser treats them as different origins.
    _allowed_origins = [
        "http://localhost:5172",
        "http://127.0.0.1:5172",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    # The page is served from localhost while the API is on 127.0.0.1.
    # Browsers treat that as a private-network request and require this
    # header on the preflight response.
    allow_private_network=True,
)


# ============================================================
# Routers
# ============================================================

app.include_router(health_router)
app.include_router(analysis_router)
app.include_router(corpus_router)


logger.info(
    "Interview Analyzer API ready — CORS origins: %s",
    _allowed_origins,
)
