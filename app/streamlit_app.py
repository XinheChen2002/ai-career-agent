import sys
from pathlib import Path

import streamlit as st

# Add project root to Python path so Streamlit can import src modules
PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(PROJECT_ROOT))

from src.core.data_loader import load_data
from src.core.career_graph import CareerTransitionGraph
from src.workflows.career_workflow import CareerWorkflow


@st.cache_resource
def load_graph():
    """
    Load dataset and build the career graph once.
    Streamlit will cache this so it does not reload on every interaction.
    """
    df = load_data()
    graph = CareerTransitionGraph(df)
    graph.build_graph()
    return graph


def main():
    st.set_page_config(
        page_title="AI Career Agent",
        page_icon="🧭",
        layout="wide",
    )

    st.title("AI Career Agent")
    st.caption(
        "A graph-based multi-agent prototype for career path recommendation."
    )

    graph = load_graph()
    workflow = CareerWorkflow(graph)

    with st.sidebar:
        st.header("User Profile")

        current_role = st.text_input(
            "Current Role",
            value="data analyst",
        )

        target_role = st.selectbox(
            "Target Role",
            options=sorted(graph.job_to_skills.keys()),
            index=sorted(graph.job_to_skills.keys()).index("ai engineer")
            if "ai engineer" in graph.job_to_skills
            else 0,
        )

        current_skills_text = st.text_area(
            "Current Skills",
            value="python, sql, data analysis",
            help="Separate skills with commas.",
        )

        background = st.text_area(
            "Background",
            value="Master student with data science and research experience.",
        )

        time_frame = st.text_input(
            "Time Frame",
            value="12 weeks",
        )

        location = st.text_input(
            "Preferred Location",
            value="Shanghai",
        )

        run_button = st.button("Generate Career Roadmap")

    st.subheader("Available Jobs in Current Graph")

    jobs = sorted(graph.job_to_skills.keys())
    st.write(", ".join(jobs))

    if run_button:
        current_skills = [
            skill.strip().lower()
            for skill in current_skills_text.split(",")
            if skill.strip()
        ]

        raw_profile = {
            "current_role": current_role,
            "target_role": target_role,
            "current_skills": current_skills,
            "background": background,
            "time_frame": time_frame,
            "location": location,
        }

        result = workflow.run(raw_profile)

        st.divider()

        col1, col2 = st.columns(2)

        with col1:
            st.subheader("User Profile")
            st.json(result["user_profile"])

        with col2:
            st.subheader("Market Profile")
            st.json(result["market_profile"])

        st.subheader("Skill Gap")

        skill_gap = result["skill_gap"]

        gap_col1, gap_col2, gap_col3 = st.columns(3)

        with gap_col1:
            st.markdown("**Current Skills**")
            for skill in skill_gap["current_skills"]:
                st.write(f"- {skill}")

        with gap_col2:
            st.markdown("**Shared Skills**")
            if skill_gap["shared_skills"]:
                for skill in skill_gap["shared_skills"]:
                    st.write(f"- {skill}")
            else:
                st.write("No shared skills found.")

        with gap_col3:
            st.markdown("**Missing Skills**")
            if skill_gap["missing_skills"]:
                for skill in skill_gap["missing_skills"]:
                    st.write(f"- {skill}")
            else:
                st.write("No missing skills found.")

        st.subheader("Suggested Roadmap")

        for step in result["roadmap"]["weekly_plan"]:
            st.write(f"- {step}")


if __name__ == "__main__":
    main()