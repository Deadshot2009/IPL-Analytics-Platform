import sqlite3

conn = sqlite3.connect(r'C:\Users\asjee\.gemini\antigravity\scratch\ipl-analytics\ipl_analytics.db')
cur = conn.cursor()

# Find the final match for each season (usually the latest match or event_stage='Final')
cur.execute('''
    SELECT season, date, match_id, team1, team2, winner, win_type, win_margin, event_stage
    FROM matches
    WHERE LOWER(COALESCE(event_stage, '')) LIKE '%final%'
       OR LOWER(COALESCE(match_number, '')) LIKE '%final%'
    ORDER BY season, date
''')
finals = cur.fetchall()
print("Finals by event_stage:")
found_seasons = set()
for f in finals:
    found_seasons.add(f[0])
    print(f[0], "| Date:", f[1], "|", f[3], "vs", f[4], "-> Winner:", f[5], f[6], f[7], "| Stage:", f[8])

# For seasons without explicit 'Final' stage, check the last match of that season
cur.execute('SELECT DISTINCT season FROM matches ORDER BY season')
all_seasons = [r[0] for r in cur.fetchall()]
missing = [s for s in all_seasons if s not in found_seasons]
if missing:
    print("\nChecking latest match for seasons without 'Final' tag:", missing)
    for s in missing:
        cur.execute('''
            SELECT season, date, match_id, match_number, team1, team2, winner, win_type, win_margin, event_stage
            FROM matches
            WHERE season = ?
            ORDER BY date DESC, match_id DESC
            LIMIT 1
        ''', (s,))
        last_m = cur.fetchone()
        print(s, "| Date:", last_m[1], "| Match#:", last_m[3], "|", last_m[4], "vs", last_m[5], "-> Winner:", last_m[6])
