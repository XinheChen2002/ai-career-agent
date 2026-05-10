"""
cli.py

Command line interface for the AI career transition recommendation system.

This CLI supports:
1. Basic graph exploration
2. Skill gap recommendation
3. Full career recommendation pipeline
"""

from src.core.data_loader import load_data
from src.core.career_graph import CareerTransitionGraph

# If your pipeline file is named differently, adjust this import.
# Recommended file path:
# src/workflows/career_pipeline.py
from src.core.pipeline import run_pipeline


def build_graph(df):
    """
    Build the career transition graph from the loaded dataset.
    """
    graph = CareerTransitionGraph(df)
    graph.build_graph()
    return graph


def print_available_jobs(graph):
    """
    Print all available jobs in the graph.
    """
    print("\n=== Available Jobs ===")

    for job in sorted(graph.job_to_skills.keys()):
        print("-", job)


def print_transition_path(graph):
    """
    Find and print the transition path between two jobs.

    If the current job does not exist but the target job exists,
    fall back to beginner mode and recommend all target-job skills.
    """
    start_job = input("Enter your current job: ").strip()
    target_job = input("Enter your target job: ").strip()

    distance, path = graph.find_transition_path(start_job, target_job)

    print("\n=== Transition Result ===")

    if distance != -1:
        print("Distance:", distance)
        print("Path:")

        for node in path:
            print("-", node)

        return

    recommendation = graph.recommend_skills_with_fallback(
        start_job,
        target_job,
    )

    if recommendation is None:
        print("No transition path found.")
        print("The target job also does not exist in the graph.")
        print("Please choose one of the available jobs as target job.")
        return

    if recommendation["mode"] == "beginner_fallback":
        print("No direct transition path found.")
        print("\nThe current job was not found in the graph.")
        print("The system will treat this as a beginner or unknown-background transition.")
        print(f"\nTarget job: {target_job}")

        print("\nSkills to learn:")
        for skill in sorted(recommendation["missing"]):
            print("-", skill)

        print("\nSuggested beginner roadmap:")
        for index, skill in enumerate(sorted(recommendation["missing"]), start=1):
            print(
                f"- Step {index}: Learn and practice {skill} "
                "through a small project."
            )

        print("- Final Step: Combine these skills into one portfolio project.")
        return

    print("No transition path found.")


def print_missing_skills_by_jobs(graph):
    """
    Recommend missing skills based on current job and target job.
    """
    current_job = input("Enter your current job: ").strip()
    target_job = input("Enter your target job: ").strip()

    recommendation = graph.recommend_skills_with_fallback(
        current_job,
        target_job,
    )

    print("\n=== Missing Skills Recommendation ===")

    if recommendation is None:
        print("Target job does not exist in the graph.")
        print("Please choose one of the available target jobs.")
        return

    print("\nMode:", recommendation["mode"])
    print(recommendation["message"])

    print("\nCurrent skills:")
    if recommendation["current"]:
        for skill in sorted(recommendation["current"]):
            print("-", skill)
    else:
        print("- None detected")

    print("\nTarget skills:")
    for skill in sorted(recommendation["target"]):
        print("-", skill)

    print("\nShared skills:")
    if recommendation["shared"]:
        for skill in sorted(recommendation["shared"]):
            print("-", skill)
    else:
        print("- None")

    print("\nMissing skills:")
    if recommendation["missing"]:
        for skill in sorted(recommendation["missing"]):
            print("-", skill)
    else:
        print("- No missing skills detected")


def print_jobs_by_skill(graph):
    """
    Find jobs that require a given skill.
    """
    skill = input("Enter a skill: ").strip()

    jobs = graph.get_jobs_for_skill(skill)

    print(f"\n=== Jobs Requiring '{skill}' ===")

    if not jobs:
        print("No jobs found for this skill.")
        return

    for job in sorted(jobs):
        print("-", job)


def print_graph_summary(graph):
    """
    Print summary statistics of the graph.
    """
    summary = graph.graph_summary()

    print("\n=== Graph Summary ===")
    for key, value in summary.items():
        print(f"{key}: {value}")


