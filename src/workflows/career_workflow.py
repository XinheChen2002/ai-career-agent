from src.agents.profile_agent import ProfileAgent
from src.agents.market_research_agent import MarketResearchAgent
from src.agents.skill_gap_agent import SkillGapAgent
from src.agents.roadmap_agent import RoadmapAgent


class CareerWorkflow:
    """
    Sequential workflow for career path recommendation.
    """

    def __init__(self, graph):
        self.profile_agent = ProfileAgent()
        self.market_research_agent = MarketResearchAgent(graph)
        self.skill_gap_agent = SkillGapAgent()
        self.roadmap_agent = RoadmapAgent()

    def run(self, raw_profile: dict) -> dict:
        user_profile = self.profile_agent.run(raw_profile)

        market_profile = self.market_research_agent.run(
            user_profile.target_role
        )

        skill_gap = self.skill_gap_agent.run(
            user_profile=user_profile,
            market_profile=market_profile,
        )

        roadmap = self.roadmap_agent.run(
            user_profile=user_profile,
            skill_gap=skill_gap,
        )

        return {
            "user_profile": user_profile.model_dump(),
            "market_profile": market_profile.model_dump(),
            "skill_gap": skill_gap.model_dump(),
            "roadmap": roadmap.model_dump(),
        }