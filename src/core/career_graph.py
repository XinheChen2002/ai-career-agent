import re
import pandas as pd
from collections import defaultdict, deque


def parse_skills(skill_text):
    """
    Convert a raw skills_required string into a cleaned list of skills.
    """
    if pd.isna(skill_text):
        return []

    skill_text = str(skill_text).strip()

    if not skill_text:
        return []

    skill_text = skill_text.replace("[", "").replace("]", "")
    skill_text = skill_text.replace("'", "").replace('"', "")

    parts = re.split(r"[,;|/]", skill_text)

    skills = []
    for skill in parts:
        skill = skill.strip().lower()
        if skill:
            skills.append(skill)

    return skills


class CareerTransitionGraph:
    """
    A graph structure for modeling relationships between jobs and skills.
    """

    def __init__(self, df):
        self.df = df.copy()
        self.adjList = {}
        self.job_to_skills = defaultdict(set)
        self.skill_to_jobs = defaultdict(set)

    def _add_node_if_not_exists(self, node_name):
        if node_name not in self.adjList:
            self.adjList[node_name] = {}

    def _normalize_job(self, job_title):
        return str(job_title).strip().lower()

    def _normalize_skill(self, skill_name):
        return str(skill_name).strip().lower()

    def _add_job_skill_edges(self, job_title, skills):
        job_clean = self._normalize_job(job_title)
        job_node = f"job:{job_clean}"

        self._add_node_if_not_exists(job_node)

        for skill in skills:
            skill_clean = self._normalize_skill(skill)
            skill_node = f"skill:{skill_clean}"

            self._add_node_if_not_exists(skill_node)

            self.adjList[job_node][skill_node] = "requires"
            self.adjList[skill_node][job_node] = "required_by"

            self.job_to_skills[job_clean].add(skill_clean)
            self.skill_to_jobs[skill_clean].add(job_clean)

    def build_graph(self):
        self.adjList = {}
        self.job_to_skills = defaultdict(set)
        self.skill_to_jobs = defaultdict(set)

        for _, row in self.df.iterrows():
            job_title = row.get("job_title", None)
            raw_skills = row.get("skills_required", None)

            if pd.isna(job_title):
                continue

            job_title = str(job_title).strip()
            if not job_title:
                continue

            skills = parse_skills(raw_skills)
            if not skills:
                continue

            self._add_job_skill_edges(job_title, skills)

    def find_transition_path(self, start_job, end_job):
        start_node = f"job:{self._normalize_job(start_job)}"
        end_node = f"job:{self._normalize_job(end_job)}"

        if start_node not in self.adjList or end_node not in self.adjList:
            return [-1, []]

        if start_node == end_node:
            return [0, [start_node]]

        queue = deque([start_node])
        visited = {start_node}
        parent = {start_node: None}

        while queue:
            current = queue.popleft()

            for neighbor in self.adjList[current]:
                if neighbor in visited:
                    continue

                visited.add(neighbor)
                parent[neighbor] = current

                if neighbor == end_node:
                    path = self._reconstruct_path(parent, end_node)
                    job_count = sum(
                        1 for node in path if node.startswith("job:")
                    )
                    distance = job_count - 1
                    return [distance, path]

                queue.append(neighbor)

        return [-1, []]

    def get_skills_for_job(self, job_title):
        job_clean = self._normalize_job(job_title)
        return self.job_to_skills.get(job_clean, set())

    def get_jobs_for_skill(self, skill_name):
        skill_clean = self._normalize_skill(skill_name)
        return self.skill_to_jobs.get(skill_clean, set())

    def _reconstruct_path(self, parent, end_node):
        path = []
        current = end_node

        while current is not None:
            path.append(current)
            current = parent[current]

        path.reverse()
        return path

    def graph_summary(self):
        job_nodes = [
            node for node in self.adjList if node.startswith("job:")
        ]
        skill_nodes = [
            node for node in self.adjList if node.startswith("skill:")
        ]

        return {
            "total_nodes": len(self.adjList),
            "job_nodes": len(job_nodes),
            "skill_nodes": len(skill_nodes),
            "unique_jobs": len(self.job_to_skills),
            "unique_skills": len(self.skill_to_jobs),
        }

    def recommend_missing_skills(self, current_job, target_job):
        current_node = f"job:{self._normalize_job(current_job)}"
        target_node = f"job:{self._normalize_job(target_job)}"

        if current_node not in self.adjList or target_node not in self.adjList:
            return None

        current_skills = {
            node.replace("skill:", "")
            for node in self.adjList[current_node]
            if node.startswith("skill:")
        }

        target_skills = {
            node.replace("skill:", "")
            for node in self.adjList[target_node]
            if node.startswith("skill:")
        }

        missing = target_skills - current_skills
        shared = current_skills & target_skills

        return {
            "current": current_skills,
            "target": target_skills,
            "missing": missing,
            "shared": shared,
        }

    def recommend_skills_with_fallback(self, current_job, target_job):
        """
        Recommend missing skills for a career transition.

        If both current_job and target_job exist in the graph, compare their skills.
        If current_job does not exist but target_job exists, treat the user as a
        beginner and recommend all target-job skills.
        If target_job does not exist, return None.
        """

        current_clean = self._normalize_job(current_job)
        target_clean = self._normalize_job(target_job)

        current_node = f"job:{current_clean}"
        target_node = f"job:{target_clean}"

        # Case 1: target job does not exist
        if target_node not in self.adjList:
            return None

        target_skills = {
            node.replace("skill:", "")
            for node in self.adjList[target_node]
            if node.startswith("skill:")
        }

        # Case 2: current job does not exist
        # Treat as beginner / unknown background
        if current_node not in self.adjList:
            return {
                "mode": "beginner_fallback",
                "current_job_found": False,
                "target_job_found": True,
                "current": set(),
                "target": target_skills,
                "shared": set(),
                "missing": target_skills,
                "message": (
                    f"'{current_job}' was not found in the job graph. "
                    f"The system treats this as a beginner or unknown-background "
                    f"transition and recommends all skills required for '{target_job}'."
                ),
            }

        # Case 3: both jobs exist
        current_skills = {
            node.replace("skill:", "")
            for node in self.adjList[current_node]
            if node.startswith("skill:")
        }

        missing = target_skills - current_skills
        shared = current_skills & target_skills

        return {
            "mode": "job_to_job",
            "current_job_found": True,
            "target_job_found": True,
            "current": current_skills,
            "target": target_skills,
            "shared": shared,
            "missing": missing,
            "message": "Both jobs were found. Missing skills were calculated by comparing current and target job skills.",
        }