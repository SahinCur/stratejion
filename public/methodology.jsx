/* =========================================================
   METHODOLOGY SCREEN — full reference of all 8 frameworks
   ========================================================= */

const FRAMEWORK_DETAIL = {
  bcg: {
    long: 'Boston Consulting Group tarafından 1970\'lerde geliştirilen portföy analizi modeli. Ürün veya iş birimlerini pazar büyüme oranı ve göreceli pazar payı eksenlerinde 4 kadrana yerleştirir: Stars, Cash Cows, Question Marks, Dogs. Yatırım kararlarını ve portföy dengesini yapılandırmak için kullanılır.',
    when: 'Çok ürünlü/çok birimli organizasyonlarda portföy önceliklendirmesi yaparken.',
    sectors: ['Üretim & Sanayi', 'Perakende & E-Ticaret', 'Teknoloji & SaaS', 'Sağlık & İlaç'],
  },
  '7s': {
    long: 'McKinsey & Company ortakları Tom Peters ve Robert Waterman tarafından geliştirilen organizasyonel uyum modeli. Strategy, Structure ve Systems (Hard S) ile Shared Values, Skills, Style, Staff (Soft S) elementlerinin karşılıklı uyumunu inceler. Dönüşüm ve değişim yönetimi süreçlerinde organizasyonel hizalanmayı değerlendirir.',
    when: 'Dönüşüm, yeniden yapılanma veya büyük ölçekli değişim yönetimi süreçlerinde.',
    sectors: ['Finans & Bankacılık', 'Üretim & Sanayi', 'Sağlık & İlaç', 'Lojistik & Tedarik Zinciri'],
  },
  house: {
    long: 'Vizyon, misyon, değerler, yetkinlikler ve operasyonel süreçleri katmanlı bir ev metaforu üzerinden ilişkilendiren stratejik hiyerarşi modeli. Çatıdan temele doğru her katman bir altındaki katmanı taşır ve uzun vadeli yön ile günlük operasyonlar arasında köprü kurar.',
    when: 'Şirket stratejisini iletişim için sadeleştirirken veya yeni stratejik plan dönemi başlangıcında.',
    sectors: ['Eğitim & EdTech', 'Sağlık & İlaç', 'Enerji & Sürdürülebilirlik', 'Finans & Bankacılık'],
  },
  hoshin: {
    long: 'Japon kaynaklı strateji yayılım metodolojisi. Kuzey Yıldızı vizyonundan yıllık breakthrough hedeflere, oradan departman, takım ve birey düzeyine kaskadlanır. Catchball denilen çift yönlü diyalog ve PDCA döngüsüyle stratejinin tüm seviyelerde aynı yöne hizalanmasını sağlar.',
    when: 'Strateji ile günlük operasyonlar arasında kopukluk olduğunda; hizalama gerektiğinde.',
    sectors: ['Üretim & Sanayi', 'Lojistik & Tedarik Zinciri', 'Sağlık & İlaç', 'Teknoloji & SaaS'],
  },
  porter: {
    long: 'Michael Porter\'ın 1979\'da Harvard Business Review\'da yayımladığı sektör analizi modeli. Tedarikçi gücü, alıcı gücü, yeni girenlerin tehdidi, ikame ürün tehdidi ve mevcut rekabet yoğunluğu olmak üzere 5 yapısal kuvvetin sektör çekiciliğini nasıl şekillendirdiğini inceler.',
    when: 'Yeni pazara giriş, sektörel pozisyonlama veya stratejik konumlandırma kararlarında.',
    sectors: ['Teknoloji & SaaS', 'Perakende & E-Ticaret', 'Finans & Bankacılık', 'Enerji & Sürdürülebilirlik'],
  },
  swot: {
    long: 'Albert Humphrey\'in 1960\'larda Stanford\'da geliştirdiği klasik durum analizi aracı. İç faktörler olan güçlü ve zayıf yönleri, dış faktörler olan fırsat ve tehditlerle eşleştirir. TOWS matrisiyle SO, WO, ST, WT çapraz stratejilerini üretir.',
    when: 'Hızlı durum tespiti, yıllık plan başlangıcı veya yeni inisiyatif değerlendirmesinde.',
    sectors: ['Tüm sektörler için temel araç', 'Eğitim & EdTech', 'Perakende & E-Ticaret'],
  },
  okr: {
    long: 'Intel\'de Andy Grove tarafından geliştirilen, Google ile yaygınlaşan hedef yönetim çerçevesi. Birkaç hırslı Objective\'in her birine 3-4 ölçülebilir Key Result bağlanır. Çeyreklik döngülerle confidence skorları ve sonuç değerlendirmesi yapılır.',
    when: 'Yüksek otonomi gerektiren ölçeklenen organizasyonlarda; çevik takımlarda.',
    sectors: ['Teknoloji & SaaS', 'Eğitim & EdTech', 'Finans & Bankacılık', 'Perakende & E-Ticaret'],
  },
  bsc: {
    long: 'Robert Kaplan ve David Norton\'un 1992 HBR makalesinde tanıttığı 4 perspektifli performans yönetim modeli. Finansal, Müşteri, İç Süreçler ve Öğrenme & Gelişim perspektiflerinde hedef-ölçüt-hedef değer-inisiyatif zinciri kurar.',
    when: 'Sadece finansal göstergelerin yetmediği, çok boyutlu performans yönetimi gerektiğinde.',
    sectors: ['Finans & Bankacılık', 'Sağlık & İlaç', 'Enerji & Sürdürülebilirlik', 'Üretim & Sanayi'],
  },
};

