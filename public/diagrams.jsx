/* =========================================================
   FRAMEWORK DIAGRAMS
   Each diagram receives { titles: string[], color: string }
   and positions titles[i] into canonical slots for that framework.
   ========================================================= */

const { useMemo: _useMemo } = React;

/* ---------- helpers ---------- */
function pickTitle(titles, idx, fallback) {
  const t = titles && titles[idx];
  return (t && String(t).trim()) || fallback;
}

// Wrap text into multiple tspans (rough character-based wrap).
function WrappedText({ text, x, y, maxChars = 18, lineHeight = 16, color = '#1a1a2e', size = 12, weight = 500, anchor = 'middle' }) {
  if (!text) return null;
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (test.length > maxChars && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  // cap to 3 lines, add ellipsis
  const capped = lines.length > 3
    ? [...lines.slice(0, 2), lines[2].slice(0, maxChars - 1) + '…']
    : lines;
  const startY = y - ((capped.length - 1) * lineHeight) / 2;
  return (
    <>
      {capped.map((ln, i) => (
        <text key={i} x={x} y={startY + i * lineHeight}
              textAnchor={anchor} dominantBaseline="middle"
              fontFamily="'DM Sans', sans-serif" fontSize={size}
              fontWeight={weight} fill={color}>
          {ln}
        </text>
      ))}
    </>
  );
}

function AxisLabel({ x, y, text, color, rotate, anchor = 'middle' }) {
  return (
    <text x={x} y={y} textAnchor={anchor}
          fontFamily="'JetBrains Mono', monospace" fontSize="10"
          letterSpacing="2" fill={color} fontWeight="500"
          transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}>
      {text}
    </text>
  );
}

/* ---------- BCG Matrix ---------- */
function BCGDiagram({ titles, color }) {
  // canonical slots: Stars, Cash Cows, Question Marks, Dogs
  // section order from prompt: Stars(0), Cash Cows(1), Question Marks(2), Dogs(3)
  const star = pickTitle(titles, 0, 'Stars');
  const cash = pickTitle(titles, 1, 'Cash Cows');
  const ques = pickTitle(titles, 2, 'Question Marks');
  const dog  = pickTitle(titles, 3, 'Dogs');
  return (
    <svg viewBox="0 0 800 500" width="100%" style={{ display: 'block' }}>
      <defs>
        <pattern id="bcg-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#eef0f4" strokeWidth="1"/>
        </pattern>
      </defs>
      <rect x="80" y="40" width="640" height="400" fill="url(#bcg-grid)" stroke="#d8dbe3"/>
      {/* axes */}
      <line x1="400" y1="40" x2="400" y2="440" stroke={color} strokeWidth="1.5" strokeDasharray="4 4"/>
      <line x1="80" y1="240" x2="720" y2="240" stroke={color} strokeWidth="1.5" strokeDasharray="4 4"/>
      {/* quadrant labels (small) */}
      <text x="240" y="68" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="10" letterSpacing="2" fill={color} fontWeight="500">QUESTION MARKS</text>
      <text x="560" y="68" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="10" letterSpacing="2" fill={color} fontWeight="500">STARS</text>
      <text x="240" y="430" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="10" letterSpacing="2" fill={color} fontWeight="500">DOGS</text>
      <text x="560" y="430" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontSize="10" letterSpacing="2" fill={color} fontWeight="500">CASH COWS</text>
      {/* bubbles */}
      <circle cx="240" cy="150" r="62" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5"/>
      <circle cx="560" cy="150" r="62" fill={color} fillOpacity="0.85"/>
      <circle cx="240" cy="340" r="62" fill={color} fillOpacity="0.06" stroke={color} strokeWidth="1.5" strokeDasharray="3 3"/>
      <circle cx="560" cy="340" r="62" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1.5"/>
      <WrappedText text={ques} x={240} y={150} color={color} size={13}/>
      <WrappedText text={star} x={560} y={150} color="#fff" size={13} weight={600}/>
      <WrappedText text={dog} x={240} y={340} color={color} size={13}/>
      <WrappedText text={cash} x={560} y={340} color={color} size={13} weight={600}/>
      {/* axis titles */}
      <AxisLabel x={400} y={475} text="← PAZAR PAYI →" color="#8a8aa0"/>
      <AxisLabel x={40} y={240} text="← BÜYÜME ORANI →" color="#8a8aa0" rotate={-90}/>
    </svg>
  );
}

