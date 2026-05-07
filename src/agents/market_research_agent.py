from src.schemas import MarketSkillProfile


class MarketResearchAgent:
    """
    Retrieves required skills for a target role.

    First version uses the local job-skill graph.
    Later version can use browser-use to search real job descriptions.
    """

    def __init__(self, graph):
        self.graph = graph

    def run(self, target_role: str) -> MarketSkillProfile:
        skills = self.graph.get_skills_for_job(target_role)

        return MarketSkillProfile(
            target_role=target_role,
            required_skills=sorted(list(skills)),
        )