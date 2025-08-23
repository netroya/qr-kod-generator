# QR Kod Üretici

Modern, güvenli ve kullanıcı dostu QR kod oluşturma uygulaması.

## 🚀 Özellikler

- **Çoklu Format Desteği**
  - Metin
  - URL/Website
  - WiFi Bilgileri
  - Telefon Numarası
  - E-posta
  - SMS

- **Güvenlik Öncelikli**
  - Tüm işlemler tarayıcıda yerel olarak yapılır
  - Veriler sunucuya gönderilmez
  - HTTPS şifreleme

- **Modern Tasarım**
  - Responsive mobil uyumlu arayüz
  - Dark/Light theme desteği
  - Smooth animasyonlar
  - Accessibility uyumlu

- **Kullanım Kolaylığı**
  - Anında QR kod üretimi
  - PNG formatında indirme
  - Panoya kopyalama
  - Klavye kısayolları

## 🛠️ Teknolojiler

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **QR Üretimi**: QRCode.js kütüphanesi
- **Stil**: CSS Grid, Flexbox, CSS Custom Properties
- **Analytics**: Google Analytics 4
- **Monetizasyon**: Google AdSense

## 📁 Proje Yapısı

```
QR-CODE-GENARATOR/
├── index.html              # Ana sayfa
├── styles.css              # CSS stilleri
├── script.js               # JavaScript fonksiyonalitesi
├── favicon.svg             # Site ikonu
├── robots.txt              # SEO robot yönergeleri
├── sitemap.xml            # Site haritası
├── gizlilik-politikasi.html # Gizlilik politikası
├── kullanim-kosullari.html  # Kullanım koşulları
└── README.md              # Proje dokümantasyonu
```

## 🚀 Kurulum

1. **Yerel Geliştirme**:
   ```bash
   # Projeyi klonla
   git clone <repo-url>
   cd QR-CODE-GENARATOR
   
   # Yerel sunucu başlat (Python ile)
   python -m http.server 8000
   
   # Veya Node.js ile
   npx serve .
   ```

2. **Vercel Deployment**:
   - GitHub'a push yap
   - Vercel'de projeyi bağla
   - Otomatik deployment

## 🎯 Kullanım

1. QR kod tipini seçin (metin, URL, WiFi, vb.)
2. İlgili bilgileri girin
3. "QR Kod Oluştur" butonuna tıklayın
4. Oluşan QR kodu indirin veya kopyalayın

## ⌨️ Klavye Kısayolları

- `Ctrl/Cmd + Enter`: QR kod oluştur
- `Ctrl/Cmd + D`: QR kodu indir
- `Ctrl/Cmd + C`: QR kodu kopyala (QR görünürken)
- `Escape`: Yeni QR kod (reset)

## 📊 Analytics ve Tracking

- Google Analytics 4 entegrasyonu
- QR kod üretimi tracking'i
- Performans metrikleri
- Kullanıcı davranış analizi

## 🔒 Gizlilik ve Güvenlik

- **İstemci Tarafı İşleme**: Tüm QR kodlar tarayıcınızda oluşturulur
- **Veri Saklama Yok**: Hiçbir QR kod içeriği sunucuda saklanmaz
- **HTTPS**: Güvenli bağlantı protokolü
- **Anonimleştirilmiş Analytics**: Kişisel veri toplanmaz

## 🎨 Tasarım Sistemi

### Renk Paleti
```css
--primary-color: #4F46E5    /* Ana mavi */
--secondary-color: #06B6D4   /* Türkiye mavisi */
--accent-color: #F59E0B      /* Altın sarı */
--success-color: #10B981     /* Yeşil */
--error-color: #EF4444       /* Kırmızı */
```

### Tipografi
- Font: Inter (Google Fonts)
- Başlık: 700-800 weight
- Gövde: 400-500 weight
- Küçük metin: 300 weight

## 📱 Browser Desteği

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers

## 🔧 Konfigürasyon

### Google Analytics
```javascript
gtag('config', 'G-XXXXXXXXXX', {
    page_title: 'QR Kod Üretici',
    page_location: window.location.href
});
```

### AdSense
```javascript
(adsbygoogle = window.adsbygoogle || []).push({
    google_ad_client: "pub-XXXXXXXXXX",
    enable_page_level_ads: true
});
```

## 🚀 Performans Optimizasyonu

- **CSS**: Minification, kritik CSS inline
- **JavaScript**: Code splitting, lazy loading
- **Images**: WebP format, responsive images
- **Fonts**: Font-display: swap, preload
- **CDN**: Font Awesome ve QRCode.js için CDN

## 📈 SEO Optimizasyonu

- Semantic HTML5 yapısı
- Meta tags optimizasyonu
- Open Graph protokolü
- JSON-LD structured data
- Sitemap.xml
- Robots.txt

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- Website: [qr-kod-uretici.vercel.app](https://qr-kod-uretici.vercel.app)
- E-posta: destek@qr-kod-uretici.com

## 🙏 Teşekkürler

- [QRCode.js](https://github.com/davidshimjs/qrcodejs) - QR kod üretimi
- [Font Awesome](https://fontawesome.com/) - İkonlar
- [Google Fonts](https://fonts.google.com/) - Tipografi
- [Inter Font](https://rsms.me/inter/) - Modern font ailesi