import urllib.request
import json

import os

token = os.getenv('GITHUB_TOKEN')  # Token should be supplied via environment variable
data = json.dumps({
    'name': 'IPL-Analytics-Platform',
    'description': 'Full-Stack IPL Cricket Analytics Web Platform (2008-2026) with Python FastAPI backend and React frontend.',
    'private': False,
    'has_issues': True,
    'has_projects': True,
    'has_wiki': True
}).encode('utf-8')

req = urllib.request.Request(
    'https://api.github.com/user/repos',
    data=data,
    headers={
        'Authorization': f'token {token}',
        'Content-Type': 'application/json',
        'User-Agent': 'IPL-Analytics-App'
    }
)

try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode())
        print("Successfully created repo:", res['html_url'])
        print("Clone URL:", res['clone_url'])
except urllib.error.HTTPError as e:
    err_body = e.read().decode()
    print(f"HTTPError {e.code}: {err_body}")
except Exception as e:
    print("Error:", e)
