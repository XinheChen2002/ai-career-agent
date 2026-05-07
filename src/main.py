import json
from pathlib import Path

from src.core.data_loader import load_data
from src.core.career_graph import CareerTransitionGraph
from src.workflows.career_workflow import CareerWorkflow

def load_user_profile(profile_path: str) -> dict:
    """
    Load user profile from a JSON file.

    Parameters
    ----------
    profile_path : str
        Path to the user profile JSON file.

    Returns
    -------
    dict
        User profile data.
    """
    path = Path(profile_path)

    if not path.exists():
        raise FileNotFoundError(f"Profile file not found: {profile_path}")

    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)

def main():
    df = load_data()

    graph = CareerTransitionGraph(df)
    graph.build_graph()

    workflow = CareerWorkflow(graph)

    raw_profile = load_user_profile("src/data/sample_user_profile.json")

    result = workflow.run(raw_profile)

    print("\n=== User Profile ===")
    print(result["user_profile"])

    print("\n=== Market Profile ===")
    print(result["market_profile"])

    print("\n=== Skill Gap ===")
    print(result["skill_gap"])

    print("\n=== Roadmap ===")
    for item in result["roadmap"]["weekly_plan"]:
        print("-", item)


if __name__ == "__main__":
    main()