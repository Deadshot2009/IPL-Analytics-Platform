import urllib.request
import json

import os

token = os.getenv('GITHUB_TOKEN')  # Token from env
req = urllib.request.Request('https://api.github.com/user/repos?per_page=100', headers={
    'Authorization': f'token {token}',
    'User-Agent': 'IPL-Analytics-App'
})
try:
    with urllib.request.urlopen(req) as resp:
        repos = json.loads(resp.read().decode())
        print(f"Total repos: {len(repos)}")
        for r in repos:
            print(f"- {r['name']} ({r['html_url']}) [private={r['private']}]")
except Exception as e:
    print("Error:", e)
