from src.schemas import SkillGapResult, UserProfile, MarketSkillProfile


class SkillGapAgent:
    """
    Compares user's current skills with target role requirements.
    """

    def run(
        self,
        user_profile: UserProfile,
        market_profile: MarketSkillProfile,
    ) -> SkillGapResult:
        current_skills = set(user_profile.current_skills)
        target_skills = set(market_profile.required_skills)

        shared_skills = current_skills & target_skills
        missing_skills = target_skills - current_skills

        return SkillGapResult(
            current_skills=sorted(list(current_skills)),
            target_skills=sorted(list(target_skills)),
            shared_skills=sorted(list(shared_skills)),
            missing_skills=sorted(list(missing_skills)),
        )