/* ---------- McKinsey 7S ---------- */
function SevenSDiagram({ titles, color }) {
  // Center: Shared Values (titles[3])
  // Around: Strategy(0), Structure(1), Systems(2), Skills(4), Style(5), Staff(6)
  const center = pickTitle(titles, 3, 'Shared Values');
  const around = [
    { label: pickTitle(titles, 0, 'Strategy'), hard: true,  angle: -90 },
    { label: pickTitle(titles, 1, 'Structure'), hard: true, angle: -30 },
    { label: pickTitle(titles, 2, 'Systems'), hard: true,   angle:  30 },
    { label: pickTitle(titles, 4, 'Skills'), hard: false,   angle:  90 },
    { label: pickTitle(titles, 5, 'Style'), hard: false,    angle: 150 },
    { label: pickTitle(titles, 6, 'Staff'), hard: false,    angle: 210 },
  ];
  const cx = 400, cy = 260, R = 170;
  return (
    <svg viewBox="0 0 800 500" width="100%" style={{ display: 'block' }}>
      {/* links between center and outer */}
      {around.map((s, i) => {
        const rad = (s.angle * Math.PI) / 180;
        const x = cx + R * Math.cos(rad);
        const y = cy + R * Math.sin(rad);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={color} strokeWidth="1" strokeOpacity="0.3"/>;
      })}
      {/* links between adjacent outer */}
      {around.map((s, i) => {
        const next = around[(i + 1) % around.length];
        const r1 = (s.angle * Math.PI) / 180;
        const r2 = (next.angle * Math.PI) / 180;
        return <line key={'a'+i}
          x1={cx + R * Math.cos(r1)} y1={cy + R * Math.sin(r1)}
          x2={cx + R * Math.cos(r2)} y2={cy + R * Math.sin(r2)}
          stroke={color} strokeWidth="1" strokeOpacity="0.2" strokeDasharray="3 3"/>;
      })}
      {/* outer nodes */}
      {around.map((s, i) => {
        const rad = (s.angle * Math.PI) / 180;
        const x = cx + R * Math.cos(rad);
        const y = cy + R * Math.sin(rad);
        return (
          <g key={'n'+i}>
            <circle cx={x} cy={y} r="56"
              fill={s.hard ? color : '#fff'}
              stroke={color} strokeWidth="1.5"
              fillOpacity={s.hard ? 0.85 : 1}/>
            <WrappedText text={s.label} x={x} y={y - 8}
              color={s.hard ? '#fff' : color} size={12} weight={600}/>
            <text x={x} y={y + 26} textAnchor="middle"
              fontFamily="'JetBrains Mono', monospace" fontSize="8"
              letterSpacing="1.5" fill={s.hard ? 'rgba(255,255,255,0.7)' : '#8a8aa0'} fontWeight="500">
              {s.hard ? 'HARD S' : 'SOFT S'}
            </text>
          </g>
        );
      })}
      {/* center */}
      <circle cx={cx} cy={cy} r="70" fill={color}/>
      <WrappedText text={center} x={cx} y={cy - 8} color="#fff" size={13} weight={700} maxChars={14}/>
      <text x={cx} y={cy + 28} textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9"
        letterSpacing="2" fill="rgba(255,255,255,0.7)" fontWeight="500">SHARED VALUES</text>
    </svg>
  );
}

