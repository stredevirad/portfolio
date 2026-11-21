// Skills, grouped. No bars, no percentages. Python leads every list.
// Project links are derived from `project.skills` in projects.ts (only where the repo shows the skill).
import type { SkillGroup, SkillId } from './types';
import { projects } from './projects';

export const skillGroups: SkillGroup[] = [
  {
    id: 'languages',
    label: 'Languages',
    skills: [
      { id: 'python', label: 'Python', primary: true },
      { id: 'java', label: 'Java' },
      { id: 'kotlin', label: 'Kotlin' },
      { id: 'sql', label: 'SQL' },
    ],
  },
  {
    id: 'ai',
    label: 'AI / ML',
    skills: [
      { id: 'agents-eval', label: 'Agents & evaluation' },
      { id: 'llm-apis', label: 'LLM APIs (Gemini, Ollama)' },
      { id: 'tensorflow', label: 'TensorFlow / Keras' },
      { id: 'gradcam', label: 'Grad-CAM' },
    ],
  },
  {
    id: 'backend',
    label: 'Backend & data',
    skills: [
      { id: 'fastapi', label: 'FastAPI' },
      { id: 'postgresql', label: 'PostgreSQL' },
      { id: 'supabase', label: 'Supabase' },
    ],
  },
  {
    id: 'mobile',
    label: 'Mobile',
    skills: [{ id: 'android', label: 'Android (Jetpack Compose, Room)' }],
  },
  {
    id: 'tools',
    label: 'Tools',
    skills: [
      { id: 'git', label: 'Git' },
      { id: 'docker', label: 'Docker' },
      { id: 'gh-actions', label: 'GitHub Actions' },
      { id: 'pytest', label: 'Pytest' },
      { id: 'linux', label: 'Linux' },
    ],
  },
  {
    id: 'cloud-gis',
    label: 'Cloud & GIS',
    skills: [
      { id: 'gcp', label: 'Google Cloud' },
      { id: 'earth-engine', label: 'Earth Engine' },
      { id: 'qgis', label: 'QGIS' },
    ],
  },
];

export const allSkills = skillGroups.flatMap((g) => g.skills.map((s) => ({ ...s, group: g.id })));

export function projectsForSkill(id: SkillId) {
  return projects.filter((p) => p.skills.includes(id));
}

export const skillLabel = (id: SkillId) => allSkills.find((s) => s.id === id)?.label ?? id;
