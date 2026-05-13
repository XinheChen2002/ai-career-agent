"""
pipeline.py

Main pipeline for the career path recommendation multi-agent project.

This file connects:
1. User input
2. CareerTransitionGraph
3. Skill gap analysis
4. Roadmap generation
5. Final structured output

It is designed to be used by:
- CLI
- FastAPI / Flask backend
- Frontend
- Tests
"""

from typing import Optional, Dict, Any, List
import pandas as pd
import re

from career_graph import CareerTransitionGraph


# ============================================================
# Helper functions
# ============================================================

def normalize_text(text: Optional[str]) -> str:
    """
    Normalize user input text for matching.
    """
    if text is None:
        return ""

    return str(text).strip().lower()


def clean_node_name(node: str) -> str:
    """
    Remove graph prefixes such as 'job:' and 'skill:' for display.
    """
    if node.startswith("job:"):
        return node.replace("job:", "")
    if node.startswith("skill:"):
        return node.replace("skill:", "")
    return node


def format_transition_path(path: List[str]) -> List[Dict[str, str]]:
    """
    Convert raw graph path nodes into readable path items.

    Example:
    ["job:data analyst", "skill:python", "job:data scientist"]

    becomes:
    [
        {"type": "job", "name": "data analyst"},
        {"type": "skill", "name": "python"},
        {"type": "job", "name": "data scientist"}
    ]
    """
    formatted_path = []

    for node in path:
        if node.startswith("job:"):
            formatted_path.append(
                {
                    "type": "job",
                    "name": clean_node_name(node),
                }
            )
        elif node.startswith("skill:"):
            formatted_path.append(
                {
                    "type": "skill",
                    "name": clean_node_name(node),
                }
            )
        else:
            formatted_path.append(
                {
                    "type": "unknown",
                    "name": node,
                }
            )

    return formatted_path


def sort_skills(skills) -> List[str]:
    """
    Convert a set/list of skills into a sorted list.
    """
    if skills is None:
        return []

    return sorted(list(skills))


def generate_basic_roadmap(missing_skills: List[str]) -> List[Dict[str, Any]]:
    """
    Generate a simple learning roadmap from missing skills.

    This is a rule-based fallback roadmap generator.
    Later, this can be replaced by roadmap_agent.py.
    """
    roadmap = []

    for index, skill in enumerate(missing_skills, start=1):
        roadmap.append(
            {
                "step": index,
                "skill": skill,
                "learning_goal": f"Build practical understanding of {skill}.",
                "suggested_action": (
                    f"Learn the core concepts of {skill}, then complete "
                    f"a small exercise or mini project using this skill."
                ),
            }
        )

    return roadmap


def generate_pipeline_explanation(
    current_job: Optional[str],
    target_job: str,
    recommendation: Optional[Dict[str, Any]],
    distance: int,
) -> str:
    """
    Generate a readable explanation for the pipeline result.
    """
    if recommendation is None:
        return (
            f"The target job '{target_job}' was not found in the current career graph. "
            "The system could not calculate missing skills from the graph."
        )

    mode = recommendation.get("mode")

    if mode == "beginner_fallback":
        return (
            f"The current job '{current_job}' was not found in the graph, "
            f"but the target job '{target_job}' was found. "
            "So the system treats the user as a beginner or unknown-background user "
            "and recommends all skills required for the target job."
        )

    if mode == "job_to_job":
        if distance == -1:
            return (
                f"Both '{current_job}' and '{target_job}' were found in the graph. "
                "The system compared their required skills, but no transition path "
                "was found between the two jobs."
            )

        return (
            f"Both '{current_job}' and '{target_job}' were found in the graph. "
            f"The system calculated the transition path and identified missing skills "
            f"by comparing the current job's skills with the target job's skills."
        )

    return recommendation.get(
        "message",
        "The system generated a recommendation based on the career graph.",
    )


# ============================================================
# Main pipeline class
# ============================================================