/* ---------- Strategy House ---------- */
function HouseDiagram({ titles, color }) {
  // Roof, Upper, Middle, Ground, Foundation
  const t = [
    pickTitle(titles, 0, 'Vizyon'),
    pickTitle(titles, 1, 'Misyon & Öncelikler'),
    pickTitle(titles, 2, 'Değerler'),
    pickTitle(titles, 3, 'Yetkinlikler & Kaynaklar'),
    pickTitle(titles, 4, 'Operasyonel Süreçler'),
  ];
  return (
    <svg viewBox="0 0 800 500" width="100%" style={{ display: 'block' }}>
      {/* roof */}
      <polygon points="200,110 400,40 600,110" fill={color} fillOpacity="0.92"/>
      <WrappedText text={t[0]} x={400} y={92} color="#fff" size={13} weight={700} maxChars={26}/>
      {/* Upper floor */}
      <rect x="200" y="120" width="400" height="70" fill={color} fillOpacity="0.7"/>
      <WrappedText text={t[1]} x={400} y={155} color="#fff" size={13} weight={600} maxChars={30}/>
      {/* Middle floor */}
      <rect x="200" y="195" width="400" height="70" fill={color} fillOpacity="0.45"/>
      <WrappedText text={t[2]} x={400} y={230} color="#1a1a2e" size={13} weight={600} maxChars={30}/>
      {/* Ground */}
      <rect x="200" y="270" width="400" height="70" fill={color} fillOpacity="0.22"/>
      <WrappedText text={t[3]} x={400} y={305} color="#1a1a2e" size={13} weight={600} maxChars={30}/>
      {/* Foundation */}
      <rect x="160" y="345" width="480" height="60" fill="#1a1a2e"/>
      <WrappedText text={t[4]} x={400} y={375} color="#fff" size={12} weight={600} maxChars={36}/>
      <text x={400} y={395} textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8"
        letterSpacing="2" fill="rgba(255,255,255,0.6)">TEMEL · OPERASYONLAR</text>
      {/* left labels */}
      {[
        { y: 75,  l: 'ÇATI · VİZYON' },
        { y: 155, l: 'ÜST KAT · MİSYON' },
        { y: 230, l: 'ORTA KAT · DEĞERLER' },
        { y: 305, l: 'ZEMİN · YETKİNLİK' },
      ].map((r, i) => (
        <text key={i} x={150} y={r.y} textAnchor="end"
          fontFamily="'JetBrains Mono', monospace" fontSize="9"
          letterSpacing="1.5" fill="#8a8aa0" fontWeight="500">{r.l}</text>
      ))}
      {/* base line */}
      <line x1="120" y1="420" x2="680" y2="420" stroke="#d8dbe3" strokeWidth="2"/>
    </svg>
  );
}

/* ---------- Hoshin Kanri X-Matrix ---------- */
function HoshinDiagram({ titles, color }) {
  // Top, Right, Bottom, Left, Center
  // Order from prompt: Kuzey Yıldızı(0)=center, Yıllık(1)=top, Departman(2)=right, Catchball(3)=bottom, PDCA(4)=left
  const center = pickTitle(titles, 0, 'Kuzey Yıldızı');
  const top    = pickTitle(titles, 1, 'Yıllık Hedefler');
  const right  = pickTitle(titles, 2, 'Kaskadlama');
  const bottom = pickTitle(titles, 3, 'Catchball');
  const left   = pickTitle(titles, 4, 'PDCA Döngüsü');
  return (
    <svg viewBox="0 0 800 500" width="100%" style={{ display: 'block' }}>
      {/* triangles */}
      <polygon points="400,250 150,40 650,40" fill={color} fillOpacity="0.85"/>
      <polygon points="400,250 760,90 760,410" fill={color} fillOpacity="0.55"/>
      <polygon points="400,250 650,460 150,460" fill={color} fillOpacity="0.3"/>
      <polygon points="400,250 40,410 40,90" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1"/>
      {/* center square */}
      <rect x="340" y="190" width="120" height="120" fill="#1a1a2e"/>
      <WrappedText text={center} x={400} y={245} color="#fff" size={12} weight={700} maxChars={14}/>
      <text x={400} y={285} textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="8"
        letterSpacing="2" fill="rgba(255,255,255,0.6)">KUZEY YILDIZI</text>
      {/* labels */}
      <WrappedText text={top} x={400} y={90} color="#fff" size={13} weight={600} maxChars={28}/>
      <WrappedText text={right} x={680} y={250} color="#fff" size={12} weight={600} maxChars={14}/>
      <WrappedText text={bottom} x={400} y={415} color="#1a1a2e" size={13} weight={600} maxChars={28}/>
      <WrappedText text={left} x={120} y={250} color="#1a1a2e" size={12} weight={600} maxChars={14}/>
      {/* corner tags */}
      {[
        { x: 400, y: 25,  l: 'YILLIK BREAKTHROUGH' },
        { x: 730, y: 250, l: 'KASKAD' },
        { x: 400, y: 480, l: 'CATCHBALL' },
        { x: 70,  y: 250, l: 'PDCA' },
      ].map((r, i) => (
        <text key={i} x={r.x} y={r.y} textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace" fontSize="9"
          letterSpacing="2" fill="#8a8aa0" fontWeight="500">{r.l}</text>
      ))}
    </svg>
  );
}

