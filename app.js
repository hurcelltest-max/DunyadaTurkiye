const mockData = [
  {
    countryCode: 'US',
    flagUrl: 'https://flagcdn.com/w40/us.png',
    source: 'The New York Times',
    title: 'Türkiye ve ABD Arasında Yeni Ticaret Anlaşması Görüşmeleri Başladı',
    summary: 'İki ülke heyetleri, savunma sanayii ve enerji alanlarında ticari hacmi artırmak için başkentte bir araya geldi.',
    timeAgo: '2 saat önce',
    link: '#'
  },
  {
    countryCode: 'US',
    flagUrl: 'https://flagcdn.com/w40/us.png',
    source: 'The Wall Street Journal',
    title: 'Türk Lirası Merkez Bankası Kararı Sonrası Yükselişe Geçti',
    summary: 'Faiz oranlarının beklentilerin üzerinde artırılmasıyla birlikte TL, dolar karşısında son bir ayın en yüksek seviyesini gördü.',
    timeAgo: '5 saat önce',
    link: '#'
  },
  {
    countryCode: 'DE',
    flagUrl: 'https://flagcdn.com/w40/de.png',
    source: 'Süddeutsche Zeitung',
    title: 'Almanya ve Türkiye Göçmen Anlaşmasını Güncelliyor',
    summary: 'Berlin ve Ankara, vasıflı işçi göçünü kolaylaştıracak yeni bir vize düzenlemesi üzerinde prensipte anlaştı.',
    timeAgo: '1 saat önce',
    link: '#'
  },
  {
    countryCode: 'UK',
    flagUrl: 'https://flagcdn.com/w40/gb.png',
    source: 'The Guardian',
    title: 'İstanbul Küresel İklim Zirvesine Ev Sahipliği Yapmaya Hazırlanıyor',
    summary: 'Dünyanın dört bir yanından liderler, Akdeniz havzasındaki su krizini tartışmak için İstanbul\'da buluşacak.',
    timeAgo: '3 saat önce',
    link: '#'
  },
  {
    countryCode: 'ES',
    flagUrl: 'https://flagcdn.com/w40/es.png',
    source: 'El País',
    title: 'Türk Turizmi İspanyol Rakiplerine Karşı Güçleniyor',
    summary: 'Avrupalı turistlerin bu yazki tercihlerinde Türkiye, rekabetçi fiyatlarıyla İspanya\'nın en büyük rakibi oldu.',
    timeAgo: '6 saat önce',
    link: '#'
  },
  {
    countryCode: 'CN',
    flagUrl: 'https://flagcdn.com/w40/cn.png',
    source: 'Global Times',
    title: 'Çinli Teknoloji Devinden Türkiye\'ye Milyar Dolarlık Yatırım',
    summary: 'Batarya üretim tesisi kurmak için Türkiye ile el sıkışan şirket, Avrupa pazarına buradan açılmayı hedefliyor.',
    timeAgo: '1 gün önce',
    link: '#'
  },
  {
    countryCode: 'JP',
    flagUrl: 'https://flagcdn.com/w40/jp.png',
    source: 'The Nikkei',
    title: 'Japon Şirketleri Marmara Depremi Hazırlıkları İçin Uzman Gönderiyor',
    summary: 'Japonya merkezli afet teknolojileri firmaları, İstanbul altyapısını güçlendirmek için Türk şirketlerle ortaklık kuruyor.',
    timeAgo: '12 saat önce',
    link: '#'
  }
];

const countries = [
  { code: 'ALL', name: 'Tümü', isEmoji: true, flagVal: '🌍' },
  { code: 'US', name: 'ABD', isEmoji: false, flagVal: 'https://flagcdn.com/w40/us.png' },
  { code: 'DE', name: 'Almanya', isEmoji: false, flagVal: 'https://flagcdn.com/w40/de.png' },
  { code: 'UK', name: 'İngiltere', isEmoji: false, flagVal: 'https://flagcdn.com/w40/gb.png' },
  { code: 'ES', name: 'İspanya', isEmoji: false, flagVal: 'https://flagcdn.com/w40/es.png' },
  { code: 'CN', name: 'Çin', isEmoji: false, flagVal: 'https://flagcdn.com/w40/cn.png' },
  { code: 'JP', name: 'Japonya', isEmoji: false, flagVal: 'https://flagcdn.com/w40/jp.png' }
];

