import type { SkillDifficulty, SkillDocument } from '../types/skill.js';

// Sample skills for local development and demos.
//
// The Blockchain, Green Tech and Quantum Computing skills (and Python,
// TensorFlow, PyTorch, Linear Algebra) come from the original prototype's
// dataset (src/data/future_jobs_dataset.csv at the repo root). Everything else
// -- the other skills, and every difficulty, hour estimate and prerequisite --
// was written for this project as illustrative sample data. It is not taken
// from job postings or from any course catalog.

function skill<const Id extends string>(
  _id: Id,
  name: string,
  category: string,
  difficulty: SkillDifficulty,
  estimatedHours: number,
  prerequisiteIds: string[] = []
): SkillDocument & { _id: Id } {
  return { _id, name, category, difficulty, estimatedHours, prerequisiteIds };
}

export const skillsSeed = [
  // Programming
  skill('python', 'Python', 'Programming', 'beginner', 40),
  skill('sql', 'SQL', 'Programming', 'beginner', 25),
  skill('git', 'Git', 'Programming', 'beginner', 10),
  skill('rest-apis', 'REST APIs', 'Programming', 'intermediate', 20, ['python']),

  // Math & Statistics
  skill('statistics', 'Statistics', 'Math & Statistics', 'beginner', 30),
  skill('probability', 'Probability', 'Math & Statistics', 'intermediate', 25, ['statistics']),
  skill('linear-algebra', 'Linear Algebra', 'Math & Statistics', 'intermediate', 30),
  skill('calculus', 'Calculus', 'Math & Statistics', 'intermediate', 30),
  skill('ab-testing', 'A/B Testing', 'Math & Statistics', 'intermediate', 15, ['statistics']),

  // Data
  skill('excel', 'Excel', 'Data', 'beginner', 15),
  skill('numpy', 'NumPy', 'Data', 'beginner', 15, ['python']),
  skill('pandas', 'pandas', 'Data', 'beginner', 20, ['python']),
  skill('data-cleaning', 'Data Cleaning', 'Data', 'beginner', 15, ['pandas']),
  skill('data-visualization', 'Data Visualization', 'Data', 'beginner', 20),
  skill('tableau', 'Tableau', 'Data', 'beginner', 20, ['data-visualization']),
  skill('data-warehousing', 'Data Warehousing', 'Data', 'intermediate', 25, ['sql']),
  skill('etl-pipelines', 'ETL Pipelines', 'Data', 'intermediate', 30, ['python', 'sql']),
  skill('airflow', 'Apache Airflow', 'Data', 'intermediate', 20, ['etl-pipelines']),
  skill('spark', 'Apache Spark', 'Data', 'advanced', 40, ['python', 'sql']),

  // Machine Learning
  skill('machine-learning-fundamentals', 'Machine Learning Fundamentals', 'Machine Learning', 'intermediate', 50, ['python', 'statistics']),
  skill('scikit-learn', 'scikit-learn', 'Machine Learning', 'intermediate', 25, ['machine-learning-fundamentals', 'pandas']),
  skill('feature-engineering', 'Feature Engineering', 'Machine Learning', 'intermediate', 20, ['machine-learning-fundamentals', 'pandas']),
  skill('model-evaluation', 'Model Evaluation', 'Machine Learning', 'intermediate', 15, ['machine-learning-fundamentals']),

  // Deep Learning
  skill('deep-learning-fundamentals', 'Deep Learning Fundamentals', 'Deep Learning', 'intermediate', 50, ['machine-learning-fundamentals', 'linear-algebra']),
  skill('pytorch', 'PyTorch', 'Deep Learning', 'intermediate', 40, ['python', 'deep-learning-fundamentals']),
  skill('tensorflow', 'TensorFlow', 'Deep Learning', 'intermediate', 40, ['python', 'deep-learning-fundamentals']),
  skill('computer-vision', 'Computer Vision', 'Deep Learning', 'advanced', 40, ['deep-learning-fundamentals']),
  skill('nlp', 'Natural Language Processing', 'Deep Learning', 'advanced', 40, ['deep-learning-fundamentals']),
  skill('transformers', 'Transformer Models', 'Deep Learning', 'advanced', 35, ['deep-learning-fundamentals']),
  skill('reinforcement-learning', 'Reinforcement Learning', 'Deep Learning', 'advanced', 45, ['deep-learning-fundamentals', 'probability']),

  // Generative AI
  skill('llm-fundamentals', 'LLM Fundamentals', 'Generative AI', 'beginner', 15),
  skill('prompt-engineering', 'Prompt Engineering', 'Generative AI', 'beginner', 15, ['llm-fundamentals']),
  skill('llm-evaluation', 'LLM Evaluation', 'Generative AI', 'intermediate', 20, ['llm-fundamentals']),
  skill('llm-apis', 'LLM APIs', 'Generative AI', 'intermediate', 15, ['python', 'llm-fundamentals']),
  skill('vector-databases', 'Vector Databases', 'Generative AI', 'intermediate', 15, ['llm-fundamentals']),
  skill('rag', 'Retrieval-Augmented Generation', 'Generative AI', 'intermediate', 25, ['llm-apis', 'vector-databases']),
  skill('ai-agents', 'AI Agents', 'Generative AI', 'advanced', 30, ['llm-apis', 'prompt-engineering']),
  skill('fine-tuning', 'Model Fine-Tuning', 'Generative AI', 'advanced', 30, ['transformers', 'pytorch']),

  // MLOps & Engineering
  skill('docker', 'Docker', 'MLOps & Engineering', 'intermediate', 20),
  skill('kubernetes', 'Kubernetes', 'MLOps & Engineering', 'advanced', 35, ['docker']),
  skill('cloud-platforms', 'Cloud Platforms', 'MLOps & Engineering', 'intermediate', 30),
  skill('ci-cd', 'CI/CD', 'MLOps & Engineering', 'intermediate', 15, ['git']),
  skill('model-deployment', 'Model Deployment', 'MLOps & Engineering', 'intermediate', 25, ['docker', 'rest-apis']),
  skill('model-monitoring', 'Model Monitoring', 'MLOps & Engineering', 'intermediate', 15, ['model-deployment']),
  skill('experiment-tracking', 'Experiment Tracking', 'MLOps & Engineering', 'intermediate', 10, ['machine-learning-fundamentals']),

  // Product & Responsible AI
  skill('ai-product-strategy', 'AI Product Strategy', 'Product & Responsible AI', 'intermediate', 20, ['llm-fundamentals']),
  skill('user-research', 'User Research', 'Product & Responsible AI', 'beginner', 20),
  skill('data-storytelling', 'Data Storytelling', 'Product & Responsible AI', 'beginner', 15, ['data-visualization']),
  skill('technical-writing', 'Technical Writing', 'Product & Responsible AI', 'beginner', 15),
  skill('ai-ethics', 'Responsible AI', 'Product & Responsible AI', 'beginner', 15),
  skill('ai-governance', 'AI Governance & Compliance', 'Product & Responsible AI', 'intermediate', 20, ['ai-ethics']),

  // Blockchain
  skill('ethereum', 'Ethereum', 'Blockchain', 'beginner', 20),
  skill('solidity', 'Solidity', 'Blockchain', 'intermediate', 35, ['ethereum']),
  skill('rust', 'Rust', 'Blockchain', 'intermediate', 50),

  // Green Tech
  skill('climate-data-analysis', 'Climate Data Analysis', 'Green Tech', 'intermediate', 30),
  skill('energy-modeling', 'Energy Modeling', 'Green Tech', 'intermediate', 35),

  // Quantum Computing
  skill('quantum-algorithms', 'Quantum Algorithms', 'Quantum Computing', 'advanced', 45, ['linear-algebra']),
  skill('qiskit', 'Qiskit', 'Quantum Computing', 'intermediate', 25, ['python', 'quantum-algorithms'])
];

export type SeedSkillId = (typeof skillsSeed)[number]['_id'];