/* ---------- Porter 5 Forces ---------- */
function PorterDiagram({ titles, color }) {
  // 5 forces: center=Rivalry, top=New Entrants, bottom=Substitutes, left=Suppliers, right=Buyers
  // Map: titles[0]=Rivalry (often comes first as central), then 4 others
  // Use positional: prompt order = supplier, buyer, new entrant, substitute, rivalry — but varies.
  // Safe positional: titles[0]..titles[4] in any reasonable order:
  // Most common output: 1.Tedarikçi(left) 2.Alıcı(right) 3.YeniGiren(top) 4.İkame(bottom) 5.Rekabet(center)
  const left   = pickTitle(titles, 0, 'Tedarikçi Gücü');
  const right  = pickTitle(titles, 1, 'Alıcı Gücü');
  const top    = pickTitle(titles, 2, 'Yeni Girişimciler');
  const bottom = pickTitle(titles, 3, 'İkame Ürünler');
  const center = pickTitle(titles, 4, 'Rekabet Yoğunluğu');
  return (
    <svg viewBox="0 0 800 500" width="100%" style={{ display: 'block' }}>
      <defs>
        <marker id="porter-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color}/>
        </marker>
      </defs>
      {/* arrows */}
      <line x1="400" y1="120" x2="400" y2="200" stroke={color} strokeWidth="2" markerEnd="url(#porter-arrow)"/>
      <line x1="400" y1="380" x2="400" y2="300" stroke={color} strokeWidth="2" markerEnd="url(#porter-arrow)"/>
      <line x1="170" y1="250" x2="320" y2="250" stroke={color} strokeWidth="2" markerEnd="url(#porter-arrow)"/>
      <line x1="630" y1="250" x2="480" y2="250" stroke={color} strokeWidth="2" markerEnd="url(#porter-arrow)"/>
      {/* outer circles */}
      <circle cx="400" cy="75"  r="58" fill="#fff" stroke={color} strokeWidth="1.5"/>
      <circle cx="400" cy="425" r="58" fill="#fff" stroke={color} strokeWidth="1.5"/>
      <circle cx="100" cy="250" r="58" fill="#fff" stroke={color} strokeWidth="1.5"/>
      <circle cx="700" cy="250" r="58" fill="#fff" stroke={color} strokeWidth="1.5"/>
      {/* center */}
      <circle cx="400" cy="250" r="78" fill={color}/>
      <WrappedText text={top}    x={400} y={75}  color={color} size={11} weight={600} maxChars={14}/>
      <WrappedText text={bottom} x={400} y={425} color={color} size={11} weight={600} maxChars={14}/>
      <WrappedText text={left}   x={100} y={250} color={color} size={11} weight={600} maxChars={14}/>
      <WrappedText text={right}  x={700} y={250} color={color} size={11} weight={600} maxChars={14}/>
      <WrappedText text={center} x={400} y={244} color="#fff"  size={13} weight={700} maxChars={14}/>
      <text x={400} y={278} textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace" fontSize="9"
        letterSpacing="2" fill="rgba(255,255,255,0.7)">REKABET</text>
    </svg>
  );
}

