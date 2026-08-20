const BLIPS = [
  { top: '38%', left: '63%', delay: '0s' },
  { top: '60%', left: '37%', delay: '1s' },
  { top: '68%', left: '58%', delay: '2s' },
];

export default function RadarBackdrop({ size = 640, top = '1.5rem', className = '' }) {
  return (
    <div
      className={`pointer-events-none absolute left-1/2 -translate-x-1/2 ${className}`}
      style={{ height: size, width: size, top }}
      aria-hidden
    >
      <div
        className="radar-sweep absolute inset-0 rounded-full"
        style={{ background: 'conic-gradient(from 0deg, rgba(34,211,238,0.7), transparent 45%)' }}
      />
      <div
        className="radar-sweep absolute inset-0 rounded-full"
        style={{ background: 'conic-gradient(from 0deg, rgba(165,243,252,0.95) 0deg, rgba(165,243,252,0.4) 3deg, transparent 6deg)' }}
      />
      <div className="absolute inset-0 rounded-full border border-cyan-400/30" />
      <div className="absolute inset-[15%] rounded-full border border-cyan-400/25" />
      <div className="absolute inset-[30%] rounded-full border border-cyan-400/25" />
      <div className="absolute inset-[45%] rounded-full border border-cyan-400/20" />
      {BLIPS.map((blip, i) => (
        <div
          key={i}
          className="radar-blip absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300"
          style={{ top: blip.top, left: blip.left, animationDelay: blip.delay, boxShadow: '0 0 10px 3px rgba(103,232,249,0.8)' }}
        />
      ))}
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: 'radial-gradient(circle, transparent 55%, #020617 100%)' }}
      />
    </div>
  );
}
