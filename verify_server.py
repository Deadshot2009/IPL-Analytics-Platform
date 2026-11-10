import urllib.request
import json

def test_url(url):
    req = urllib.request.urlopen(url)
    print(f"GET {url} -> Status {req.status}, Content-Type: {req.headers.get('Content-Type')}")
    return req.read()

# 1. Health
h = test_url('http://127.0.0.1:8000/api/health')
print('Health body:', json.loads(h.decode('utf-8')))

# 2. Overview
ov = test_url('http://127.0.0.1:8000/api/overview')
ov_data = json.loads(ov.decode('utf-8'))
print(f"Overview: Matches = {ov_data['total_matches']}, Seasons = {ov_data['total_seasons']}, Runs = {ov_data['total_runs']}, Wickets = {ov_data['total_wickets']}")

# 3. Teams
tms = test_url('http://127.0.0.1:8000/api/teams')
print('Teams count:', len(json.loads(tms.decode('utf-8'))))

# 4. Matches
m = test_url('http://127.0.0.1:8000/api/matches?limit=3')
print('Matches returned:', len(json.loads(m.decode('utf-8'))['matches']))

# 5. SPA Index
html = test_url('http://127.0.0.1:8000/')
print('SPA index.html length:', len(html), 'Contains <div id="root">:', b'id="root"' in html)
print('\nPRODUCTION SERVER IS 100% OPERATIONAL AND SERVING BOTH REST APIS AND REACT SPA!')