/* ---------- SWOT (2x2 colored grid) ---------- */
function SWOTDiagram({ titles, color }) {
  // S(top-left), W(top-right), O(bottom-left), T(bottom-right)
  const s = pickTitle(titles, 0, 'Strengths');
  const w = pickTitle(titles, 1, 'Weaknesses');
  const o = pickTitle(titles, 2, 'Opportunities');
  const tr = pickTitle(titles, 3, 'Threats');
  const cells = [
    { x: 80,  y: 40,  w: 320, h: 200, fill: '#2A9D8F', label: 'S · STRENGTHS',     title: s, tag: 'İç · Pozitif' },
    { x: 400, y: 40,  w: 320, h: 200, fill: '#2C5F8D', label: 'W · WEAKNESSES',    title: w, tag: 'İç · Negatif' },
    { x: 80,  y: 240, w: 320, h: 200, fill: '#D4A017', label: 'O · OPPORTUNITIES', title: o, tag: 'Dış · Pozitif' },
    { x: 400, y: 240, w: 320, h: 200, fill: '#C0392B', label: 'T · THREATS',       title: tr, tag: 'Dış · Negatif' },
  ];
  return (
    <svg viewBox="0 0 800 480" width="100%" style={{ display: 'block' }}>
      {cells.map((c, i) => (
        <g key={i}>
          <rect x={c.x} y={c.y} width={c.w} height={c.h} fill={c.fill}/>
          <text x={c.x + 20} y={c.y + 30}
            fontFamily="'JetBrains Mono', monospace" fontSize="10"
            letterSpacing="2.5" fill="rgba(255,255,255,0.85)" fontWeight="600">{c.label}</text>
          <text x={c.x + c.w - 20} y={c.y + 30} textAnchor="end"
            fontFamily="'JetBrains Mono', monospace" fontSize="9"
            letterSpacing="1.5" fill="rgba(255,255,255,0.55)" fontWeight="500">{c.tag}</text>
          <WrappedText text={c.title} x={c.x + c.w / 2} y={c.y + c.h / 2 + 12}
            color="#fff" size={16} weight={600} maxChars={22} lineHeight={22}/>
        </g>
      ))}
      {/* axis dividers */}
      <line x1="400" y1="40" x2="400" y2="440" stroke="#fff" strokeWidth="3"/>
      <line x1="80" y1="240" x2="720" y2="240" stroke="#fff" strokeWidth="3"/>
    </svg>
  );
}

