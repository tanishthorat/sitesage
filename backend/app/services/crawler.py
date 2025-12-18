import requests
from bs4 import BeautifulSoup
import time

def crawl_website(url: str):
    try:
        start_time = time.time()
        # Mocking a real browser user agent to avoid being blocked
        headers = {'User-Agent': 'Mozilla/5.0 (compatible; SiteSage/1.0)'}
        response = requests.get(url, headers=headers, timeout=10)
        load_time = round(time.time() - start_time, 2)

        if response.status_code != 200:
            return None

        soup = BeautifulSoup(response.content, 'html.parser')

        # 1. Extract Title
        title = soup.title.string.strip() if soup.title else "No Title Found"

        # 2. Extract Meta Description
        meta = soup.find("meta", attrs={"name": "description"})
        meta_description = meta["content"].strip() if meta else None

        # 3. Headings
        h1_count = len(soup.find_all('h1'))
        h2_count = len(soup.find_all('h2'))

        # 4. Images & Alt Tags
        images = soup.find_all('img')
        image_count = len(images)
        missing_alt_count = sum(1 for img in images if not img.get('alt'))

        # 5. Basic Scoring Logic (Simple Algorithm)
        score = 100
        if not title: score -= 10
        if not meta_description: score -= 20
        if h1_count == 0: score -= 15
        if missing_alt_count > 0: score -= (missing_alt_count * 2)
        score = max(0, score) # Ensure score doesn't go below 0

        return {
            "url": url,
            "title": title,
            "meta_description": meta_description,
            "h1_count": h1_count,
            "h2_count": h2_count,
            "image_count": image_count,
            "missing_alt_count": missing_alt_count,
            "load_time": load_time,
            "seo_score": score
        }

    except Exception as e:
        print(f"Error crawling {url}: {e}")
        return None
