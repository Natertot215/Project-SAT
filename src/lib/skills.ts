import { isRWSkill } from "../data/taxonomy";

export const assignSkills = (skills: string[], count: number): (string | null)[] => {
  const rw = skills.filter(s => isRWSkill(s));
  const math = skills.filter(s => !isRWSkill(s));
  if (rw.length + math.length === 0) return Array(count).fill(null);
  const rwCount = rw.length > 0 && math.length > 0
    ? Math.round((rw.length / (rw.length + math.length)) * count)
    : (rw.length > 0 ? count : 0);
  const assigned: string[] = [];
  for (let i = 0; i < rwCount; i++) assigned.push(rw[i % rw.length]);
  for (let i = 0; i < count - rwCount; i++) assigned.push(math[i % math.length]);
  return assigned;
};
