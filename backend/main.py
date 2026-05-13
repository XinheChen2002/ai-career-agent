"""
backend/main.py

FastAPI backend wrapper for the AI Career Agent project.

This file connects the React frontend to the existing career recommendation
pipeline in src/core/pipeline.py and keeps the API response compatible with
src/schemas.py.

Main endpoints:
- GET  /health
- GET  /jobs
- GET  /graph-summary
- POST /recommend
- POST /recommend/state

Run locally:
    uvicorn backend.main:app --reload

If you run this file directly:
    python backend/main.py
"""

from __future__ import annotations

import sys
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List, Optional

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# -----------------------------------------------------------------------------
# Project paths
# -----------------------------------------------------------------------------

# backend/main.py -> project root is one level up
ROOT_DIR = Path(__file__).resolve().parents[1]
SRC_DIR = ROOT_DIR / "src"
CORE_DIR = SRC_DIR / "core"
SRC_CORE_DIR = ROOT_DIR / "src" / "core"


# Make imports robust whether the project is run from root, backend/, or tests.
for path in (ROOT_DIR, SRC_DIR, CORE_DIR):
    path_str = str(path)
    if path_str not in sys.path:
        sys.path.insert(0, path_str)


# Existing project modules
try:
    from src.core.pipeline import CareerRecommendationPipeline, run_pipeline
except ImportError as exc:
    raise ImportError(
        "Could not import pipeline.py. Make sure src/core/pipeline.py exists and "
        "that backend/main.py is inside the backend/ folder."
    ) from exc

try:
    from src.schemas import UserProfile, CareerState, SkillGapResult, RoadmapResult
except ImportError as exc:
    raise ImportError(
        "Could not import schemas.py. Make sure src/schemas.py exists."
    ) from exc


# -----------------------------------------------------------------------------
# API request / response models
# -----------------------------------------------------------------------------

class RecommendationRequest(BaseModel):
    """
    Request body accepted by the React frontend.

    It supports both naming styles:
    - frontend/API style: current_job, target_job, user_background
    - schema style: current_role, target_role, background
    """

    current_job: Optional[str] = None
    target_job: Optional[str] = None
    user_background: Optional[str] = None

    current_role: Optional[str] = None
    target_role: Optional[str] = None
    background: Optional[str] = None

    current_skills: List[str] = Field(default_factory=list)
    time_frame: str = "12 weeks"
    location: str = ""

    def resolved_current_role(self) -> str:
        return (self.current_job or self.current_role or "").strip()

    def resolved_target_role(self) -> str:
        return (self.target_job or self.target_role or "").strip()

    def resolved_background(self) -> str:
        return (self.user_background or self.background or "").strip()


class ApiInfo(BaseModel):
    app_name: str
    status: str
    message: str


# -----------------------------------------------------------------------------
# Data loading
# -----------------------------------------------------------------------------

DATA_PATH_CANDIDATES = [
    ROOT_DIR / "src"/ "data" / "future_jobs_dataset.csv",
]


class DataLoadError(RuntimeError):
    pass


def find_data_path() -> Path:
    """Find the first existing career dataset path."""
    for path in DATA_PATH_CANDIDATES:
        if path.exists():
            return path

    searched = "\n".join(f"- {path}" for path in DATA_PATH_CANDIDATES)
    raise DataLoadError(
        "Could not find the career dataset. I searched these paths:\n"
        f"{searched}\n\n"
        "Please put your CSV in one of these locations, or update "
        "DATA_PATH_CANDIDATES in backend/main.py."
    )


def load_jobs_dataframe() -> pd.DataFrame:
    """
    Load the job dataset used by CareerRecommendationPipeline.

    The existing pipeline expects at least:
    - job_title
    - skills_required
    """
    data_path = find_data_path()
    df = pd.read_csv(data_path)

    required_columns = {"job_title", "skills_required"}
    missing_columns = required_columns - set(df.columns)
    if missing_columns:
        raise DataLoadError(
            f"Dataset found at {data_path}, but it is missing columns: "
            f"{sorted(missing_columns)}. Required columns are: "
            f"{sorted(required_columns)}."
        )

    return df


@lru_cache(maxsize=1)
def get_pipeline() -> CareerRecommendationPipeline:
    """
    Create and cache the pipeline once.

    This avoids rebuilding the career graph for every API request.
    Restart the backend after changing the CSV.
    """
    df = load_jobs_dataframe()
    return CareerRecommendationPipeline(df)
def reload_pipeline() -> None:
    """
    Clear the cached pipeline.

    The next call to get_pipeline() will reload the jobs dataframe
    and rebuild the CareerRecommendationPipeline.
    """
    get_pipeline.cache_clear()
# -----------------------------------------------------------------------------
# Response shaping helpers
# -----------------------------------------------------------------------------

