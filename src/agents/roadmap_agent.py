from src.schemas import RoadmapResult, UserProfile, SkillGapResult


class RoadmapAgent:
    """
    Converts missing skills into a simple learning roadmap.
    """

    def run(
        self,
        user_profile: UserProfile,
        skill_gap: SkillGapResult,
    ) -> RoadmapResult:
        missing_skills = skill_gap.missing_skills

        if not missing_skills:
            weekly_plan = [
                "Week 1-2: Refine your portfolio and update your resume.",
                "Week 3-4: Practice interview questions for the target role.",
                "Week 5-6: Build one small project related to the target role.",
                "Week 7-8: Apply to internships or entry-level roles.",
            ]
        else:
            weekly_plan = []

            for index, skill in enumerate(missing_skills, start=1):
                weekly_plan.append(
                    f"Week {index}: Learn and practice {skill} through a small project."
                )

            weekly_plan.append(
                "Final Week: Combine the learned skills into one portfolio project."
            )

        return RoadmapResult(
            target_role=user_profile.target_role,
            time_frame=user_profile.time_frame,
            weekly_plan=weekly_plan,
        )