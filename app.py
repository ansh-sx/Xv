from flask import Flask, request, jsonify
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

def scrape_text_content(url):
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an error for bad responses
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract text from the website, excluding script and style
        for script_or_style in soup(['script', 'style']):
            script_or_style.decompose()  # Remove these elements

        # Get all text and split into sentences
        text = soup.get_text(separator='\n').strip()
        return text if text else "No data for this website."
    except Exception as e:
        return "No data for this website."

@app.route('/scrape', methods=['POST'])
def scrape():
    data = request.get_json()
    urls = data.get('urls', '').split(',')
    results = {}

    for url in urls:
        url = url.strip()  # Remove extra whitespace
        if url:
            content = scrape_text_content(url)
            results[url] = content

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)