def pipeline_result_to_career_state(
    request: RecommendationRequest,
    pipeline_response: Dict[str, Any],
) -> CareerState:
    """
    Convert the current pipeline.py output into the CareerState schema.

    This keeps the backend compatible with schemas.py while still allowing
    /recommend to return the complete raw pipeline result for the frontend.
    """
    target_role = request.resolved_target_role()
    current_role = request.resolved_current_role()
    background = request.resolved_background()

    result = pipeline_response.get("result") or {}
    skills = result.get("skills") or {}
    roadmap_items = result.get("roadmap") or []

    user_profile = UserProfile(
        current_role=current_role,
        target_role=target_role,
        current_skills=request.current_skills,
        background=background,
        time_frame=request.time_frame,
        location=request.location,
    )

    skill_gap = SkillGapResult(
        current_skills=skills.get("current", []),
        target_skills=skills.get("target", []),
        shared_skills=skills.get("shared", []),
        missing_skills=skills.get("missing", []),
    )

    weekly_plan = []
    for item in roadmap_items:
        if isinstance(item, dict):
            step = item.get("step", "")
            skill = item.get("skill", "")
            action = item.get("suggested_action") or item.get("learning_goal") or ""
            weekly_plan.append(f"Step {step}: {skill}. {action}".strip())
        else:
            weekly_plan.append(str(item))

    roadmap = RoadmapResult(
        target_role=target_role,
        time_frame=request.time_frame,
        weekly_plan=weekly_plan,
    )

    final_report = result.get("explanation") or pipeline_response.get("message")

    return CareerState(
        raw_profile=request.model_dump(),
        user_profile=user_profile.model_dump(),
        market_profile={
            "target_role": target_role,
            "required_skills": skills.get("target", []),
        },
        skill_gap=skill_gap.model_dump(),
        roadmap=roadmap.model_dump(),
        final_report=final_report,
    )


def run_recommendation(request: RecommendationRequest) -> Dict[str, Any]:
    """Run validation + pipeline execution."""
    target_role = request.resolved_target_role()
    current_role = request.resolved_current_role()
    background = request.resolved_background()

    if not target_role:
        raise HTTPException(
            status_code=422,
            detail="target_job or target_role is required.",
        )

    try:
        pipeline = get_pipeline()
        return pipeline.run(
            current_job=current_role,
            target_job=target_role,
            user_background=background,
        )
    except DataLoadError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Pipeline failed: {exc}",
        ) from exc


# -----------------------------------------------------------------------------
# FastAPI app
# -----------------------------------------------------------------------------

app = FastAPI(
    title="AI Career Agent API",
    description="Backend API for the AI Career Agent React frontend.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_model=ApiInfo)
def root() -> ApiInfo:
    return ApiInfo(
        app_name="AI Career Agent API",
        status="running",
        message="Use /health, /jobs, /graph-summary, or POST /recommend.",
    )


@app.get("/health")
def health() -> Dict[str, Any]:
    """Check whether the API and pipeline can load successfully."""
    try:
        data_path = find_data_path()
        pipeline = get_pipeline()
        graph_summary = pipeline.get_graph_summary()
        return {
            "status": "ok",
            "data_path": str(data_path),
            "graph_summary": graph_summary,
        }
    except Exception as exc:
        return {
            "status": "error",
            "message": str(exc),
        }


@app.get("/jobs")
def get_jobs() -> Dict[str, Any]:
    """Return all available jobs in the current career graph."""
    try:
        jobs = get_pipeline().get_available_jobs()
        return {
            "status": "success",
            "count": len(jobs),
            "jobs": jobs,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.get("/graph-summary")
def get_graph_summary() -> Dict[str, Any]:
    """Return graph summary from CareerRecommendationPipeline."""
    try:
        return {
            "status": "success",
            "graph_summary": get_pipeline().get_graph_summary(),
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/recommend")
def recommend(request: RecommendationRequest) -> Dict[str, Any]:
    """
    Main endpoint for the React frontend.

    Returns the complete raw pipeline.py output plus a CareerState-compatible
    field called career_state.
    """
    pipeline_response = run_recommendation(request)
    career_state = pipeline_result_to_career_state(request, pipeline_response)

    return {
        **pipeline_response,
        "career_state": career_state.model_dump(),
    }


@app.post("/recommend/state", response_model=CareerState)
def recommend_as_state(request: RecommendationRequest) -> CareerState:
    """
    Schema-first endpoint.

    Returns only the CareerState structure from schemas.py.
    Useful for tests or future agent workflows.
    """
    pipeline_response = run_recommendation(request)
    return pipeline_result_to_career_state(request, pipeline_response)



# -----------------------------------------------------------------------------
# Local execution
# -----------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
