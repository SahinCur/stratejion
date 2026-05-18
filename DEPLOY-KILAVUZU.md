# STRATEJİON — Netlify Deploy Kılavuzu

## Dosya Yapısı

```
stratejion-netlify/
├── netlify.toml                    ← Netlify yapılandırması
├── package.json                    ← Proje bilgisi
├── public/                         ← Web sitesi dosyaları
│   ├── index.html                  ← Ana sayfa (Stratejion)
│   ├── diagrams.jsx                ← Çerçeve diyagramları
│   └── methodology.jsx             ← Metodoloji ekranı
└── netlify/
    └── functions/
        └── claude-proxy.js         ← API proxy (key güvenli kalır)
```

## Adım Adım Deploy

### 1. Anthropic API Key Alın
- https://console.anthropic.com adresine gidin
- Settings → API Keys → Create Key
- Key'i kopyalayın (sk-ant-... ile başlar)

### 2. GitHub Repo Oluşturun
- GitHub'da yeni repo açın (örn: "stratejion")
- Bu ZIP'in içindeki TÜM dosyaları repo'ya yükleyin
- Klasör yapısı yukarıdaki gibi korunmalı

### 3. Netlify'a Bağlayın
- https://app.netlify.com adresine gidin
- "Add new site" → "Import an existing project"
- GitHub'ı seçin → "stratejion" repo'sunu seçin
- Build settings:
  - Build command: (boş bırakın)
  - Publish directory: public
- "Deploy site" tıklayın

### 4. API Key'i Ekleyin (ÇOK ÖNEMLİ)
- Netlify dashboard → Site settings → Environment variables
- "Add a variable" tıklayın
- Key: ANTHROPIC_API_KEY
- Value: (1. adımda aldığınız key'i yapıştırın)
- "Save" tıklayın

### 5. Yeniden Deploy Edin
- Deploys sekmesine gidin
- "Trigger deploy" → "Deploy site"
- 1-2 dakika bekleyin

### 6. Test Edin
- Netlify'ın verdiği URL'yi açın (örn: stratejion.netlify.app)
- Sektör seçin, konu yazın, çerçeve seçin
- "Strateji Analizi Oluştur" butonuna basın

## Özel Domain (İsteğe Bağlı)

- Site settings → Domain management → Add custom domain
- stratejion.com gibi kendi domain'inizi ekleyebilirsiniz
- DNS ayarlarını Netlify'ın gösterdiği şekilde yapılandırın

## Notlar

- API key ASLA frontend kodunda görünmez — sadece serverless function'da
- Her analiz 3-5 API çağrısı yapar (çerçeveye göre değişir)
- Netlify free tier ayda 125K function invocation verir
- Site hem Claude.ai artifact'te hem Netlify'da çalışır (otomatik algılar)
