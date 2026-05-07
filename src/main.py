from core.data_loader import load_data
from core.career_graph import CareerTransitionGraph


def main():
    df = load_data()

    graph = CareerTransitionGraph(df)
    graph.build_graph()

    print("AI Career Agent is running.")
    print(graph.graph_summary())


if __name__ == "__main__":
    main()