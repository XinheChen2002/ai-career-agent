import pandas as pd
import re
from pathlib import Path


STANDARD_COLUMNS = [
    "job_id",
    "job_title",
    "industry",
    "location",
    "salary_usd",
    "skills_required",
    "remote_option",
    "company_size",
]


SKILL_KEYWORDS = [
    # General / Data Engineering
    "Python", "SQL", "R", "Java", "C++", "Go", "Scala",
    "AWS", "Azure", "GCP",
    "Docker", "Kubernetes", "Spark", "Hadoop",
    "PostgreSQL", "MongoDB", "Redis",
    "REST API", "GraphQL", "Git", "Linux",
    "Pandas", "NumPy", "Scikit-learn", "Jupyter", "Statistics",

    # AI / ML
    "Machine Learning", "Deep Learning", "Data Analysis", "Data Science",
    "TensorFlow", "PyTorch", "Keras", "Hugging Face",
    "NLP", "Computer Vision", "Reinforcement Learning",
    "MLOps", "Feature Engineering", "A/B Testing",

    # Quantum Computing
    "Qiskit", "Cirq", "PennyLane",
    "Quantum Algorithms", "Quantum Error Correction", "Quantum Machine Learning",
    "Linear Algebra",

    # Green Tech
    "Climate Data Analysis", "Energy Modeling",
    "Renewable Energy", "Sustainability", "GIS", "MATLAB", "IoT",

    # Blockchain
    "Solidity", "Ethereum", "Rust",
    "Web3", "Smart Contracts", "DeFi", "Hyperledger", "Hardhat",
]


def extract_skills(description: str) -> str:
    """
    Extract known skill keywords from a job description.
    """
    if not isinstance(description, str):
        return ""

    found = []
    lower_desc = description.lower()

    for skill in SKILL_KEYWORDS:
        if skill.lower() in lower_desc:
            found.append(skill)

    return ", ".join(sorted(set(found)))


def normalize_salary_to_usd(salary_text: str) -> int | None:
    """
    Convert salary text like '$120,000 - $160,000' to an average integer salary.
    """
    if not isinstance(salary_text, str):
        return None

    numbers = re.findall(r"\d[\d,]*", salary_text)
    numbers = [int(num.replace(",", "")) for num in numbers]

    if not numbers:
        return None

    return int(sum(numbers) / len(numbers))


def normalize_remote_option(value: str) -> str:
    """
    Convert remote / hybrid / onsite text to Yes or No.
    """
    if not isinstance(value, str):
        return "No"

    value = value.lower()

    if "remote" in value or "hybrid" in value:
        return "Yes"

    return "No"


def normalize_company_size(value: str) -> str:
    """
    Convert employee count text to Small / Medium / Large.
    """
    if not isinstance(value, str):
        return "Medium"

    numbers = re.findall(r"\d[\d,]*", value)

    if not numbers:
        return "Medium"

    employee_count = max(int(num.replace(",", "")) for num in numbers)

    if employee_count < 200:
        return "Small"
    if employee_count < 1000:
        return "Medium"
    return "Large"


def infer_industry(job_title: str, description: str = "") -> str:
    """
    Infer industry from job title and description.
    This can be improved later with an LLM or classifier.
    """
    text = f"{job_title} {description}".lower()

    if any(word in text for word in ["machine learning", "ai", "data scientist", "tensorflow", "pytorch"]):
        return "AI"

    if any(word in text for word in ["quantum", "qiskit"]):
        return "Quantum Computing"

    if any(word in text for word in ["climate", "renewable", "energy", "sustainability"]):
        return "Green Tech"

    if any(word in text for word in ["blockchain", "solidity", "ethereum", "smart contract"]):
        return "Blockchain"

    return "Other"


def normalize_raw_jobs(raw_jobs: list[dict], start_job_id: int = 1) -> pd.DataFrame:
    """
    Convert raw scraped job records into the standard future_jobs schema.
    """
    normalized_rows = []

    for index, job in enumerate(raw_jobs, start=start_job_id):
        job_title = job.get("title") or job.get("job_title") or ""
        description = job.get("description") or ""

        row = {
            "job_id": index,
            "job_title": job_title,
            "industry": infer_industry(job_title, description),
            "location": job.get("city") or job.get("location") or "Unknown",
            "salary_usd": normalize_salary_to_usd(job.get("salary", "")),
            "skills_required": extract_skills(description),
            "remote_option": normalize_remote_option(job.get("workplace_type", "")),
            "company_size": normalize_company_size(job.get("company_employees", "")),
        }

        normalized_rows.append(row)

    return pd.DataFrame(normalized_rows, columns=STANDARD_COLUMNS)

def merge_with_existing_jobs(
    existing_csv_path: str,
    new_jobs_df: pd.DataFrame,
    output_csv_path: str | None = None,
) -> pd.DataFrame:
    """
    Merge newly normalized jobs with the existing future_jobs.csv.
    """
    existing_path = Path(existing_csv_path)

    if output_csv_path is None:
        output_csv_path = existing_csv_path

    if existing_path.exists():
        existing_df = pd.read_csv(existing_path)
    else:
        existing_df = pd.DataFrame(columns=STANDARD_COLUMNS)

    combined_df = pd.concat([existing_df, new_jobs_df], ignore_index=True)

    # Drop exact or near-exact duplicates.
    combined_df = combined_df.drop_duplicates(
        subset=["job_title", "industry", "location", "skills_required"],
        keep="last",
    )

    # Reassign clean job_id.
    combined_df = combined_df.reset_index(drop=True)
    combined_df["job_id"] = combined_df.index + 1

    combined_df = combined_df[STANDARD_COLUMNS]
    combined_df.to_csv(output_csv_path, index=False)

    return combined_df