/* ---------- OKR Tree ---------- */
function OKRDiagram({ titles, color }) {
  // Treat titles as Objectives at level 1
  const obj = (titles || []).slice(0, 4).filter(Boolean);
  const fallback = ['Objective 1', 'Objective 2', 'Objective 3'];
  const list = obj.length ? obj : fallback;
  const slotW = 800 / (list.length + 1);
  return (
    <svg viewBox="0 0 800 480" width="100%" style={{ display: 'block' }}>
      {/* Vision */}
      <rect x="300" y="30" width="200" height="60" fill="#1a1a2e" rx="2"/>
      <text x="400" y="58" textAnchor="middle" fontFamily="'Playfair Display', serif"
        fontSize="14" fontWeight="600" fill="#fff">Stratejik Vizyon</text>
      <text x="400" y="78" textAnchor="middle" fontFamily="'JetBrains Mono', monospace"
        fontSize="9" letterSpacing="2" fill="rgba(255,255,255,0.6)">NORTH STAR</text>
      {/* Objectives */}
      {list.map((o, i) => {
        const cx = slotW * (i + 1);
        return (
          <g key={i}>
            {/* connector */}
            <path d={`M 400 90 C 400 140, ${cx} 140, ${cx} 180`}
              stroke={color} strokeWidth="1.5" fill="none" strokeOpacity="0.6"/>
            <rect x={cx - 80} y="180" width="160" height="70" fill={color} fillOpacity="0.9" rx="2"/>
            <text x={cx} y="205" textAnchor="middle" fontFamily="'JetBrains Mono', monospace"
              fontSize="9" letterSpacing="2" fill="rgba(255,255,255,0.7)">OBJ 0{i + 1}</text>
            <WrappedText text={o} x={cx} y={232} color="#fff" size={11} weight={600} maxChars={20} lineHeight={14}/>
            {/* Key Results stubs */}
            {[0, 1, 2].map(k => {
              const ky = 290 + k * 50;
              return (
                <g key={k}>
                  <line x1={cx} y1="250" x2={cx} y2={ky - 8} stroke={color} strokeWidth="1" strokeOpacity="0.4"/>
                  <line x1={cx} y1={ky - 8} x2={cx + 12} y2={ky - 8} stroke={color} strokeWidth="1" strokeOpacity="0.4"/>
                  <rect x={cx - 70} y={ky - 18} width="140" height="32" fill="#fff" stroke={color} strokeWidth="1" rx="2"/>
                  <text x={cx} y={ky + 2} textAnchor="middle" fontFamily="'JetBrains Mono', monospace"
                    fontSize="9" letterSpacing="1.5" fill={color} fontWeight="500">KR 0{k + 1}</text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- Balanced Scorecard (diamond) ---------- */
function BSCDiagram({ titles, color }) {
  // Top=Financial, Right=Customer, Bottom=Internal, Left=Learning
  const top    = pickTitle(titles, 0, 'Finansal');
  const right  = pickTitle(titles, 1, 'Müşteri');
  const bottom = pickTitle(titles, 2, 'İç Süreçler');
  const left   = pickTitle(titles, 3, 'Öğrenme & Gelişim');
  return (
    <svg viewBox="0 0 800 500" width="100%" style={{ display: 'block' }}>
      {/* diamond cells */}
      <polygon points="400,40 600,250 400,250 200,250" fill={color} fillOpacity="0.85"/>
      <polygon points="600,250 400,460 400,250" fill={color} fillOpacity="0.6"/>
      <polygon points="200,250 400,460 400,250" fill={color} fillOpacity="0.35"/>
      <polygon points="400,40 200,250 400,250" fill={color} fillOpacity="0.15"/>
      {/* center vision diamond */}
      <polygon points="400,200 440,250 400,300 360,250" fill="#1a1a2e"/>
      <text x="400" y="254" textAnchor="middle" fontFamily="'JetBrains Mono', monospace"
        fontSize="9" letterSpacing="2" fill="#fff" fontWeight="600">VİZYON</text>
      {/* labels */}
      <WrappedText text={top}    x={400} y={125} color="#fff" size={13} weight={700} maxChars={20}/>
      <WrappedText text={right}  x={500} y={325} color="#fff" size={12} weight={700} maxChars={20}/>
      <WrappedText text={bottom} x={400} y={395} color="#1a1a2e" size={12} weight={700} maxChars={20}/>
      <WrappedText text={left}   x={300} y={195} color="#1a1a2e" size={11} weight={700} maxChars={18}/>
      {/* perspective tags */}
      {[
        { x: 400, y: 25,  l: 'FİNANSAL' },
        { x: 620, y: 350, l: 'MÜŞTERİ', anchor: 'start' },
        { x: 400, y: 480, l: 'İÇ SÜREÇLER' },
        { x: 180, y: 350, l: 'ÖĞRENME', anchor: 'end' },
      ].map((r, i) => (
        <text key={i} x={r.x} y={r.y} textAnchor={r.anchor || 'middle'}
          fontFamily="'JetBrains Mono', monospace" fontSize="9"
          letterSpacing="2" fill="#8a8aa0" fontWeight="500">{r.l}</text>
      ))}
    </svg>
  );
}

/* ---------- Dispatcher ---------- */
function FrameworkDiagram({ frameworkId, titles, color }) {
  const t = titles || [];
  const map = {
    bcg: BCGDiagram,
    '7s': SevenSDiagram,
    house: HouseDiagram,
    hoshin: HoshinDiagram,
    porter: PorterDiagram,
    swot: SWOTDiagram,
    okr: OKRDiagram,
    bsc: BSCDiagram,
  };
  const D = map[frameworkId];
  if (!D) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #d8dbe3', borderRadius: 2,
      padding: '32px 24px', position: 'relative'
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
        color: '#8a8aa0', letterSpacing: '0.25em', textTransform: 'uppercase',
        marginBottom: 16
      }}>Çerçeve Diyagramı</div>
      <D titles={t} color={color}/>
    </div>
  );
}

window.FrameworkDiagram = FrameworkDiagram;