class CareerRecommendationPipeline:
    """
    Main pipeline for career path recommendation.

    Parameters
    ----------
    df:
        A pandas DataFrame containing at least:
        - job_title
        - skills_required
    """

    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()

        if "job_title" in self.df.columns:
            self.df["job_title"] = self.df["job_title"].apply(normalize_text)
        self.graph = CareerTransitionGraph(self.df)
        self.graph.build_graph()

    def get_available_jobs(self) -> List[str]:
        """
        Return all available jobs in the current graph.
        """
        return sorted(list(self.graph.job_to_skills.keys()))

    def get_graph_summary(self) -> Dict[str, Any]:
        """
        Return summary information about the graph.
        """
        return self.graph.graph_summary()

    def run(
        self,
        target_job: str,
        current_job: Optional[str] = None,
        user_background: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Run the full recommendation pipeline.

        Parameters
        ----------
        target_job:
            The job the user wants to transition into.

        current_job:
            The user's current job.
            If current_job is missing or not found in the graph, the pipeline
            treats the user as a beginner or unknown-background user.

        user_background:
            Optional free-text background information from the user.
            This is not heavily used yet, but it is kept for future agent expansion.

        Returns
        -------
        Dict[str, Any]
            A structured recommendation result.
        """

        if not target_job or not str(target_job).strip():
            return {
                "status": "error",
                "message": "target_job is required.",
                "result": None,
            }

        target_job_clean = normalize_text(target_job)
        current_job_clean = normalize_text(current_job)

        # If user does not provide current job, use a placeholder.
        # This will trigger beginner fallback if the placeholder is not in the graph.
        if not current_job_clean:
            current_job_clean = "unknown beginner"

        # ------------------------------------------------------------
        # 1. Skill recommendation with fallback
        # ------------------------------------------------------------
        recommendation = self.graph.recommend_skills_with_fallback(
            current_job=current_job_clean,
            target_job=target_job_clean,
        )

        # ------------------------------------------------------------
        # 2. If target job does not exist
        # ------------------------------------------------------------
        if recommendation is None:
            return {
                "status": "target_job_not_found",
                "input": {
                    "current_job": current_job,
                    "target_job": target_job,
                    "user_background": user_background,
                },
                "graph_summary": self.get_graph_summary(),
                "available_jobs": self.get_available_jobs(),
                "message": (
                    f"Target job '{target_job}' was not found in the current graph. "
                    "Please choose one of the available jobs, or extend the dataset "
                    "to include this target job."
                ),
                "result": {
                    "current_job_found": False,
                    "target_job_found": False,
                    "transition_path": [],
                    "skills": {
                        "current": [],
                        "target": [],
                        "shared": [],
                        "missing": [],
                    },
                    "roadmap": [],
                    "explanation": (
                        f"The system cannot recommend a skill path because "
                        f"'{target_job}' does not exist in the current career graph."
                    ),
                },
            }

        # ------------------------------------------------------------
        # 3. Transition path
        # ------------------------------------------------------------
        distance, raw_path = self.graph.find_transition_path(
            start_job=current_job_clean,
            end_job=target_job_clean,
        )

        formatted_path = format_transition_path(raw_path)

        # ------------------------------------------------------------
        # 4. Skills
        # ------------------------------------------------------------
        current_skills = sort_skills(recommendation.get("current"))
        target_skills = sort_skills(recommendation.get("target"))
        shared_skills = sort_skills(recommendation.get("shared"))
        missing_skills = sort_skills(recommendation.get("missing"))

        # ------------------------------------------------------------
        # 5. Roadmap
        # ------------------------------------------------------------
        roadmap = generate_basic_roadmap(missing_skills)

        # ------------------------------------------------------------
        # 6. Explanation
        # ------------------------------------------------------------
        explanation = generate_pipeline_explanation(
            current_job=current_job_clean,
            target_job=target_job_clean,
            recommendation=recommendation,
            distance=distance,
        )

        # ------------------------------------------------------------
        # 7. Final output
        # ------------------------------------------------------------
        return {
            "status": "success",
            "input": {
                "current_job": current_job,
                "target_job": target_job,
                "user_background": user_background,
            },
            "normalized_input": {
                "current_job": current_job_clean,
                "target_job": target_job_clean,
            },
            "graph_summary": self.get_graph_summary(),
            "available_jobs": self.get_available_jobs(),
            "recommendation_mode": recommendation.get("mode"),
            "message": recommendation.get("message"),
            "result": {
                "current_job_found": recommendation.get("current_job_found"),
                "target_job_found": recommendation.get("target_job_found"),
                "transition_distance": distance,
                "transition_path": formatted_path,
                "skills": {
                    "current": current_skills,
                    "target": target_skills,
                    "shared": shared_skills,
                    "missing": missing_skills,
                },
                "roadmap": roadmap,
                "explanation": explanation,
            },
        }


# ============================================================
# Functional wrapper
# ============================================================
def normalize_text(value: Optional[str]) -> Optional[str]:
    """
    Normalize job names and user text for consistent matching.
    """
    if value is None:
        return None

    value = str(value).strip().lower()
    value = value.replace("_", " ")
    value = value.replace("-", " ")
    value = re.sub(r"\s+", " ", value)

    return value

def run_pipeline(
    df: pd.DataFrame,
    target_job: str,
    current_job: Optional[str] = None,
    user_background: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Simple function wrapper for running the pipeline.

    This is useful for CLI, API, and tests.
    """
    target_job = normalize_text(target_job)
    current_job = normalize_text(current_job)
    user_background = normalize_text(user_background)

    pipeline = CareerRecommendationPipeline(df)

    return pipeline.run(
        target_job=target_job,
        current_job=current_job,
        user_background=user_background,
    )



# ============================================================
# Local test
# ============================================================

if __name__ == "__main__":
    # Replace this path with your real dataset path.
    data_path = "data/processed_jobs.csv"

    df = pd.read_csv(data_path)

    result = run_pipeline(
        df=df,
        current_job="data analyst",
        target_job="ai engineer",
        user_background="Beginner interested in AI career transition.",
    )

    from pprint import pprint
    pprint(result)