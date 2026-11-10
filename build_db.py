import os
import sqlite3
import pandas as pd
import time

base = r'C:\Users\asjee\.gemini\antigravity\scratch\ipl-analytics'
stage2_base = os.path.join(base, 'ipl_antigravity_bundle', 'data', 'IPL_Stage2_Integrated_Data', 'base')
stage2_analytics = os.path.join(stage2_base, 'analytics')
stage4_tables = os.path.join(base, 'ipl_antigravity_bundle', 'data', 'IPL_Stage4_Insights_and_Visualizations', 'IPL_Stage4_Advanced_Insights', 'tables')

db_path = os.path.join(base, 'ipl_analytics.db')
if os.path.exists(db_path):
    try:
        os.remove(db_path)
    except Exception as e:
        print('Could not remove existing db:', e)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Enable WAL mode for high performance
cur.execute('PRAGMA journal_mode = WAL;')
cur.execute('PRAGMA synchronous = NORMAL;')

t0 = time.time()
print('Starting SQLite DB compilation...')

# 1. Matches
print('Loading matches...')
matches_df = pd.read_csv(os.path.join(stage2_base, 'matches.csv'), low_memory=False)
matches_df.to_sql('matches', conn, if_exists='replace', index=False)
cur.execute('CREATE INDEX idx_matches_id ON matches(match_id);')
cur.execute('CREATE INDEX idx_matches_season ON matches(season);')
cur.execute('CREATE INDEX idx_matches_team1 ON matches(team1);')
cur.execute('CREATE INDEX idx_matches_team2 ON matches(team2);')
cur.execute('CREATE INDEX idx_matches_venue ON matches(venue);')

# 2. Batter Scorecards
print('Loading batter scorecards...')
bat_df = pd.read_csv(os.path.join(stage2_base, 'batter_scorecard.csv'), low_memory=False)
bat_df.to_sql('batter_scorecards', conn, if_exists='replace', index=False)
cur.execute('CREATE INDEX idx_bat_match ON batter_scorecards(match_id);')
cur.execute('CREATE INDEX idx_bat_batter ON batter_scorecards(batter);')
cur.execute('CREATE INDEX idx_bat_season ON batter_scorecards(season);')

# 3. Bowler Scorecards
print('Loading bowler scorecards...')
bowl_df = pd.read_csv(os.path.join(stage2_base, 'bowler_scorecard.csv'), low_memory=False)
bowl_df.to_sql('bowler_scorecards', conn, if_exists='replace', index=False)
cur.execute('CREATE INDEX idx_bowl_match ON bowler_scorecards(match_id);')
cur.execute('CREATE INDEX idx_bowl_bowler ON bowler_scorecards(bowler);')
cur.execute('CREATE INDEX idx_bowl_season ON bowler_scorecards(season);')

# 4. Deliveries
print('Loading deliveries (295k rows)...')
deliv_df = pd.read_csv(os.path.join(stage2_base, 'deliveries.csv'), low_memory=False)
deliv_df.to_sql('deliveries', conn, if_exists='replace', index=False)
cur.execute('CREATE INDEX idx_deliv_match ON deliveries(match_id);')
cur.execute('CREATE INDEX idx_deliv_batter ON deliveries(batter);')
cur.execute('CREATE INDEX idx_deliv_bowler ON deliveries(bowler);')
cur.execute('CREATE INDEX idx_deliv_season ON deliveries(season);')

# 5. Squads & People
print('Loading squads & people...')
squads_df = pd.read_csv(os.path.join(stage2_base, 'squads.csv'), low_memory=False)
squads_df.to_sql('squads', conn, if_exists='replace', index=False)

if os.path.exists(os.path.join(stage2_base, 'ipl_2026_schedule.csv')):
    sched_df = pd.read_csv(os.path.join(stage2_base, 'ipl_2026_schedule.csv'), low_memory=False)
    sched_df.to_sql('ipl_2026_schedule', conn, if_exists='replace', index=False)

# 6. Analytics tables
print('Loading analytics aggregate tables...')
for fname, tbl in [
    ('batting_features_player_season.csv', 'batting_player_season'),
    ('bowling_features_player_season.csv', 'bowling_player_season'),
    ('match_innings_features.csv', 'match_innings'),
    ('match_phase_features.csv', 'match_phase'),
    ('team_match_features.csv', 'team_match'),
    ('team_season_features.csv', 'team_season'),
]:
    p = os.path.join(stage2_analytics, fname)
    if os.path.exists(p):
        df = pd.read_csv(p, low_memory=False)
        df.to_sql(tbl, conn, if_exists='replace', index=False)

# 7. Stage 4 insights tables
print('Loading Stage 4 insights tables...')
for fname, tbl in [
    ('player_batting_leaderboard.csv', 's4_batting_leaderboard'),
    ('player_bowling_leaderboard.csv', 's4_bowling_leaderboard'),
    ('team_overall_performance.csv', 's4_team_overall'),
    ('team_season_performance.csv', 's4_team_season'),
    ('venue_scoring_insights.csv', 's4_venue_insights'),
    ('season_trends.csv', 's4_season_trends'),
    ('phase_performance.csv', 's4_phase_performance'),
    ('batter_consistency.csv', 's4_batter_consistency'),
    ('bowler_consistency.csv', 's4_bowler_consistency'),
    ('team_batting_first_vs_chasing.csv', 's4_team_chase_defend'),
    ('first_innings_score_vs_chase_success.csv', 's4_score_vs_chase'),
    ('chase_vs_defend_summary.csv', 's4_chase_defend_summary')
]:
    p = os.path.join(stage4_tables, fname)
    if os.path.exists(p):
        df = pd.read_csv(p, low_memory=False)
        df.to_sql(tbl, conn, if_exists='replace', index=False)

conn.commit()
conn.close()

elapsed = time.time() - t0
db_size = os.path.getsize(db_path) / (1024 * 1024)
print(f'Database built in {elapsed:.2f} seconds! Size: {db_size:.2f} MB')
