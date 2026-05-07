import os
import pandas as pd
import kagglehub


def load_data(local_path=None):
    """
    Load the future jobs dataset.

    If local_path is provided, load the CSV from local path.
    Otherwise, download and load the dataset using KaggleHub.
    """
    if local_path:
        return pd.read_csv(local_path)

    path = kagglehub.dataset_download(
        "ahsanneural/future-jobs-and-skills-demand-2025"
    )

    file_path = os.path.join(path, "future_jobs_dataset.csv")
    print("Using Kaggle cached path:", file_path)

    return pd.read_csv(file_path)