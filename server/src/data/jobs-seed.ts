import type { JobDocument, JobSkill } from '../types/job.js';
import { skillsSeed, type SeedSkillId } from './skills-seed.js';

// Sample jobs for local development and demos.
//
// The Blockchain, Green Tech and Quantum Computing jobs, and the titles
// "AI Engineer", "Data Scientist" and "ML Researcher", come from the original
// prototype's dataset (src/data/future_jobs_dataset.csv at the repo root).
// The other jobs, every description, and the skill lists of the AI and Data
// jobs were written for this project as illustrative sample data. They are
// not taken from real job postings.

// Jobs embed a copy of each skill's id and name. Taking both from skillsSeed
// keeps every embedded skill pointing at a real document in `skills`.
function skills(...ids: SeedSkillId[]): JobSkill[] {
  return ids.map((id) => {
    const skill = skillsSeed.find((s) => s._id === id)!;
    return { id: skill._id, name: skill.name };
  });
}

export const jobsSeed: JobDocument[] = [
  // AI
  {
    _id: 'ai-engineer',
    title: 'AI Engineer',
    industry: 'AI',
    description: 'Builds and ships applications powered by machine learning models.',
    skills: skills('python', 'rest-apis', 'llm-apis', 'prompt-engineering', 'rag', 'pytorch', 'tensorflow', 'model-deployment')
  },
  {
    _id: 'data-scientist',
    title: 'Data Scientist',
    industry: 'AI',
    description: 'Analyzes data and trains models to answer business questions.',
    skills: skills('python', 'sql', 'statistics', 'pandas', 'machine-learning-fundamentals', 'scikit-learn', 'pytorch', 'tensorflow')
  },
  {
    _id: 'ml-researcher',
    title: 'ML Researcher',
    industry: 'AI',
    description: 'Designs and evaluates new machine learning methods.',
    skills: skills('python', 'linear-algebra', 'calculus', 'probability', 'deep-learning-fundamentals', 'pytorch', 'tensorflow', 'transformers')
  },
  {
    _id: 'ml-engineer',
    title: 'Machine Learning Engineer',
    industry: 'AI',
    description: 'Turns trained models into reliable software that runs in production.',
    skills: skills('python', 'git', 'machine-learning-fundamentals', 'scikit-learn', 'feature-engineering', 'pytorch', 'docker', 'model-deployment')
  },
  {
    _id: 'mlops-engineer',
    title: 'MLOps Engineer',
    industry: 'AI',
    description: 'Runs the infrastructure that trains, deploys and monitors models.',
    skills: skills('python', 'docker', 'kubernetes', 'ci-cd', 'cloud-platforms', 'model-deployment', 'model-monitoring', 'experiment-tracking')
  },
  {
    _id: 'applied-scientist',
    title: 'Applied Scientist',
    industry: 'AI',
    description: 'Applies machine learning research to product problems and measures the result.',
    skills: skills('python', 'statistics', 'ab-testing', 'machine-learning-fundamentals', 'model-evaluation', 'deep-learning-fundamentals', 'pytorch')
  },
  {
    _id: 'nlp-engineer',
    title: 'NLP Engineer',
    industry: 'AI',
    description: 'Builds systems that understand and generate human language.',
    skills: skills('python', 'deep-learning-fundamentals', 'nlp', 'transformers', 'pytorch', 'fine-tuning')
  },
  {
    _id: 'computer-vision-engineer',
    title: 'Computer Vision Engineer',
    industry: 'AI',
    description: 'Builds systems that interpret images and video.',
    skills: skills('python', 'numpy', 'deep-learning-fundamentals', 'computer-vision', 'pytorch', 'model-deployment')
  },
  {
    _id: 'reinforcement-learning-engineer',
    title: 'Reinforcement Learning Engineer',
    industry: 'AI',
    description: 'Trains agents that learn to make decisions by trial and error.',
    skills: skills('python', 'numpy', 'probability', 'deep-learning-fundamentals', 'reinforcement-learning', 'pytorch')
  },
  {
    _id: 'llm-application-developer',
    title: 'LLM Application Developer',
    industry: 'AI',
    description: 'Builds products on top of large language models.',
    skills: skills('python', 'rest-apis', 'llm-apis', 'prompt-engineering', 'vector-databases', 'rag', 'ai-agents')
  },
  {
    _id: 'prompt-engineer',
    title: 'Prompt Engineer',
    industry: 'AI',
    description: 'Designs, tests and refines the instructions that steer language models.',
    skills: skills('llm-fundamentals', 'prompt-engineering', 'llm-evaluation', 'llm-apis', 'technical-writing')
  },
  {
    _id: 'ai-quality-analyst',
    title: 'AI Quality Analyst',
    industry: 'AI',
    description: 'Reviews and labels model outputs to measure and improve their quality.',
    skills: skills('llm-fundamentals', 'prompt-engineering', 'llm-evaluation', 'data-cleaning', 'technical-writing')
  },
  {
    _id: 'ai-product-manager',
    title: 'AI Product Manager',
    industry: 'AI',
    description: 'Decides what AI features to build and whether they work for users.',
    skills: skills('llm-fundamentals', 'ai-product-strategy', 'user-research', 'ab-testing', 'data-storytelling', 'ai-ethics')
  },
  {
    _id: 'ai-solutions-architect',
    title: 'AI Solutions Architect',
    industry: 'AI',
    description: 'Designs how AI systems fit into an organization’s existing technology.',
    skills: skills('rest-apis', 'cloud-platforms', 'kubernetes', 'llm-apis', 'rag', 'model-deployment', 'ai-product-strategy')
  },
  {
    _id: 'responsible-ai-specialist',
    title: 'Responsible AI Specialist',
    industry: 'AI',
    description: 'Assesses AI systems for fairness, safety and regulatory compliance.',
    skills: skills('llm-fundamentals', 'statistics', 'model-evaluation', 'ai-ethics', 'ai-governance', 'technical-writing')
  },

  // Data
  {
    _id: 'data-analyst',
    title: 'Data Analyst',
    industry: 'Data',
    description: 'Finds and explains patterns in data to support decisions.',
    skills: skills('sql', 'excel', 'statistics', 'pandas', 'data-visualization', 'tableau', 'data-storytelling')
  },
  {
    _id: 'business-intelligence-analyst',
    title: 'Business Intelligence Analyst',
    industry: 'Data',
    description: 'Builds the dashboards and reports a business uses to track itself.',
    skills: skills('sql', 'excel', 'data-warehousing', 'data-visualization', 'tableau', 'data-storytelling')
  },
  {
    _id: 'data-engineer',
    title: 'Data Engineer',
    industry: 'Data',
    description: 'Builds the pipelines that collect, store and deliver data.',
    skills: skills('python', 'sql', 'data-warehousing', 'etl-pipelines', 'airflow', 'spark', 'cloud-platforms')
  },
  {
    _id: 'analytics-engineer',
    title: 'Analytics Engineer',
    industry: 'Data',
    description: 'Prepares clean, well-modeled data for analysts to work with.',
    skills: skills('sql', 'python', 'git', 'data-cleaning', 'data-warehousing', 'etl-pipelines')
  },

  // Blockchain
  {
    _id: 'blockchain-developer',
    title: 'Blockchain Developer',
    industry: 'Blockchain',
    description: 'Develops decentralized applications and the services around them.',
    skills: skills('ethereum', 'rust', 'solidity')
  },
  {
    _id: 'smart-contract-engineer',
    title: 'Smart Contract Engineer',
    industry: 'Blockchain',
    description: 'Writes, tests and audits on-chain contracts.',
    skills: skills('ethereum', 'rust', 'solidity')
  },

  // Green Tech
  {
    _id: 'renewable-energy-engineer',
    title: 'Renewable Energy Engineer',
    industry: 'Green Tech',
    description: 'Models and designs renewable energy systems.',
    skills: skills('climate-data-analysis', 'energy-modeling')
  },
  {
    _id: 'sustainability-analyst',
    title: 'Sustainability Analyst',
    industry: 'Green Tech',
    description: 'Measures environmental impact and recommends ways to reduce it.',
    skills: skills('climate-data-analysis', 'energy-modeling')
  },

  // Quantum Computing
  {
    _id: 'quantum-researcher',
    title: 'Quantum Researcher',
    industry: 'Quantum Computing',
    description: 'Studies quantum algorithms and how to run them on real hardware.',
    skills: skills('linear-algebra', 'qiskit', 'quantum-algorithms')
  },
  {
    _id: 'quantum-software-developer',
    title: 'Quantum Software Developer',
    industry: 'Quantum Computing',
    description: 'Implements quantum programs and the tooling to run them.',
    skills: skills('linear-algebra', 'qiskit', 'quantum-algorithms')
  }
];
