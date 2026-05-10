from src.schemas import RoadmapResult, UserProfile, SkillGapResult


class RoadmapAgent:
    """
    Converts missing skills into a simple learning roadmap.
    """

    role = "Career Roadmap Planner"
    goal = "Convert skill gaps into a practical learning plan."
    task = "Generate a beginner-friendly roadmap based on missing skills."

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
            weekly_plan = self._build_skill_roadmap(missing_skills)

        return RoadmapResult(
            target_role=user_profile.target_role,
            time_frame=user_profile.time_frame,
            weekly_plan=weekly_plan,
        )

    def _build_skill_roadmap(self, missing_skills):
        """
        Build a beginner-friendly roadmap from missing skills.
        """
        skills = [skill.lower() for skill in missing_skills]
        weekly_plan = []
        week = 1

        if "python" in skills:
            weekly_plan.append(
                f"Week {week}: Learn Python basics, including variables, loops, functions, and simple data structures."
            )
            week += 1
            skills.remove("python")
        else:
            weekly_plan.append(
                f"Week {week}: Set up the coding environment and review basic programming concepts."
            )
            week += 1

        for skill in skills:
            weekly_plan.append(
                f"Week {week}: Learn and practice {skill} through a small hands-on exercise."
            )
            week += 1

        weekly_plan.append(
            f"Week {week}: Build one portfolio project that combines the learned skills."
        )

        return weekly_plan