let activeTab = 'ALL';
let allNewsData = [];

// Gerçek veriyi json dosyasından okuyan fonksiyon
async function loadNewsData() {
  try {
    // Google Translate IP ban engelini aşamadığımız için sabit manuel dosyaya geri döndük
    const response = await fetch('./news_data.json');
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return data; // Python'un oluşturduğu taze haberleri döndür
      }
    }
  } catch (error) {
    console.log("Gerçek veri bulunamadı, test verileriyle (mock) açılıyor.");
  }
  return mockData; // Eğer dosya bulunamazsa sahte verilerle göster
}

function renderTabs() {

  const tabsContainer = document.getElementById('tabs-container');
  tabsContainer.innerHTML = '';
  
  countries.forEach(country => {
    const btn = document.createElement('button');
    btn.className = `tab-btn ${activeTab === country.code ? 'active' : ''}`;
    
    // Windows cihazlarında emojiler bazen harf ('US', 'UK') gibi gözüktüğü için
    // Gerçek resim olan gerçek bayraklar (FlagCDN) kullandık.
    const flagHtml = country.isEmoji 
      ? `<span style="font-size:1.1rem;">${country.flagVal}</span>` 
      : `<img src="${country.flagVal}" alt="${country.name} bayrağı" style="width: 22px; height: auto; border-radius: 2px;">`;
      
    btn.innerHTML = `${flagHtml} ${country.name}`;
    btn.onclick = () => {
      activeTab = country.code;
      renderTabs();
      renderNews();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    tabsContainer.appendChild(btn);
  });
}

function renderNews() {
  const container = document.getElementById('news-container');
  container.innerHTML = '';
  
  const filteredNews = activeTab === 'ALL' 
    ? allNewsData 
    : allNewsData.filter(item => item.countryCode === activeTab);
    
  if(filteredNews.length === 0) {
    container.innerHTML = '<p style="text-align:center; color: var(--text-muted); margin-top:2rem;">Bu ülke için son haberlerde Türkiye bahsi geçmiyor veya henüz gerçek veri çekilmedi.</p>';
    return;
  }

  filteredNews.forEach(news => {
    const card = document.createElement('article');
    card.className = 'news-card';
    card.innerHTML = `
      <div class="news-meta">
        <div class="source-info">
          <img src="${news.flagUrl}" alt="Bayrak" style="width: 20px; border-radius: 2px; box-shadow: 0 0 2px rgba(0,0,0,0.5);">
          <span>${news.source}</span>
        </div>
        <span class="time-ago">${news.timeAgo}</span>
      </div>
      <h2 class="news-title">${news.title}</h2>
      <p class="news-summary">${news.summary}</p>
      <a href="${news.link}" class="read-more" target="_blank">Kaynağa Git →</a>
    `;
    container.appendChild(card);
  });
}

async function fetchCurrency() {
  const bar = document.getElementById('currency-bar');
  try {
    // Python botunun arka planda çektiği statik JSON dosyasını okuyoruz
    const response = await fetch('./currency_data.json');
    if (!response.ok) throw new Error('Döviz dosyası bulunamadı');
    
    const data = await response.json();
    
        const parseCurrency = (val) => parseFloat(val.replace(/\./g, '').replace(',', '.'));
    
    const usd = parseCurrency(data['USD']['Alış']).toFixed(2);
    const eur = parseCurrency(data['EUR']['Alış']).toFixed(2);
    const gbp = parseCurrency(data['GBP']['Alış']).toFixed(2);
    const gold = parseCurrency(data['gram-altin']['Alış']).toFixed(1);
    bar.innerHTML = `
      <span>💵 USD: <strong>${usd}</strong></span>
      <span>💶 EUR: <strong>${eur}</strong></span>
      <span>💷 GBP: <strong>${gbp}</strong></span>
      <span>🪙 Altın: <strong>${gold}</strong></span>
    `;
  } catch (error) {
    bar.innerHTML = '<span>Döviz verisi alınamadı.</span>';
    console.error("Döviz çekilirken hata:", error);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  renderTabs();
  
  // Önce haber konteynerine "Yükleniyor" yazalım
  const container = document.getElementById('news-container');
  container.innerHTML = '<p style="text-align:center; color: #fff; padding: 2rem;">Haberler yükleniyor...</p>';
  
  fetchCurrency(); // Döviz kurlarını çek
  
  allNewsData = await loadNewsData();
  renderNews();
});
