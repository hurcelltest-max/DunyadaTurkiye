import feedparser
import json
import re
import os
from deep_translator import GoogleTranslator

# Taranacak Haber Kaynakları (Seçtiğiniz Ülkelerden ve Gazetelerden RSS'i aktif olanlar)
SOURCES = [
    # ABD
    {"country": "US", "source": "The New York Times", "url": "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", "lang": "en"},
    {"country": "US", "source": "Wall Street Journal", "url": "https://feeds.a.dj.com/rss/RSSWorldNews.xml", "lang": "en"},
    # ALMANYA
    {"country": "DE", "source": "Süddeutsche Zeitung", "url": "https://rss.sueddeutsche.de/rss/Politik", "lang": "de"},
    {"country": "DE", "source": "FAZ", "url": "https://www.faz.net/rss/aktuell/politik/", "lang": "de"},
    # İNGİLTERE
    {"country": "UK", "source": "The Guardian", "url": "https://www.theguardian.com/world/rss", "lang": "en"},
    {"country": "UK", "source": "The Daily Telegraph", "url": "https://www.telegraph.co.uk/world-news/rss.xml", "lang": "en"},
    # İSPANYA
    {"country": "ES", "source": "El País", "url": "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/internacional/portada", "lang": "es"},
    {"country": "ES", "source": "El Mundo", "url": "https://e00-elmundo.uecdn.es/elmundo/rss/internacional.xml", "lang": "es"},
    # ÇİN 
    {"country": "CN", "source": "South China Morning Post", "url": "https://www.scmp.com/rss/2/feed", "lang": "en"}, 
    # JAPONYA
    {"country": "JP", "source": "The Japan Times", "url": "https://www.japantimes.co.jp/feed/", "lang": "en"}
]

# Dillerine Göre Arama Terimleri
KEYWORDS = {
    "en": ["turkey", "turkiye", "erdogan", "istanbul", "ankara", "turkish", "middle east", "iran", "israel", "war", "trump", "oil", "barrel"],
    "de": ["türkei", "erdogan", "istanbul", "ankara", "türkisch", "nahost", "iran", "israel", "krieg", "trump", "öl"],
    "es": ["turquía", "turquia", "erdogan", "estambul", "turco", "turca", "oriente medio", "irán", "israel", "guerra", "trump", "petróleo"]
}

# Tasarımdaki Bayrak Linkleri
FLAGS = {
    "US": "https://flagcdn.com/w40/us.png",
    "DE": "https://flagcdn.com/w40/de.png",
    "UK": "https://flagcdn.com/w40/gb.png",
    "ES": "https://flagcdn.com/w40/es.png",
    "CN": "https://flagcdn.com/w40/cn.png",
    "JP": "https://flagcdn.com/w40/jp.png"
}

def translate_to_tr(text):
    """Metni otomatik algılayıp Türkçe'ye çevirir"""
    if not text: return ""
    try:
        translator = GoogleTranslator(source='auto', target='tr')
        return translator.translate(text)
    except Exception as e:
        print(f"Ceviri hatasi: {e}")
        return text

def is_relevant(text, lang):
    """Metinde o dile ait Türkiye anahtar kelimeleri geçiyor mu?"""
    if not text: return False
    text_lower = text.lower()
    keys = KEYWORDS.get(lang, KEYWORDS["en"])
    for k in keys:
        if k in text_lower:
            return True
    return False

def fetch_and_process():
    print("DisBasindaTurkiye - Otomatik Haber Toplama ve Ceviri Motoru Basladi...")
    print("---------------------------------------------------------------")
    all_news = []
    
    for source in SOURCES:
        print(f"-> Taraniyor: {source['source']} ({source['country']})")
        try:
            feed = feedparser.parse(source['url'])
            # Sadece en güncel son 25 habere bak
            for entry in feed.entries[:25]: 
                title = entry.get('title', '')
                summary = entry.get('summary', '')
                
                if is_relevant(title, source['lang']) or is_relevant(summary, source['lang']):
                    # Print without turkish chars to avoid windows encoding errors
                    safe_title = title.encode('ascii', 'ignore').decode('ascii')
                    print(f"   [+] Yeni Haber Yakalandi: {safe_title[:60]}...")
                    
                    # Çeviri İşlemi
                    tr_title = translate_to_tr(title)
                    
                    # Özetteki HTML etiketlerini (<p> vs.) temizle
                    clean_summary = re.sub(r'<[^>]*>', '', summary)
                    tr_summary = translate_to_tr(clean_summary[:400]) # Çok uzun olmasını engellemek için
                    
                    if len(tr_summary) > 200:
                        tr_summary = tr_summary[:200] + "..."
                        
                    all_news.append({
                        "countryCode": source['country'],
                        "flagUrl": FLAGS[source['country']],
                        "source": source['source'],
                        "title": tr_title,
                        "summary": tr_summary,
                        "timeAgo": "En Guncel (API)",
                        "link": entry.link
                    })
        except Exception as e:
            print(f"   [!] Hata ({source['source']}): {e}")
            
    print("---------------------------------------------------------------")
    print(f"Toplam {len(all_news)} adet Turkiye haberi bulundu ve Turkceye cevrildi!")
    
    # Veriyi Uygulamanın Okuyacağı Şekilde Kaydet
    output_path = os.path.join(os.path.dirname(__file__), 'news_data.json')
    
    # 1. Eski Haberleri Silinmemesi İçin Hafızdan Oku
    existing_news = []
    if os.path.exists(output_path):
        try:
            with open(output_path, 'r', encoding='utf-8') as f:
                existing_news = json.load(f)
        except:
            pass

    # 2. Kopya Haberleri Engelle (Linkleri Kontrol Et)
    existing_links = {item['link'] for item in existing_news}
    new_unique_news = []
    for news in all_news:
        if news['link'] not in existing_links:
            new_unique_news.append(news)
            
    # 3. Yepyeni Haberleri En Başa Ekle ve Sadece En Güncel 100 Adedini Sakla
    final_news = new_unique_news + existing_news
    final_news = final_news[:100]

    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(final_news, f, ensure_ascii=False, indent=2)
        print(f"Sistem Guncellendi! Yepyeni {len(new_unique_news)} haber eklendi. Toplam {len(final_news)} haber havuzda tutuluyor.")
    except Exception as e:
        print(f"Dosya kaydetme hatasi: {e}")

if __name__ == "__main__":
    fetch_and_process()