def parse_skills_input(skills_text):
    """
    Convert comma-separated skill input into a clean list.
    """
    if not skills_text:
        return []

    return [
        skill.strip().lower()
        for skill in skills_text.split(",")
        if skill.strip()
    ]


def print_pipeline_result(result):
    """
    Print pipeline result in a readable CLI format.
    """
    print("\n=== Career Recommendation Result ===")

    if result["status"] != "success":
        print("\nStatus:", result["status"])
        print("Message:", result["message"])

        available_jobs = result.get("available_jobs", [])
        if available_jobs:
            print("\nAvailable target jobs:")
            for job in available_jobs:
                print("-", job)

        return

    output = result["result"]

    print("\nStatus: success")
    print("Recommendation mode:", result.get("recommendation_mode"))
    print("Message:", result.get("message"))

    print("\n--- Explanation ---")
    print(output["explanation"])

    print("\n--- Transition Path ---")
    transition_path = output.get("transition_path", [])

    if transition_path:
        for item in transition_path:
            print(f"- {item['type']}: {item['name']}")
    else:
        print("- No graph transition path found")

    print("\n--- Current Skills ---")
    current_skills = output["skills"]["current"]

    if current_skills:
        for skill in current_skills:
            print("-", skill)
    else:
        print("- None detected")

    print("\n--- Target Skills ---")
    target_skills = output["skills"]["target"]

    if target_skills:
        for skill in target_skills:
            print("-", skill)
    else:
        print("- None detected")

    print("\n--- Shared Skills ---")
    shared_skills = output["skills"]["shared"]

    if shared_skills:
        for skill in shared_skills:
            print("-", skill)
    else:
        print("- None")

    print("\n--- Missing Skills ---")
    missing_skills = output["skills"]["missing"]

    if missing_skills:
        for skill in missing_skills:
            print("-", skill)
    else:
        print("- No missing skills detected")

    print("\n--- Roadmap ---")
    roadmap = output["roadmap"]

    if roadmap:
        for item in roadmap:
            print(f"{item['step']}. {item['skill']}")
            print(f"   Goal: {item['learning_goal']}")
            print(f"   Action: {item['suggested_action']}")
    else:
        print("- No roadmap generated")


def run_career_pipeline(df):
    """
    Run the full career recommendation pipeline from CLI input.
    """
    print("\n=== AI Career Recommendation Pipeline ===")

    current_job = input(
        "Enter your current job, or leave blank if beginner: "
    ).strip()

    target_job = input("Enter your target job: ").strip()

    skills_text = input(
        "Enter your current skills, separated by commas, or leave blank: "
    ).strip()

    background = input(
        "Briefly describe your background, or leave blank: "
    ).strip()

    current_skills = parse_skills_input(skills_text)

    if current_job == "":
        current_job = None

    if background == "":
        background = None

    result = run_pipeline(
        df=df,
        current_job=current_job,
        target_job=target_job,
        user_background=background,
        current_skills=current_skills,
    )

    print_pipeline_result(result)


def main():
    """
    Main CLI menu.
    """
    df = load_data()
    graph = build_graph(df)

    while True:
        print("\n=== AI Career Transition Network ===")
        print("1. Show all jobs")
        print("2. Find transition path")
        print("3. Recommend missing skills by jobs")
        print("4. Find jobs by skill")
        print("5. Show graph summary")
        print("6. Run full career recommendation pipeline")
        print("7. Exit")

        choice = input("Choose an option: ").strip()

        if choice == "1":
            print_available_jobs(graph)

        elif choice == "2":
            print_transition_path(graph)

        elif choice == "3":
            print_missing_skills_by_jobs(graph)

        elif choice == "4":
            print_jobs_by_skill(graph)

        elif choice == "5":
            print_graph_summary(graph)

        elif choice == "6":
            run_career_pipeline(df)

        elif choice == "7":
            print("Goodbye!")
            break

        else:
            print("Invalid option. Please choose 1–7.")


if __name__ == "__main__":
    main()