import os
from pathlib import Path

import pandas as pd
import kagglehub


import os
from pathlib import Path

import pandas as pd
import kagglehub


def load_data(local_path=None):
    """
    Load the future jobs dataset.

    Priority:
    1. Use provided local_path if available.
    2. Use local CSV inside src/data if available.
    3. Fall back to KaggleHub download.
    """
    if local_path:
        return pd.read_csv(local_path)

    project_root = Path(__file__).resolve().parents[2]
    local_csv = project_root / "src" / "data" / "future_jobs_dataset.csv"

    if local_csv.exists():
        print("Using local dataset:", local_csv)
        return pd.read_csv(local_csv)

    path = kagglehub.dataset_download(
        "ahsanneural/future-jobs-and-skills-demand-2025"
    )

    file_path = os.path.join(path, "future_jobs_dataset.csv")
    print("Using Kaggle cached path:", file_path)

    return pd.read_csv(file_path)

if __name__ == "__main__":
    path = kagglehub.dataset_download(
        "ahsanneural/future-jobs-and-skills-demand-2025"
    )
    print(path)