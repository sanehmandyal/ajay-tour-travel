/** Decorative map-inspired route graphic (not to scale, not a real map). */
export default function RouteMap({ className = '', nodes = ['Amb Andaura', 'Una', 'Ludhiana', 'Chandigarh'] }) {
  const pts = [[70, 90], [200, 160], [330, 250], [500, 130]];
  const d = `M${pts[0]} C 120 70, 150 150, ${pts[1]} S 280 280, ${pts[2]} S 440 60, ${pts[3]}`;
  return (
    <svg viewBox="0 0 600 340" className={className} role="img" aria-label="Illustrated route connecting our main service areas" focusable="false">
      <defs>
        <linearGradient id="rm-line" x1="0" x2="1"><stop offset="0" stopColor="#37BDB7" /><stop offset="1" stopColor="#F99C62" /></linearGradient>
        <radialGradient id="rm-glow"><stop offset="0" stopColor="#F99C62" stopOpacity=".55" /><stop offset="1" stopColor="#F99C62" stopOpacity="0" /></radialGradient>
      </defs>
      <g opacity=".16" stroke="#fff" strokeWidth="1">
        {[60, 120, 180, 240, 300].map((y) => <line key={y} x1="0" x2="600" y1={y} y2={y} />)}
        {[100, 200, 300, 400, 500].map((x) => <line key={x} y1="0" y2="340" x1={x} x2={x} />)}
      </g>
      <path d={d} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="10" strokeLinecap="round" />
      <path d={d} fill="none" stroke="url(#rm-line)" strokeWidth="3.5" strokeLinecap="round" className="route-line" />
      {pts.map(([x, y], i) => (
        <g key={nodes[i]}>
          <circle cx={x} cy={y} r="26" fill="url(#rm-glow)" />
          <circle cx={x} cy={y} r="8" fill={i === pts.length - 1 ? '#F28A4B' : '#fff'} stroke="#0B1B33" strokeWidth="3" />
          <text x={x} y={y + (i % 2 ? 30 : -18)} textAnchor="middle" fill="#fff" fontSize="15" fontWeight="600" style={{ paintOrder: 'stroke' }} stroke="#0B1B33" strokeWidth="4">{nodes[i]}</text>
        </g>
      ))}
    </svg>
  );
}
