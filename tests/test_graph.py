from src.core.data_loader import load_data
from src.core.career_graph import CareerTransitionGraph
import sys
print(sys.executable)


def build_test_graph():
    df_1 = load_data()
    graph = CareerTransitionGraph(df_1)
    graph.build_graph()
    return graph


def test_graph_building(graph):
    summary = graph.graph_summary()

    assert summary["total_nodes"] > 0
    assert summary["job_nodes"] > 0
    assert summary["skill_nodes"] > 0

    print("test_graph_building passed")


def test_valid_transition_path(graph):
    result = graph.find_transition_path(
        "data scientist",
        "ai engineer"
    )

    assert result[0] != -1
    assert len(result[1]) > 0
    assert result[1][0] == "job:data scientist"
    assert result[1][-1] == "job:ai engineer"

    print("test_valid_transition_path passed")


def test_invalid_transition_path(graph):
    result = graph.find_transition_path(
        "quantum researcher",
        "sustainability analyst"
    )

    assert result[0] == -1
    assert result[1] == []

    print("test_invalid_transition_path passed")


def test_get_jobs_for_skill(graph):
    jobs = graph.get_jobs_for_skill("python")

    assert isinstance(jobs, set)
    assert len(jobs) > 0

    print("test_get_jobs_for_skill passed")


def test_missing_skills(graph):
    rec = graph.recommend_missing_skills(
        "data scientist",
        "ai engineer"
    )

    assert rec is not None
    assert "current" in rec
    assert "target" in rec
    assert "shared" in rec
    assert "missing" in rec

    print("test_missing_skills passed")


if __name__ == "__main__":
    graph = build_test_graph()

    test_graph_building(graph)
    test_valid_transition_path(graph)
    test_invalid_transition_path(graph)
    test_get_jobs_for_skill(graph)
    test_missing_skills(graph)

    print("\nAll tests passed!")
