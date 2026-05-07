from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    current_role: str
    target_role: str
    current_skills: list[str] = Field(default_factory=list)
    background: str = ""
    time_frame: str = "12 weeks"
    location: str = ""


class MarketSkillProfile(BaseModel):
    target_role: str
    required_skills: list[str]


class SkillGapResult(BaseModel):
    current_skills: list[str]
    target_skills: list[str]
    shared_skills: list[str]
    missing_skills: list[str]


class RoadmapResult(BaseModel):
    target_role: str
    time_frame: str
    weekly_plan: list[str]

class CareerState(BaseModel):
    raw_profile: dict
    user_profile: dict | None = None
    market_profile: dict | None = None
    skill_gap: dict | None = None
    roadmap: dict | None = None
    final_report: str | None = None