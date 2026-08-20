import { getSafetyGrade, getSeverityColor } from '../utils/stateStats';

export default function SafetyBadge({ score, className = '' }) {
  if (score == null) return null;
  const grade = getSafetyGrade(score);
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold text-slate-950 ${className}`}
      style={{ backgroundColor: getSeverityColor(score) }}
      title={`Safety score: ${score}/100 (relative to other states shown)`}
    >
      {grade}
    </span>
  );
}
