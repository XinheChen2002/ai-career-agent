# Project Context: GitHub Path Recommendation Agent

## 1. Project Goal

This project is a GitHub Path Recommendation Agent.

The goal is to help users explore GitHub repositories more efficiently by analyzing their learning goals, current skill level, and preferred direction, then recommending suitable GitHub repositories, learning paths, or project structures.

The project is designed as a small AI-agent-based system rather than a simple chatbot. It should show clear separation between user input, agent reasoning, recommendation logic, and final output.

## 2. Target Users

The target users are people who want to learn AI, data science, software engineering, or project-based coding through GitHub repositories.

Typical users may include:

- Beginners who do not know which GitHub projects are suitable for them
- Students who want to build portfolio projects
- Career transitioners who want to enter AI or data-related roles
- Users who feel overwhelmed by many GitHub repositories and need structured recommendations

## 3. Core Use Case

The user provides a structured input, such as:

- Current skill level
- Learning goal
- Preferred technical direction
- Time available
- Project difficulty preference
- Existing background

The system then returns:

- Recommended GitHub repositories or project types
- Explanation of why each recommendation fits the user
- Suggested learning path
- Possible next actions
- Optional warnings about difficulty, prerequisites, or missing skills

## 4. Current Architecture

The current system is moving toward a multi-agent architecture.

The basic workflow is:

```text
User Input JSON
        ↓
Input Parser / Profile Agent
        ↓
Goal Analysis Agent
        ↓
Repository Matching Agent
        ↓
Path Planning Agent
        ↓
Final Response Generator

The system should not be designed as one large function. Each part should have a clear responsibility.

5. Current File Structure

The current project may include folders such as:

    github-path-agent/
    │
    ├── data/
    │   ├── user_input.json
    │   └── sample_repos.json
    │
    ├── src/
    │   ├── main.py
    │   ├── agents/
    │   │   ├── profile_agent.py
    │   │   ├── goal_agent.py
    │   │   ├── repo_agent.py
    │   │   └── planning_agent.py
    │   │
    │   ├── utils/
    │   │   ├── data_loader.py
    │   │   └── formatter.py
    │   │
    │   └── config.py
    │
    ├── tests/
    │   └── test_main.py
    │
    ├── README.md
    ├── pyproject.toml
    ├── .env
    ├── .gitignore
    └── PROJECT_CONTEXT.md

The exact structure may change, but the project should keep a modular layout.

6. Agent Design

The project may include four main agents:

1. Profile Agent

Responsible for reading and understanding the user's background.

Input:

Skill level
Technical background
Career goal
Preferred learning style
Available time

Output:

A structured user profile
2. Goal Analysis Agent

Responsible for interpreting the user's learning or career goal.

Input:

User profile
Raw user goal

Output:

Refined goal
Required technical areas
Difficulty level
Missing prerequisites
3. Repository Matching Agent

Responsible for matching the user with suitable GitHub repositories or project types.

Input:

Refined goal
Skill level
Repository metadata

Output:

Ranked repository recommendations
Reason for each match
4. Path Planning Agent

Responsible for turning recommendations into an actionable learning path.

Input:

Recommended repositories
User profile
Goal analysis

Output:

Step-by-step learning plan
Suggested order
Estimated difficulty
Next actions
7. Current Progress

The project environment has already been set up.

The current system can run a basic version of the recommendation workflow.

The next development goals are:

Move user input into a JSON file
Improve the four-agent structure
Make each agent responsible for a specific task
Improve output formatting
Add simple tests
Write a clear README
Make the project easier to explain in a resume or portfolio
8. Rules for AI Collaboration

When helping me modify this project, please follow these rules:

Do not rewrite the whole project unless I explicitly ask.
Modify code step by step.
Explain which file should be changed.
Explain why the change is needed.
Keep the code beginner-friendly and readable.
Prefer simple Python structures before introducing complex frameworks.
Do not add unnecessary dependencies.
Keep the project suitable for a student portfolio.
When adding an agent, clearly explain its input, output, and responsibility.
When changing architecture, first explain the reason before writing code.
9. Coding Style

Please follow these coding preferences:

Use clear function names.
Add short comments for important logic.
Keep functions small.
Avoid overly abstract code.
Use type hints when helpful.
Keep the project easy to run from main.py.
Make the data flow easy to understand.
10. Current Development Priority

The current priority is not to build a perfect production-level system.

The priority is to build a clear, explainable, portfolio-ready AI agent project that shows:

User input design
Multi-agent workflow
Recommendation logic
Structured output
Clean project organization
Ability to iterate with AI tools