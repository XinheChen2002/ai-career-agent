from src.core.data_loader import load_data
from src.core.career_graph import CareerTransitionGraph
from src.workflows.career_workflow import CareerWorkflow


def build_graph():
    """
    Load data and build the career transition graph.
    """
    df = load_data()

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

    # Fallback logic
    recommendation = graph.recommend_skills_with_fallback(
        start_job,
        target_job
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
            print(f"- Week {index}: Learn and practice {skill} through a small project.")

        print("- Final Week: Combine these skills into one portfolio project.")
        return

    print("No transition path found.")


def print_missing_skills_by_jobs(graph):
    """
    Recommend missing skills based on current job and target job.
    This uses the original graph-based recommendation logic.
    """
    current_job = input("Enter your current job: ").strip()
    target_job = input("Enter your target job: ").strip()

    recommendation = graph.recommend_skills_with_fallback(
        current_job, target_job
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
    for skill in sorted(recommendation["missing"]):
        print("-", skill)


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


def run_agent_workflow(graph):
    """
    Run the new multi-agent workflow from CLI input.
    """
    print("\n=== AI Career Agent Workflow ===")

    current_role = input("Enter your current role: ").strip()
    target_role = input("Enter your target role: ").strip()
    skills_text = input(
        "Enter your current skills, separated by commas: "
    ).strip()
    background = input("Briefly describe your background: ").strip()
    time_frame = input("Enter your time frame, e.g. 12 weeks: ").strip()
    location = input("Enter your preferred location: ").strip()

    current_skills = [
        skill.strip().lower()
        for skill in skills_text.split(",")
        if skill.strip()
    ]

    raw_profile = {
        "current_role": current_role,
        "target_role": target_role,
        "current_skills": current_skills,
        "background": background,
        "time_frame": time_frame or "12 weeks",
        "location": location,
    }

    workflow = CareerWorkflow(graph)
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


def main():
    graph = build_graph()

    while True:
        print("\n=== AI Career Transition Network ===")
        print("1. Show all jobs")
        print("2. Find transition path")
        print("3. Recommend missing skills by jobs")
        print("4. Find jobs by skill")
        print("5. Show graph summary")
        print("6. Run AI career agent workflow")
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
            run_agent_workflow(graph)

        elif choice == "7":
            print("Goodbye!")
            break

        else:
            print("Invalid option. Please choose 1–7.")


if __name__ == "__main__":
    main()