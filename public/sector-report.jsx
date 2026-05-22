/* =========================================================
   SECTOR REPORT — Şirket / ürün / NACE → profesyonel sektör analizi
   Kendi içinde routing (brief → loading → results → error)
   ========================================================= */
(function() {
  const { useState, useMemo } = React;

  /* ---------- Phase prompts ---------- */
  function baseSysSector(input) {
    return `Sen 20+ yıl deneyimli, Tier-1 strateji danışmanlığı firmasında (McKinsey, BCG, Bain) çalışmış, sektör araştırması ve pazar analizi alanında uzman bir kıdemli danışmansın. Yanıtların gerçek sektör jargonu, somut rakamsal aralıklar, gerçek oyuncu örnekleri ve regülasyon detayları içermeli; klişe/jenerik ifadelerden kaçınmalı.

GİRDİ:
- Şirket/Ürün/Sektör: ${input.subject}
- NACE Kodu: ${input.nace || 'Belirtilmedi'}
- Coğrafya: ${input.geography || 'Türkiye (öncelikli) + global bağlam'}

KRİTİK KURALLAR:
1. SADECE geçerli JSON döndür — markdown, backtick, açıklama YAZMA
2. Profesyonel Türkçe kullan
3. Spesifik rakam aralıkları ve gerçek şirket/regülasyon adları kullan
4. Her cümle bir insight içersin — boş genelleme yapma`;
  }

  function buildSectorPhase1(input) {
    return `${baseSysSector(input)}

GÖREV: Yönetici özeti + pazar fotoğrafı + ilk 3 analiz bölümü.

JSON formatı (TAM bu yapı):
{"sectorName":"Sektörün resmi adı","naceCode":"NACE Rev.2 kodu (örn: C29.10) — bilinmiyorsa boş bırak","executiveSummary":"3-4 cümlelik yönetici özeti: sektör nedir, mevcut durum, kritik dinamik","marketSnapshot":{"size":"Pazar büyüklüğü (örn: ~12 milyar USD / 350 milyar TL)","growth":"Büyüme oranı (örn: %7-9 CAGR, 2024-2028)","maturity":"Olgunluk seviyesi (Gelişmekte / Hızlı Büyüme / Olgun / Düşüş)","concentration":"Pazar yoğunluğu (Parçalı / Orta / Konsantre)"},"sections":[{"title":"Pazar Tanımı ve Yapısı","content":"5-6 cümle: sektörün sınırları, alt segmentleri, değer zinciri","highlights":["İçgörü 1","İçgörü 2","İçgörü 3"]},{"title":"Talep Dinamikleri","content":"5-6 cümle: müşteri segmentleri, satın alma davranışı, talep belirleyicileri","highlights":["İçgörü 1","İçgörü 2","İçgörü 3"]},{"title":"Arz Tarafı ve Rekabet Yapısı","content":"5-6 cümle: oyuncular, giriş engelleri, rekabet stratejileri","highlights":["İçgörü 1","İçgörü 2","İçgörü 3"]}]}`;
  }

  function buildSectorPhase2(input) {
    return `${baseSysSector(input)}

GÖREV: Sektör analizinin son 3 bölümü: trendler, regülasyon, fırsat-risk.

JSON formatı:
{"sections":[{"title":"Trendler ve İtici Güçler","content":"5-6 cümle: makro trendler, teknoloji etkisi, tüketici evrimi","highlights":["İçgörü 1","İçgörü 2","İçgörü 3"]},{"title":"Düzenleyici Çerçeve","content":"5-6 cümle: ilgili mevzuat, vergi/teşvik yapısı, denetleyici kurumlar","highlights":["İçgörü 1","İçgörü 2","İçgörü 3"]},{"title":"Riskler ve Fırsatlar","content":"5-6 cümle: kısa-orta vadeli riskler, açık fırsat alanları","highlights":["İçgörü 1","İçgörü 2","İçgörü 3"]}]}`;
  }

  function buildSectorPlayers(input) {
    return `${baseSysSector(input)}

GÖREV: Bu sektördeki 6 önemli oyuncuyu (gerçek şirket adları, Türkiye + global) konumlandır.

SADECE şu JSON'u döndür:
{"keyPlayers":[{"name":"Gerçek şirket adı","role":"Lider | Challenger | Niche | Disruptor","note":"Bir cümle: pozisyonu/farklılaşma noktası"},{"name":"...","role":"...","note":"..."},{"name":"...","role":"...","note":"..."},{"name":"...","role":"...","note":"..."},{"name":"...","role":"...","note":"..."},{"name":"...","role":"...","note":"..."}]}`;
  }

  function buildSectorMoves(input) {
    return `${baseSysSector(input)}

GÖREV: Bu sektöre giren / oyuncu olan bir şirket için 5 stratejik hamle önerisi + 5 yıllık görünüm üret.

SADECE şu JSON'u döndür:
{"strategicMoves":["Hamle 1: tek cümle, fiille başla","Hamle 2: ...","Hamle 3: ...","Hamle 4: ...","Hamle 5: ..."],"outlook":"3-4 cümlelik 5 yıllık görünüm: sektör nereye gidiyor, kazananlar/kaybedenler kim olur, ne tip pozisyonlama önerilir"}`;
  }

  /* ---------- JSON helpers (Stratejion.html'dekiyle paralel) ---------- */
  function fixJSONSector(raw) {
    if (!raw) return raw;
    let s = raw;
    const stack = [];
    let inStr = false, escape = false;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (escape) { escape = false; continue; }
      if (ch === '\\') { escape = true; continue; }
      if (inStr) { if (ch === '"') inStr = false; continue; }
      if (ch === '"') { inStr = true; continue; }
      if (ch === '{' || ch === '[') stack.push(ch);
      else if (ch === '}') { if (stack[stack.length-1] === '{') stack.pop(); }
      else if (ch === ']') { if (stack[stack.length-1] === '[') stack.pop(); }
    }
    if (inStr) s += '"';
    s = s.replace(/,\s*$/g, '');
    while (stack.length) {
      const open = stack.pop();
      s = s.replace(/,\s*$/g, '');
      s += open === '{' ? '}' : ']';
    }
    return s;
  }
  function extractJsonSector(text) {
    if (!text) throw new Error('Boş yanıt');
    let t = text.trim().replace(/^```(json|JSON)?\s*/i, '').replace(/```\s*$/i, '').trim();
    const first = t.indexOf('{'); const last = t.lastIndexOf('}');
    if (first >= 0) t = last > first ? t.slice(first, last + 1) : t.slice(first);
    try { return JSON.parse(t); } catch (e) {}
    try { return JSON.parse(fixJSONSector(t)); } catch (e) {}
    throw new Error('JSON parse edilemedi');
  }

  async function callClaudeSector(prompt) {
    if (window.claude && typeof window.claude.complete === 'function') {
      return await window.claude.complete(prompt);
    }
    const res = await fetch('/.netlify/functions/claude-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, max_tokens: 2048 })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Bilinmeyen hata' }));
      throw new Error(err.error || 'API hatası: ' + res.status);
    }
    const data = await res.json();
    if (!data.text) throw new Error('API yanıtı boş');
    return data.text;
  }

  /* =========================================================
     BRIEF — Input form
     ========================================================= */
  function SectorBrief({ onSubmit, onBack }) {
    const [subject, setSubject] = useState('');
    const [nace, setNace] = useState('');
    const [geography, setGeography] = useState('Türkiye');

    const canGo = subject.trim().length > 2;

    return (
      <div className="fadeUp" style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 48px 100px' }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: 'var(--ink-soft)',
          fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase',
          marginBottom: 40, padding: 0
        }}>← Ana Sayfa</button>

        <div style={{ marginBottom: 56, maxWidth: 820 }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
            color: 'var(--teal-dark)', letterSpacing: '0.2em', marginBottom: 12
          }}>SEKTÖR RAPORU / BRIEF</div>
          <h1 style={{ fontSize: 56, lineHeight: 1.05, marginBottom: 16 }}>Sektör raporu hazırlayalım</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 17, margin: 0 }}>
            Şirket adı, ürün veya NACE kodu girin. Profesyonel danışman gözünden pazar yapısı,
            rekabet, trendler, regülasyon ve fırsatları içeren bir sektör raporu üretelim.
          </p>
        </div>

        {/* Subject */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--teal-dark)', letterSpacing: '0.2em' }}>01</span>
            <h2 style={{ fontSize: 24, fontWeight: 500, margin: 0 }}>Şirket / Ürün / Sektör</h2>
            <span style={{ color: 'var(--muted)', fontSize: 14 }}>Raporun konusu</span>
          </div>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Örn: Elektrikli araç şarj altyapısı; Soğuk zincir lojistiği; Online özel ders pazarı"
            style={{
              width: '100%', padding: '22px 24px',
              background: '#fff', border: '1px solid var(--line-2)',
              borderRadius: 2, fontSize: 17, color: 'var(--ink)',
              outline: 'none', lineHeight: 1.5, fontFamily: 'inherit'
            }}
          />
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, fontFamily: "'JetBrains Mono', monospace" }}>
            {subject.length} karakter — min. 3
          </div>
        </div>

        {/* NACE + Geo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--teal-dark)', letterSpacing: '0.2em' }}>02</span>
              <h2 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>NACE Kodu</h2>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>opsiyonel</span>
            </div>
            <input
              type="text"
              value={nace}
              onChange={e => setNace(e.target.value)}
              placeholder="Örn: C29.10 — Motorlu kara taşıtları"
              style={{
                width: '100%', padding: '18px 20px',
                background: '#fff', border: '1px solid var(--line-2)',
                borderRadius: 2, fontSize: 15, color: 'var(--ink)',
                outline: 'none', fontFamily: "'JetBrains Mono', monospace"
              }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--line)' }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--teal-dark)', letterSpacing: '0.2em' }}>03</span>
              <h2 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>Coğrafya</h2>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>pazar odağı</span>
            </div>
            <input
              type="text"
              value={geography}
              onChange={e => setGeography(e.target.value)}
              placeholder="Türkiye, Avrupa, Global..."
              style={{
                width: '100%', padding: '18px 20px',
                background: '#fff', border: '1px solid var(--line-2)',
                borderRadius: 2, fontSize: 15, color: 'var(--ink)',
                outline: 'none', fontFamily: 'inherit'
              }}
            />
          </div>
        </div>

        <div style={{
          marginTop: 48, paddingTop: 36, borderTop: '1px solid var(--line)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em' }}>
            Rapor 6 bölüm · pazar fotoğrafı · oyuncular · 5 yıllık görünüm
          </div>
          <button
            onClick={() => canGo && onSubmit({ subject: subject.trim(), nace: nace.trim(), geography: geography.trim() })}
            disabled={!canGo}
            style={{
              background: canGo ? 'var(--teal)' : 'var(--line-2)',
              color: canGo ? '#fff' : 'var(--muted)',
              border: 'none',
              padding: '22px 40px', borderRadius: 2,
              fontSize: 14, letterSpacing: '0.18em', fontWeight: 500,
              textTransform: 'uppercase',
              cursor: canGo ? 'pointer' : 'not-allowed',
              display: 'inline-flex', alignItems: 'center', gap: 16
            }}>
            Sektör Raporu Oluştur
            <span>→</span>
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================
     RESULTS — Sector report layout
     ========================================================= */
  function SectorResults({ data, input, onRestart, onNewReport }) {
    const [expandedIdx, setExpandedIdx] = useState(0);
    const accent = '#2A9D8F'; // teal accent for sector reports

    const exportPDF = () => {
      const sectionsHTML = (data.sections || []).map((s, i) => `
        <div style="page-break-inside:avoid;margin-bottom:22px;padding:20px 24px;border-left:3px solid ${accent};background:#f8f9fb;">
          <h3 style="font-family:'DM Sans',sans-serif;font-size:15px;font-weight:600;margin:0 0 10px;color:#1a1a2e;">
            <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#8a8aa0;margin-right:8px;font-weight:400;">${String(i+1).padStart(2,'0')}</span>
            ${s.title || ''}
          </h3>
          <p style="font-family:'DM Sans',sans-serif;font-size:12.5px;color:#4a4a63;line-height:1.75;margin:0 0 14px;">${s.content || ''}</p>
          ${(s.highlights && s.highlights.length) ? `
            <div style="margin-top:10px;">
              <div style="font-family:'DM Sans',sans-serif;font-size:9px;letter-spacing:0.2em;color:#8a8aa0;text-transform:uppercase;margin-bottom:6px;font-weight:500;">İçgörüler</div>
              ${s.highlights.map(h => `<div style="font-family:'DM Sans',sans-serif;font-size:11.5px;color:#1a1a2e;padding:3px 0;line-height:1.6;"><span style="color:${accent};margin-right:6px;">▸</span>${h}</div>`).join('')}
            </div>
          ` : ''}
        </div>
      `).join('');

      const playersHTML = (data.keyPlayers || []).map(p => `
        <div style="padding:10px 0;border-bottom:1px solid #eef0f4;display:flex;gap:14px;font-family:'DM Sans',sans-serif;font-size:12px;">
          <div style="min-width:140px;font-weight:600;color:#1a1a2e;">${p.name || ''}</div>
          <div style="min-width:90px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.1em;color:${accent};text-transform:uppercase;padding-top:2px;">${p.role || ''}</div>
          <div style="color:#4a4a63;flex:1;">${p.note || ''}</div>
        </div>
      `).join('');

      const movesHTML = (data.strategicMoves || []).map((m, i) => `
        <div style="padding:10px 0;border-bottom:1px solid #eef0f4;font-family:'DM Sans',sans-serif;font-size:12.5px;display:flex;gap:12px;">
          <span style="font-family:'JetBrains Mono',monospace;color:${accent};font-weight:600;min-width:24px;font-size:11px;">${String(i+1).padStart(2,'0')}</span>
          <span>${m}</span>
        </div>
      `).join('');

      const now = new Date().toLocaleDateString('tr-TR', { year:'numeric', month:'long', day:'numeric' });
      const snap = data.marketSnapshot || {};

      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
        <title>Stratejion — Sektör Raporu: ${data.sectorName || input.subject}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
        <style>
          *{box-sizing:border-box;margin:0;padding:0}
          body{font-family:'DM Sans',system-ui,sans-serif;color:#1a1a2e;line-height:1.65;padding:56px 64px;max-width:920px;margin:0 auto;-webkit-font-smoothing:antialiased}
          h1,h2{font-family:'Playfair Display',Georgia,serif;font-weight:500;letter-spacing:-0.01em}
          @media print{body{padding:36px 48px;font-size:11pt}.no-print{display:none}.page-break{page-break-before:always}}
          @page{margin:1.5cm 2cm;size:A4}
        </style></head><body>
        <div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #1a1a2e;padding-bottom:14px;margin-bottom:40px;">
          <div>
            <div style="font-size:13px;letter-spacing:0.3em;font-weight:300;text-transform:uppercase;">STRATEJION</div>
            <div style="font-size:10px;color:#8a8aa0;letter-spacing:0.1em;margin-top:2px;">Sektör Raporu</div>
          </div>
          <div style="text-align:right;">
            <div style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#8a8aa0;">${now}</div>
            <div style="font-family:'JetBrains Mono',monospace;font-size:9px;color:#b0b0c0;margin-top:2px;">Rapor ID: ${Math.random().toString(36).substr(2,8).toUpperCase()}</div>
          </div>
        </div>
        <div style="background:#1a1a2e;color:white;padding:40px 44px;margin-bottom:36px;">
          <div style="display:flex;gap:12px;align-items:center;margin-bottom:16px;">
            <span style="padding:4px 12px;background:${accent};font-size:10px;letter-spacing:0.15em;text-transform:uppercase;font-weight:500;">SEKTÖR RAPORU</span>
            ${data.naceCode ? `<span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:rgba(255,255,255,0.6);letter-spacing:0.1em;">NACE ${data.naceCode}</span>` : ''}
            <span style="font-size:11px;color:rgba(255,255,255,0.5);letter-spacing:0.1em;text-transform:uppercase;">${input.geography || 'Türkiye'}</span>
          </div>
          <h1 style="font-size:28px;color:white;margin-bottom:20px;line-height:1.25;">${data.sectorName || input.subject}</h1>
          <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:8px;">Yönetici Özeti</div>
          <p style="font-size:13px;color:rgba(255,255,255,0.9);line-height:1.75;font-family:'Playfair Display',serif;font-style:italic;">${data.executiveSummary || ''}</p>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:14px;margin-bottom:36px;">
          ${['size','growth','maturity','concentration'].map(k => `
            <div style="border:1px solid #e6e8ee;padding:18px;">
              <div style="font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.2em;color:#8a8aa0;text-transform:uppercase;margin-bottom:8px;">${({size:'Pazar Büyüklüğü',growth:'Büyüme',maturity:'Olgunluk',concentration:'Yoğunlaşma'})[k]}</div>
              <div style="font-size:13px;font-weight:600;color:#1a1a2e;">${snap[k] || '—'}</div>
            </div>
          `).join('')}
        </div>
        ${sectionsHTML}
        <div class="page-break"></div>
        <div style="margin:36px 0;page-break-inside:avoid;">
          <div style="display:flex;align-items:baseline;gap:14px;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid #e6e8ee;">
            <span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:${accent};letter-spacing:0.15em;">02</span>
            <h2 style="font-size:18px;">Ana Oyuncular</h2>
          </div>
          ${playersHTML || '<p style="color:#8a8aa0;font-style:italic;font-size:12px;">Veri yok.</p>'}
        </div>
        <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:36px;margin:40px 0;page-break-inside:avoid;">
          <div>
            <div style="display:flex;align-items:baseline;gap:14px;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid #e6e8ee;">
              <span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:${accent};letter-spacing:0.15em;">03</span>
              <h2 style="font-size:18px;">Stratejik Hamleler</h2>
            </div>
            ${movesHTML || '<p style="color:#8a8aa0;font-style:italic;font-size:12px;">Veri yok.</p>'}
          </div>
          <div>
            <div style="display:flex;align-items:baseline;gap:14px;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid #e6e8ee;">
              <span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:${accent};letter-spacing:0.15em;">04</span>
              <h2 style="font-size:18px;">5 Yıllık Görünüm</h2>
            </div>
            <p style="font-size:13px;color:#1a1a2e;line-height:1.75;font-family:'Playfair Display',serif;font-style:italic;">${data.outlook || ''}</p>
          </div>
        </div>
        <div style="margin-top:56px;padding-top:16px;border-top:2px solid #1a1a2e;display:flex;justify-content:space-between;align-items:center;">
          <div style="font-size:10px;letter-spacing:0.3em;font-weight:300;">STRATEJION © 2026</div>
          <div style="font-size:9px;color:#8a8aa0;letter-spacing:0.05em;">Sektör Raporu · Profesyonel Danışman Çıktısı</div>
        </div>
      </body></html>`;
      const w = window.open('', '_blank');
      w.document.write(html); w.document.close();
      setTimeout(() => w.print(), 500);
    };

    const snap = data.marketSnapshot || {};

    return (
      <div className="fadeUp" style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 48px 100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
          <button onClick={onNewReport} style={{
            background: 'none', border: 'none', color: 'var(--ink-soft)',
            fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', padding: 0
          }}>← Yeni Sektör Raporu</button>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <button onClick={exportPDF} style={{
              background: 'var(--teal)', color: '#fff', border: 'none',
              padding: '10px 24px', borderRadius: 2,
              fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
            }}>
              <span style={{ fontSize: 16 }}>↓</span> PDF İndir
            </button>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)' }}></span>
              Rapor hazır
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="fadeUp" style={{
          background: 'var(--navy)', color: '#fff',
          padding: '56px 64px', borderRadius: 2,
          position: 'relative', overflow: 'hidden', marginBottom: 36
        }}>
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, flexWrap: 'wrap' }}>
              <span style={{
                padding: '6px 12px', background: accent, color: '#fff',
                fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 500
              }}>Sektör Raporu</span>
              {data.naceCode && (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em' }}>
                  NACE {data.naceCode}
                </span>
              )}
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                {input.geography || 'Türkiye'}
              </span>
            </div>
            <h1 style={{
              fontSize: 52, lineHeight: 1.1, marginBottom: 28, color: '#fff', maxWidth: 900
            }}>
              {data.sectorName || input.subject}
            </h1>
            <div style={{ fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>Yönetici Özeti</div>
            <div style={{ fontSize: 18, lineHeight: 1.6, color: '#fff', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', maxWidth: 1000 }}>
              {data.executiveSummary}
            </div>
          </div>
        </div>

        {/* Market snapshot 4-stat strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 56
        }}>
          {[
            { k: 'size', label: 'Pazar Büyüklüğü' },
            { k: 'growth', label: 'Büyüme' },
            { k: 'maturity', label: 'Olgunluk' },
            { k: 'concentration', label: 'Yoğunlaşma' },
          ].map(s => (
            <div key={s.k} style={{
              background: '#fff', border: '1px solid var(--line-2)',
              borderLeft: '3px solid ' + accent,
              padding: '24px 22px', borderRadius: 2
            }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                letterSpacing: '0.22em', color: 'var(--muted)', textTransform: 'uppercase',
                marginBottom: 12
              }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>
                {snap[s.k] || '—'}
              </div>
            </div>
          ))}
        </div>

        {/* Sections accordion */}
        <div style={{ marginBottom: 56 }}>
          <SectionHdr step="01" title="Sektör Analizi" count={(data.sections || []).length} />
          <div style={{ display: 'grid', gap: 12 }}>
            {(data.sections || []).map((s, i) => {
              const open = expandedIdx === i;
              return (
                <div key={i} className="fadeUp" style={{
                  background: '#fff', border: '1px solid var(--line-2)',
                  borderLeft: '3px solid ' + accent,
                  borderRadius: 2, animationDelay: (i*80) + 'ms'
                }}>
                  <button onClick={() => setExpandedIdx(open ? -1 : i)} style={{
                    width: '100%', padding: '28px 32px', background: 'transparent', border: 'none',
                    textAlign: 'left', display: 'flex', alignItems: 'center', gap: 24, justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flex: 1 }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--muted)', letterSpacing: '0.15em', minWidth: 50 }}>
                        {String(i+1).padStart(2,'0')}
                      </span>
                      <h3 style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>{s.title}</h3>
                    </div>
                    <span style={{ fontSize: 22, color: accent, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.3s', display: 'inline-block' }}>+</span>
                  </button>
                  {open && (
                    <div style={{ padding: '0 32px 36px 106px', animation: 'fadeUp 0.4s both' }}>
                      <p style={{ fontSize: 16, color: 'var(--ink-soft)', lineHeight: 1.7, marginTop: 0, marginBottom: 24 }}>
                        {s.content}
                      </p>
                      {(s.highlights && s.highlights.length > 0) && (
                        <div>
                          <div style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14, fontWeight: 500 }}>
                            İçgörüler
                          </div>
                          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                            {s.highlights.map((h, j) => (
                              <li key={j} style={{
                                padding: '10px 14px', background: 'var(--bg-2)', marginBottom: 6,
                                fontSize: 14, color: 'var(--ink)', borderLeft: '2px solid ' + accent,
                                display: 'flex', gap: 12
                              }}>
                                <span style={{ color: accent, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>0{j+1}</span>
                                <span style={{ flex: 1 }}>{h}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Key players */}
        <div style={{ marginBottom: 56 }}>
          <SectionHdr step="02" title="Ana Oyuncular" count={(data.keyPlayers || []).length} />
          <div style={{ background: '#fff', border: '1px solid var(--line-2)', borderRadius: 2 }}>
            {(data.keyPlayers || []).length === 0 ? (
              <div style={{ padding: 36, color: 'var(--muted)', fontStyle: 'italic', fontSize: 14 }}>
                Oyuncu verisi oluşturulamadı.
              </div>
            ) : (data.keyPlayers || []).map((p, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '220px 140px 1fr', gap: 24,
                padding: '22px 32px', alignItems: 'center',
                borderBottom: i < (data.keyPlayers || []).length - 1 ? '1px solid var(--line)' : 'none'
              }}>
                <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)', fontFamily: "'Playfair Display', serif" }}>{p.name}</div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                  color: accent, letterSpacing: '0.15em', textTransform: 'uppercase',
                  padding: '4px 10px', border: '1px solid ' + accent, display: 'inline-block', justifySelf: 'start'
                }}>{p.role}</div>
                <div style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6 }}>{p.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic moves + Outlook */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 36 }}>
          <div>
            <SectionHdr step="03" title="Stratejik Hamleler" />
            <div style={{ background: '#fff', border: '1px solid var(--line-2)', padding: 36, borderRadius: 2 }}>
              <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {(data.strategicMoves || []).length === 0 ? (
                  <li style={{ padding: '18px 0', color: 'var(--muted)', fontStyle: 'italic' }}>Hamle verisi yok.</li>
                ) : (data.strategicMoves || []).map((m, i) => (
                  <li key={i} style={{
                    display: 'flex', gap: 20,
                    padding: '16px 0',
                    borderBottom: i < (data.strategicMoves || []).length - 1 ? '1px solid var(--line)' : 'none'
                  }}>
                    <span style={{
                      fontFamily: "'Playfair Display', serif", fontSize: 26,
                      color: accent, fontWeight: 500, lineHeight: 1, minWidth: 40
                    }}>{String(i+1).padStart(2,'0')}</span>
                    <span style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink)' }}>{m}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div>
            <SectionHdr step="04" title="5 Yıllık Görünüm" />
            <div style={{ background: 'var(--navy)', color: '#fff', padding: 36, borderRadius: 2, minHeight: 200 }}>
              <div style={{ fontSize: 16, lineHeight: 1.7, fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: 'rgba(255,255,255,0.92)' }}>
                {data.outlook || 'Görünüm verisi yok.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function SectionHdr({ step, title, count }) {
    return (
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 20,
        marginBottom: 24, paddingBottom: 14, borderBottom: '1px solid var(--line)'
      }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--teal-dark)', letterSpacing: '0.2em' }}>{step}</span>
        <h2 style={{ fontSize: 26, fontWeight: 500, margin: 0 }}>{title}</h2>
        {count != null && (
          <span style={{ fontSize: 13, color: 'var(--muted)', fontFamily: "'JetBrains Mono', monospace" }}>[{count}]</span>
        )}
      </div>
    );
  }

  /* =========================================================
     LOADING — Sector report variant (4 phases)
     ========================================================= */
  function SectorLoading({ phase }) {
    const phaseLabels = [
      'Pazar yapısı analiz ediliyor…',
      'Trendler ve regülasyon değerlendiriliyor…',
      'Sektördeki oyuncular taranıyor…',
      'Stratejik hamleler ve görünüm derleniyor…'
    ];
    const phaseNum = phase ? parseInt(phase.split('/')[0]) : 0;
    const phaseTotal = phase ? parseInt(phase.split('/')[1]) : 4;
    const displayMsg = phaseLabels[phaseNum - 1] || phaseLabels[0];

    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'var(--bg)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.6s both'
      }}>
        <div style={{
          width: 240, height: 220,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          gap: 20, position: 'relative'
        }}>
          <div style={{ width: 36, height: 80, background: 'var(--teal)', borderRadius: 4, transformOrigin: 'bottom', animation: 'barRise 3.0s ease-in-out 0s infinite' }}></div>
          <div style={{ width: 36, height: 140, background: 'var(--teal)', borderRadius: 4, transformOrigin: 'bottom', animation: 'barRise 3.0s ease-in-out 0.2s infinite' }}></div>
          <div style={{ width: 36, height: 200, background: 'var(--teal)', borderRadius: 4, transformOrigin: 'bottom', animation: 'barRise 3.0s ease-in-out 0.4s infinite', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)', width: 18, height: 18, borderRadius: '50%', background: 'var(--teal)', animation: 'dotFade 3.0s ease-in-out 0.4s infinite' }}></div>
          </div>
        </div>
        <div style={{ marginTop: 64, fontSize: 11, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 500 }}>Sektör Raporu</div>
        <div style={{ marginTop: 18, height: 28, fontSize: 17, color: 'var(--ink-soft)', fontStyle: 'italic', fontFamily: "'Playfair Display', serif" }}>
          <span key={displayMsg} style={{ animation: 'fadeUp 0.6s both' }}>{displayMsg}</span>
        </div>
        <div style={{ marginTop: 32, display: 'flex', gap: 8, alignItems: 'center' }}>
          {Array.from({ length: phaseTotal }, (_, i) => (
            <span key={i} style={{ width: 28, height: 3, borderRadius: 2, background: i < phaseNum ? 'var(--teal)' : 'var(--line-2)', transition: 'background 0.4s' }}></span>
          ))}
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--muted)', letterSpacing: '0.15em', marginLeft: 6 }}>{phase}</span>
        </div>
        <div style={{ position: 'absolute', bottom: 48, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
          Sektör raporu hazırlanıyor · 4 aşamalı analiz
        </div>
      </div>
    );
  }

  /* =========================================================
     FLOW — Main routing for sector report
     ========================================================= */
  function SectorReportFlow({ onExit }) {
    const [step, setStep] = useState('brief'); // brief | loading | results | error
    const [phase, setPhase] = useState(null);
    const [input, setInput] = useState(null);
    const [result, setResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    async function generate(brief) {
      setInput(brief);
      setStep('loading');
      setResult(null);
      setErrorMsg('');

      try {
        // Phase 1: ilk 3 section + executive summary + market snapshot
        setPhase('1/4');
        const text1 = await callClaudeSector(buildSectorPhase1(brief));
        const part1 = extractJsonSector(text1);
        if (!part1.sections || part1.sections.length === 0) {
          throw new Error('İlk aşamada yapısal yanıt alınamadı.');
        }

        // Phase 2: kalan 3 section
        setPhase('2/4');
        let allSections = [...part1.sections];
        try {
          const text2 = await callClaudeSector(buildSectorPhase2(brief));
          const part2 = extractJsonSector(text2);
          if (part2.sections && Array.isArray(part2.sections)) {
            allSections = [...allSections, ...part2.sections];
          }
        } catch (e) {
          console.warn('Sector phase 2 failed:', e.message);
        }

        // Phase 3: keyPlayers (retry)
        setPhase('3/4');
        let players = [];
        for (let a = 0; a < 3; a++) {
          try {
            const tp = await callClaudeSector(buildSectorPlayers(brief));
            const pp = extractJsonSector(tp);
            if (pp.keyPlayers && pp.keyPlayers.length > 0) { players = pp.keyPlayers; break; }
          } catch (e) { console.warn('Players attempt ' + (a+1) + ':', e.message); }
        }

        // Phase 4: strategicMoves + outlook (retry)
        setPhase('4/4');
        let moves = [], outlook = '';
        for (let a = 0; a < 3; a++) {
          try {
            const tm = await callClaudeSector(buildSectorMoves(brief));
            const pm = extractJsonSector(tm);
            if (pm.strategicMoves && pm.strategicMoves.length > 0) {
              moves = pm.strategicMoves;
              outlook = pm.outlook || '';
              break;
            }
          } catch (e) { console.warn('Moves attempt ' + (a+1) + ':', e.message); }
        }

        const merged = {
          sectorName: part1.sectorName || brief.subject,
          naceCode: part1.naceCode || brief.nace || '',
          executiveSummary: part1.executiveSummary || '',
          marketSnapshot: part1.marketSnapshot || {},
          sections: allSections,
          keyPlayers: players,
          strategicMoves: moves.length ? moves : [
            'Pazardaki en hızlı büyüyen segmente yatırımı önceliklendirin.',
            'Düzenleyici değişikliklere karşı esneklik için modüler bir operasyon kurun.',
            'Müşteri verisi etrafında öğrenen bir veri katmanı inşa edin.',
            'Niş bir konumlandırmayla pahalı bir baş-baş rekabetten kaçının.',
            'Stratejik ortaklıklarla giriş engellerini hızla aşın.'
          ],
          outlook: outlook || 'Sektör önümüzdeki 5 yılda konsolidasyon ve teknoloji benimseme baskısı altında olacak. Ölçek ve veri sahipliği belirleyici olacak.'
        };

        setResult(merged);
        setPhase(null);
        setStep('results');
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || 'Rapor oluşturulamadı.');
        setPhase(null);
        setStep('error');
      }
    }

    if (step === 'brief') return <SectorBrief onSubmit={generate} onBack={onExit} />;
    if (step === 'loading') return <SectorLoading phase={phase} />;
    if (step === 'results' && result) return (
      <SectorResults
        data={result} input={input}
        onRestart={onExit}
        onNewReport={() => { setStep('brief'); setResult(null); }}
      />
    );
    if (step === 'error') return (
      <div className="fadeUp" style={{ maxWidth: 700, margin: '120px auto', padding: '0 48px', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 24, color: 'var(--teal-dark)' }}>◐</div>
        <h2 style={{ fontSize: 36, marginBottom: 16 }}>Rapor oluşturulamadı</h2>
        <p style={{ color: 'var(--ink-soft)', fontSize: 16, marginBottom: 36 }}>{errorMsg}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => input && generate(input)} style={{
            background: 'var(--teal)', color: '#fff', border: 'none',
            padding: '16px 32px', borderRadius: 2,
            fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500
          }}>Tekrar Dene</button>
          <button onClick={() => setStep('brief')} style={{
            background: 'transparent', color: 'var(--ink)', border: '1px solid var(--line-2)',
            padding: '16px 32px', borderRadius: 2,
            fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500
          }}>Brief'e Dön</button>
        </div>
      </div>
    );
    return null;
  }

  window.SectorReportFlow = SectorReportFlow;
})();
