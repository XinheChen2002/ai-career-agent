from src.schemas import UserProfile


class ProfileAgent:
    """
    Standardizes raw user input into a structured user profile.
    """

    def run(self, raw_profile: dict) -> UserProfile:
        return UserProfile(
            current_role=raw_profile.get("current_role", "").strip().lower(),
            target_role=raw_profile.get("target_role", "").strip().lower(),
            current_skills=[
                skill.strip().lower()
                for skill in raw_profile.get("current_skills", [])
            ],
            background=raw_profile.get("background", ""),
            time_frame=raw_profile.get("time_frame", "12 weeks"),
            location=raw_profile.get("location", ""),
        )