function MethodologyScreen({ frameworks, onBack, onStart }) {
  return (
    <div className="fadeUp" style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 48px 100px' }}>
      <button onClick={onBack} style={{
        background: 'none', border: 'none', color: 'var(--ink-soft)',
        fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase',
        marginBottom: 40, padding: 0, cursor: 'pointer'
      }}>← Geri Dön</button>

      <div style={{ marginBottom: 64, maxWidth: 820 }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
          color: 'var(--teal-dark)', letterSpacing: '0.2em', marginBottom: 12
        }}>METODOLOJİ / KÜTÜPHANE</div>
        <h1 style={{ fontSize: 64, lineHeight: 1.04, marginBottom: 24, letterSpacing: '-0.02em' }}>
          Sekiz stratejik <span style={{ fontStyle: 'italic', color: 'var(--teal-dark)' }}>düşünme aracı</span>.
        </h1>
        <p style={{ fontSize: 18, color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0 }}>
          Stratejion'un altında yatan çerçeveler; danışmanlık dünyasının kanıtlanmış metodolojilerinden seçilmiştir.
          Her birinin kendi varsayımları, sınırları ve en güçlü olduğu kullanım bağlamı vardır. Aşağıda her birinin
          ne olduğunu, ne zaman kullanılması gerektiğini ve hangi sektörlerde özellikle etkili olduğunu bulabilirsiniz.
        </p>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
        gap: 20
      }}>
        {frameworks.map((f, i) => {
          const d = FRAMEWORK_DETAIL[f.id];
          return (
            <article key={f.id} className="fadeUp" style={{
              background: '#fff', border: '1px solid var(--line-2)',
              borderRadius: 2, padding: 36,
              position: 'relative', overflow: 'hidden',
              animationDelay: (i * 60) + 'ms'
            }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                background: f.color
              }}></div>
              <div style={{
                position: 'absolute', right: -12, top: -16,
                fontSize: 100, lineHeight: 1, opacity: 0.06, color: f.color
              }}>{f.glyph}</div>

              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 6 }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                    color: 'var(--muted)', letterSpacing: '0.2em'
                  }}>0{i + 1}</span>
                  <span style={{ fontSize: 22, color: f.color, lineHeight: 1 }}>{f.glyph}</span>
                </div>
                <h2 style={{
                  fontFamily: "'Playfair Display', serif", fontSize: 28,
                  fontWeight: 500, marginBottom: 16, letterSpacing: '-0.005em'
                }}>{f.name}</h2>
                <p style={{
                  fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.65,
                  marginTop: 0, marginBottom: 24
                }}>{d.long}</p>

                <div style={{
                  borderTop: '1px solid var(--line)', paddingTop: 18, marginBottom: 18
                }}>
                  <div style={{
                    fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase',
                    color: 'var(--muted)', marginBottom: 6, fontWeight: 500
                  }}>Ne zaman kullanılır</div>
                  <div style={{ fontSize: 14, color: 'var(--ink)', fontStyle: 'italic', fontFamily: "'Playfair Display', serif" }}>
                    {d.when}
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase',
                    color: 'var(--muted)', marginBottom: 10, fontWeight: 500
                  }}>Etkili olduğu sektörler</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {d.sectors.map(s => (
                      <span key={s} style={{
                        padding: '6px 12px', fontSize: 11,
                        border: '1px solid var(--line-2)', borderRadius: 100,
                        color: 'var(--ink-soft)', background: 'var(--bg)',
                        fontFamily: "'DM Sans', sans-serif", fontWeight: 500
                      }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div style={{
        marginTop: 64, padding: '36px 40px',
        background: 'var(--navy)', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: 24, flexWrap: 'wrap'
      }}>
        <div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
            color: 'var(--teal)', letterSpacing: '0.2em', marginBottom: 6
          }}>HAZIR MISINIZ</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 500 }}>
            Sektörünüze ve probleminize en uygun çerçeveyi birlikte uygulayalım.
          </div>
        </div>
        <button onClick={onStart} style={{
          background: 'var(--teal)', color: '#fff', border: 'none',
          padding: '20px 32px', borderRadius: 2,
          fontSize: 13, letterSpacing: '0.18em', fontWeight: 500,
          textTransform: 'uppercase', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 14
        }}>
          Analize Başla
          <span>→</span>
        </button>
      </div>
    </div>
  );
}

window.MethodologyScreen = MethodologyScreen;
