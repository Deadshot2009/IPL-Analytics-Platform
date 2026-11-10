import os
import sqlite3
import math
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'ipl_analytics.db')
DIST_PATH = os.path.join(BASE_DIR, 'frontend', 'dist')

app = FastAPI(title="IPL Analytics Platform API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Verified Championship titles lookup from historical match data
TITLES_WON = {
    "Mumbai Indians": 5,
    "Chennai Super Kings": 5,
    "Kolkata Knight Riders": 3,
    "Royal Challengers Bengaluru": 2, # Won 2025 and 2026 Finals
    "Rajasthan Royals": 1,
    "Sunrisers Hyderabad": 1,
    "Gujarat Titans": 1,
    "Deccan Chargers": 1
}

@app.get("/api/health")
def health_check():
    return {"status": "ok", "database": os.path.exists(DB_PATH)}

@app.get("/api/overview")
def get_overview(
    season: Optional[str] = None,
    team: Optional[str] = None,
    venue: Optional[str] = None
):
    conn = get_db()
    cur = conn.cursor()

    match_where = []
    match_params = []
    if season and season != "all":
        match_where.append("season = ?")
        match_params.append(season)
    if team and team != "all":
        match_where.append("(team1 = ? OR team2 = ?)")
        match_params.extend([team, team])
    if venue and venue != "all":
        match_where.append("venue = ?")
        match_params.append(venue)

    match_clause = ("WHERE " + " AND ".join(match_where)) if match_where else ""

    cur.execute(f"SELECT COUNT(*) FROM matches {match_clause}", match_params)
    total_matches = cur.fetchone()[0]

    cur.execute(f"SELECT COUNT(DISTINCT season) FROM matches {match_clause}", match_params)
    total_seasons = cur.fetchone()[0]

    cur.execute(f"""
        SELECT COUNT(DISTINCT team) FROM (
            SELECT team1 AS team FROM matches {match_clause}
            UNION
            SELECT team2 AS team FROM matches {match_clause}
        )
    """, match_params * 2 if match_clause else [])
    total_teams = cur.fetchone()[0]

    if match_clause:
        cur.execute(f"SELECT match_id FROM matches {match_clause}", match_params)
        mids = [r[0] for r in cur.fetchall()]
        if not mids:
            conn.close()
            return {
                "total_matches": 0, "total_seasons": 0, "total_teams": 0,
                "total_players": 0, "total_runs": 0, "total_wickets": 0,
                "season_runs": [], "team_wins": [], "top_batters": [],
                "top_bowlers": [], "toss_distribution": [], "bat_first_vs_chasing": [],
                "season_avg_scoring": [], "highest_totals": [],
                "filters": {"seasons": [], "teams": [], "venues": []}
            }
        
        placeholders = ",".join("?" for _ in mids)
        cur.execute(f"SELECT SUM(total_runs) FROM deliveries WHERE match_id IN ({placeholders})", mids)
        total_runs = cur.fetchone()[0] or 0

        cur.execute(f"SELECT COUNT(*) FROM deliveries WHERE match_id IN ({placeholders}) AND is_wicket = 1 AND dismissal_kind != 'run out'", mids)
        total_wickets = cur.fetchone()[0] or 0

        cur.execute(f"""
            SELECT COUNT(DISTINCT player) FROM (
                SELECT batter AS player FROM deliveries WHERE match_id IN ({placeholders})
                UNION
                SELECT bowler AS player FROM deliveries WHERE match_id IN ({placeholders})
            )
        """, mids + mids)
        total_players = cur.fetchone()[0] or 0

        cur.execute(f"""
            SELECT batter, SUM(total_runs) AS runs, COUNT(DISTINCT match_id) AS matches
            FROM deliveries
            WHERE match_id IN ({placeholders})
            GROUP BY batter
            ORDER BY runs DESC
            LIMIT 10
        """, mids)
        top_batters = [{"player": r[0], "runs": r[1], "matches": r[2]} for r in cur.fetchall()]

        cur.execute(f"""
            SELECT bowler, COUNT(*) AS wickets, COUNT(DISTINCT match_id) AS matches
            FROM deliveries
            WHERE match_id IN ({placeholders}) AND is_wicket = 1 AND dismissal_kind != 'run out'
            GROUP BY bowler
            ORDER BY wickets DESC
            LIMIT 10
        """, mids)
        top_bowlers = [{"player": r[0], "wickets": r[1], "matches": r[2]} for r in cur.fetchall()]

    else:
        cur.execute("SELECT SUM(total_runs) FROM deliveries")
        total_runs = cur.fetchone()[0] or 0

        cur.execute("SELECT COUNT(*) FROM deliveries WHERE is_wicket = 1 AND dismissal_kind != 'run out'")
        total_wickets = cur.fetchone()[0] or 0

        cur.execute("""
            SELECT COUNT(DISTINCT player) FROM (
                SELECT batter AS player FROM deliveries
                UNION
                SELECT bowler AS player FROM deliveries
            )
        """)
        total_players = cur.fetchone()[0] or 0

        cur.execute("""
            SELECT batter, SUM(total_runs) AS runs, COUNT(DISTINCT match_id) AS matches
            FROM deliveries
            GROUP BY batter
            ORDER BY runs DESC
            LIMIT 10
        """)
        top_batters = [{"player": r[0], "runs": r[1], "matches": r[2]} for r in cur.fetchall()]

        cur.execute("""
            SELECT bowler, COUNT(*) AS wickets, COUNT(DISTINCT match_id) AS matches
            FROM deliveries
            WHERE is_wicket = 1 AND dismissal_kind != 'run out'
            GROUP BY bowler
            ORDER BY wickets DESC
            LIMIT 10
        """)
        top_bowlers = [{"player": r[0], "wickets": r[1], "matches": r[2]} for r in cur.fetchall()]

    cur.execute(f"""
        SELECT season, SUM(innings_1_runs + COALESCE(innings_2_runs, 0)) AS total_runs,
               COUNT(*) AS matches
        FROM matches
        {match_clause}
        GROUP BY season
        ORDER BY season
    """, match_params)
    season_runs = [{"season": r[0], "runs": r[1] or 0, "matches": r[2]} for r in cur.fetchall()]

    cur.execute(f"""
        SELECT winner, COUNT(*) AS wins
        FROM matches
        {match_clause}
        {"AND" if match_clause else "WHERE"} winner IS NOT NULL AND winner != ''
        GROUP BY winner
        ORDER BY wins DESC
        LIMIT 12
    """, match_params)
    team_wins = [{"team": r[0], "wins": r[1]} for r in cur.fetchall()]

    cur.execute(f"""
        SELECT toss_decision, COUNT(*) AS count
        FROM matches
        {match_clause}
        {"AND" if match_clause else "WHERE"} toss_decision IS NOT NULL
        GROUP BY toss_decision
    """, match_params)
    toss_dist = [{"decision": r[0], "count": r[1]} for r in cur.fetchall()]

    cur.execute(f"""
        SELECT 
            SUM(CASE WHEN win_type = 'runs' THEN 1 ELSE 0 END) AS bat_first_wins,
            SUM(CASE WHEN win_type = 'wickets' THEN 1 ELSE 0 END) AS chase_wins,
            SUM(CASE WHEN win_type NOT IN ('runs', 'wickets') OR win_type IS NULL THEN 1 ELSE 0 END) AS others
        FROM matches
        {match_clause}
    """, match_params)
    bw = cur.fetchone()
    bat_first_vs_chase = [
        {"type": "Batting First", "wins": bw[0] or 0},
        {"type": "Chasing", "wins": bw[1] or 0},
        {"type": "Tie / No Result", "wins": bw[2] or 0}
    ]

    cur.execute(f"""
        SELECT season,
               ROUND(AVG(first_innings_score), 1) AS avg_1st_innings,
               ROUND(AVG(second_innings_score), 1) AS avg_2nd_innings
        FROM matches
        {match_clause}
        {"AND" if match_clause else "WHERE"} first_innings_score IS NOT NULL
        GROUP BY season
        ORDER BY season
    """, match_params)
    season_avg_scoring = [{"season": r[0], "avg_1st": r[1] or 0, "avg_2nd": r[2] or 0} for r in cur.fetchall()]

    cur.execute(f"""
        SELECT match_id, date, season, batting_team, bowling_team, innings_runs, wickets, overs
        FROM match_innings
        {match_clause.replace('team1', 'batting_team').replace('team2', 'bowling_team')}
        ORDER BY innings_runs DESC
        LIMIT 10
    """, match_params)
    highest_totals = [
        {
            "match_id": r[0],
            "date": r[1],
            "season": r[2],
            "team": r[3],
            "opponent": r[4],
            "score": f"{r[5]}/{r[6]}",
            "overs": r[7],
            "runs": r[5]
        }
        for r in cur.fetchall()
    ]

    cur.execute("SELECT DISTINCT season FROM matches ORDER BY season")
    all_seasons = [r[0] for r in cur.fetchall()]

    cur.execute("""
        SELECT DISTINCT team FROM (
            SELECT team1 AS team FROM matches
            UNION
            SELECT team2 AS team FROM matches
        ) WHERE team IS NOT NULL ORDER BY team
    """)
    all_teams = [r[0] for r in cur.fetchall()]

    cur.execute("SELECT DISTINCT venue FROM matches WHERE venue IS NOT NULL ORDER BY venue")
    all_venues = [r[0] for r in cur.fetchall()]

    conn.close()

    return {
        "total_matches": total_matches,
        "total_seasons": total_seasons,
        "total_teams": total_teams,
        "total_players": total_players,
        "total_runs": total_runs,
        "total_wickets": total_wickets,
        "season_runs": season_runs,
        "team_wins": team_wins,
        "top_batters": top_batters,
        "top_bowlers": top_bowlers,
        "toss_distribution": toss_dist,
        "bat_first_vs_chasing": bat_first_vs_chase,
        "season_avg_scoring": season_avg_scoring,
        "highest_totals": highest_totals,
        "filters": {
            "seasons": all_seasons,
            "teams": all_teams,
            "venues": all_venues
        }
    }

@app.get("/api/teams")
def get_teams():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT 
            team,
            seasons_played,
            matches,
            wins,
            total_runs,
            ROUND(avg_score, 1) AS avg_score,
            ROUND(avg_run_rate, 2) AS avg_run_rate,
            ROUND(win_percentage, 1) AS win_percentage
        FROM s4_team_overall
        ORDER BY wins DESC
    """)
    teams = []
    for r in cur.fetchall():
        tname = r[0]
        teams.append({
            "team": tname,
            "seasons_played": r[1],
            "matches": r[2],
            "wins": r[3],
            "losses": r[2] - r[3],
            "total_runs": r[4],
            "avg_score": r[5],
            "avg_run_rate": r[6],
            "win_percentage": r[7],
            "titles": TITLES_WON.get(tname, 0)
        })
    conn.close()
    return teams

@app.get("/api/teams/{team_name}")
def get_team_detail(team_name: str):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT 
            COUNT(*) AS matches,
            SUM(CASE WHEN winner = ? THEN 1 ELSE 0 END) AS wins,
            SUM(CASE WHEN winner != ? AND winner IS NOT NULL AND winner != '' THEN 1 ELSE 0 END) AS losses,
            SUM(CASE WHEN winner IS NULL OR winner = '' THEN 1 ELSE 0 END) AS no_results
        FROM matches
        WHERE team1 = ? OR team2 = ?
    """, (team_name, team_name, team_name, team_name))
    ov = cur.fetchone()
    if not ov or ov[0] == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Team not found")

    matches_count = ov[0]
    wins = ov[1] or 0
    losses = ov[2] or 0
    no_results = ov[3] or 0
    win_pct = round((wins / matches_count * 100), 1) if matches_count else 0

    cur.execute("""
        SELECT season, matches, wins, 
               (matches - wins) AS losses,
               ROUND(win_percentage, 1) AS win_pct,
               total_runs,
               ROUND(average_score, 1) AS avg_score,
               ROUND(average_run_rate, 2) AS avg_run_rate
        FROM team_season
        WHERE team = ?
        ORDER BY season
    """, (team_name,))
    seasons_perf = [
        {
            "season": r[0], "matches": r[1], "wins": r[2],
            "losses": r[3], "win_pct": r[4], "total_runs": r[5],
            "avg_score": r[6], "avg_run_rate": r[7]
        }
        for r in cur.fetchall()
    ]

    cur.execute("""
        SELECT 
            SUM(CASE WHEN batting_first = 1 THEN 1 ELSE 0 END) AS bat_first_matches,
            SUM(CASE WHEN won_batting_first = 1 THEN 1 ELSE 0 END) AS bat_first_wins,
            SUM(CASE WHEN batting_first = 0 THEN 1 ELSE 0 END) AS chasing_matches,
            SUM(CASE WHEN won_chasing = 1 THEN 1 ELSE 0 END) AS chasing_wins
        FROM team_match
        WHERE team = ?
    """, (team_name,))
    ch = cur.fetchone()
    bat_first_matches = ch[0] or 0
    bat_first_wins = ch[1] or 0
    chasing_matches = ch[2] or 0
    chasing_wins = ch[3] or 0

    cur.execute("""
        SELECT match_id, date, season, opponent, innings_runs, wickets, overs
        FROM team_match
        WHERE team = ?
        ORDER BY innings_runs DESC
        LIMIT 5
    """, (team_name,))
    highest_totals = [
        {
            "match_id": r[0], "date": r[1], "season": r[2],
            "opponent": r[3], "score": f"{r[4]}/{r[5]}", "overs": r[6]
        }
        for r in cur.fetchall()
    ]

    cur.execute("""
        SELECT match_id, date, season, team1, team2, winner, win_type, win_margin, venue, player_of_match
        FROM matches
        WHERE team1 = ? OR team2 = ?
        ORDER BY date DESC
        LIMIT 10
    """, (team_name, team_name))
    recent_matches = [
        {
            "match_id": r[0], "date": r[1], "season": r[2],
            "team1": r[3], "team2": r[4], "winner": r[5],
            "win_type": r[6], "win_margin": r[7], "venue": r[8],
            "player_of_match": r[9]
        }
        for r in cur.fetchall()
    ]

    cur.execute("""
        SELECT DISTINCT name, role, batting_style, bowling_style
        FROM squads
        WHERE team = ?
        ORDER BY name
    """, (team_name,))
    squad = [
        {"name": r[0], "role": r[1], "batting_style": r[2], "bowling_style": r[3]}
        for r in cur.fetchall()
    ]

    conn.close()

    return {
        "team": team_name,
        "titles": TITLES_WON.get(team_name, 0),
        "total_matches": matches_count,
        "wins": wins,
        "losses": losses,
        "no_results": no_results,
        "win_percentage": win_pct,
        "batting_first": {
            "matches": bat_first_matches,
            "wins": bat_first_wins,
            "win_pct": round(bat_first_wins / bat_first_matches * 100, 1) if bat_first_matches else 0
        },
        "chasing": {
            "matches": chasing_matches,
            "wins": chasing_wins,
            "win_pct": round(chasing_wins / chasing_matches * 100, 1) if chasing_matches else 0
        },
        "seasons_performance": seasons_perf,
        "highest_totals": highest_totals,
        "recent_matches": recent_matches,
        "squad": squad
    }

@app.get("/api/teams/head-to-head")
def get_head_to_head(team1: str = Query(...), team2: str = Query(...)):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT match_id, date, season, team1, team2, winner, win_type, win_margin, venue, player_of_match
        FROM matches
        WHERE (team1 = ? AND team2 = ?) OR (team1 = ? AND team2 = ?)
        ORDER BY date DESC
    """, (team1, team2, team2, team1))
    rows = cur.fetchall()

    total_matches = len(rows)
    t1_wins = sum(1 for r in rows if r['winner'] == team1)
    t2_wins = sum(1 for r in rows if r['winner'] == team2)
    no_results = total_matches - t1_wins - t2_wins

    seasons_map = {}
    for r in rows:
        s = r['season']
        if s not in seasons_map:
            seasons_map[s] = {"season": s, "team1_wins": 0, "team2_wins": 0, "no_results": 0, "matches": 0}
        seasons_map[s]["matches"] += 1
        if r['winner'] == team1:
            seasons_map[s]["team1_wins"] += 1
        elif r['winner'] == team2:
            seasons_map[s]["team2_wins"] += 1
        else:
            seasons_map[s]["no_results"] += 1

    conn.close()

    return {
        "team1": team1,
        "team2": team2,
        "total_matches": total_matches,
        "team1_wins": t1_wins,
        "team2_wins": t2_wins,
        "no_results": no_results,
        "team1_win_pct": round(t1_wins / total_matches * 100, 1) if total_matches else 0,
        "team2_win_pct": round(t2_wins / total_matches * 100, 1) if total_matches else 0,
        "season_breakdown": sorted(list(seasons_map.values()), key=lambda x: x['season']),
        "matches": [dict(r) for r in rows]
    }

@app.get("/api/players/search")
def search_players(q: str = Query(..., min_length=2)):
    conn = get_db()
    cur = conn.cursor()
    search_term = f"%{q}%"
    cur.execute("""
        SELECT DISTINCT batter AS player FROM batter_scorecards WHERE batter LIKE ?
        UNION
        SELECT DISTINCT bowler AS player FROM bowler_scorecards WHERE bowler LIKE ?
        LIMIT 15
    """, (search_term, search_term))
    players = [r[0] for r in cur.fetchall()]
    conn.close()
    return players

@app.get("/api/players")
def get_players(
    category: str = "batting",
    sort_by: Optional[str] = None,
    order: str = "desc",
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 25
):
    conn = get_db()
    cur = conn.cursor()
    offset = (page - 1) * limit

    if category == "batting":
        table = "s4_batting_leaderboard"
        valid_cols = ["runs", "batting_average", "strike_rate", "fifties", "hundreds", "fours", "sixes", "matches", "innings"]
        col = sort_by if sort_by in valid_cols else "runs"
        
        where = f"WHERE batter LIKE ?" if search else ""
        params = [f"%{search}%"] if search else []

        cur.execute(f"SELECT COUNT(*) FROM {table} {where}", params)
        total = cur.fetchone()[0]

        cur.execute(f"""
            SELECT batter, seasons, innings, runs, balls, fours, sixes, fifties, hundreds, matches,
                   ROUND(strike_rate, 2) AS strike_rate,
                   ROUND(batting_average, 2) AS batting_average
            FROM {table}
            {where}
            ORDER BY {col} {order}
            LIMIT ? OFFSET ?
        """, params + [limit, offset])
        data = [dict(r) for r in cur.fetchall()]

    else:
        table = "s4_bowling_leaderboard"
        valid_cols = ["wickets", "economy", "bowling_average", "bowling_strike_rate", "dot_balls", "maidens", "matches", "innings"]
        col = sort_by if sort_by in valid_cols else "wickets"
        
        where = f"WHERE bowler LIKE ?" if search else ""
        params = [f"%{search}%"] if search else []

        cur.execute(f"SELECT COUNT(*) FROM {table} {where}", params)
        total = cur.fetchone()[0]

        cur.execute(f"""
            SELECT bowler, seasons, innings, matches, legal_balls, runs_conceded, wickets,
                   dot_balls, maidens,
                   ROUND(economy, 2) AS economy,
                   ROUND(bowling_average, 2) AS bowling_average,
                   ROUND(bowling_strike_rate, 2) AS bowling_strike_rate
            FROM {table}
            {where}
            ORDER BY {col} {order}
            LIMIT ? OFFSET ?
        """, params + [limit, offset])
        data = [dict(r) for r in cur.fetchall()]

    conn.close()
    return {
        "category": category,
        "total": total,
        "page": page,
        "limit": limit,
        "pages": math.ceil(total / limit) if limit else 1,
        "data": data
    }

@app.get("/api/players/{player_name}")
def get_player_profile(player_name: str):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT 
            COUNT(DISTINCT match_id) AS matches,
            COUNT(*) AS innings,
            SUM(total_runs) AS runs,
            SUM(total_balls_faced) AS balls,
            MAX(total_runs) AS highest_score,
            SUM(fours) AS fours,
            SUM(sixes) AS sixes,
            SUM(half_century_flag) AS fifties,
            SUM(century_flag) AS hundreds,
            SUM(dismissed_flag) AS dismissals,
            SUM(not_out_flag) AS not_outs
        FROM batter_scorecards
        WHERE batter = ?
    """, (player_name,))
    b_row = cur.fetchone()

    cur.execute("""
        SELECT 
            COUNT(DISTINCT match_id) AS matches,
            COUNT(*) AS innings,
            SUM(legal_balls) AS legal_balls,
            SUM(runs) AS runs_conceded,
            SUM(wickets) AS wickets,
            SUM(dot_balls) AS dot_balls,
            SUM(maidens) AS maidens,
            SUM(four_wicket_haul) AS four_wickets,
            SUM(CASE WHEN wickets >= 5 THEN 1 ELSE 0 END) AS five_wickets
        FROM bowler_scorecards
        WHERE bowler = ?
    """, (player_name,))
    bowl_row = cur.fetchone()

    cur.execute("""
        SELECT wickets, runs
        FROM bowler_scorecards
        WHERE bowler = ?
        ORDER BY wickets DESC, runs ASC
        LIMIT 1
    """, (player_name,))
    best_bowl_row = cur.fetchone()
    best_bowling = f"{best_bowl_row[0]}/{best_bowl_row[1]}" if best_bowl_row and best_bowl_row[0] > 0 else "N/A"

    has_batting = b_row and b_row['innings'] and b_row['innings'] > 0
    has_bowling = bowl_row and bowl_row['innings'] and bowl_row['innings'] > 0

    if not has_batting and not has_bowling:
        conn.close()
        raise HTTPException(status_code=404, detail="Player not found")

    batting_runs = b_row['runs'] or 0
    balls_faced = b_row['balls'] or 0
    dismissals = b_row['dismissals'] or 0
    batting_avg = round(batting_runs / dismissals, 2) if dismissals > 0 else (round(batting_runs, 2) if batting_runs > 0 else 0)
    strike_rate = round(batting_runs / balls_faced * 100, 2) if balls_faced > 0 else 0

    wickets = bowl_row['wickets'] or 0
    runs_conceded = bowl_row['runs_conceded'] or 0
    legal_balls = bowl_row['legal_balls'] or 0
    overs = round(legal_balls / 6, 1)
    economy = round((runs_conceded / legal_balls) * 6, 2) if legal_balls > 0 else 0
    bowling_avg = round(runs_conceded / wickets, 2) if wickets > 0 else 0
    bowling_sr = round(legal_balls / wickets, 2) if wickets > 0 else 0

    cur.execute("""
        SELECT season, innings, runs, balls_faced, fours, sixes, dismissals, fifties, hundreds,
               ROUND(strike_rate, 2) AS strike_rate,
               ROUND(batting_average, 2) AS batting_average
        FROM batting_player_season
        WHERE batter = ?
        ORDER BY season
    """, (player_name,))
    season_batting = [dict(r) for r in cur.fetchall()]

    cur.execute("""
        SELECT season, innings_bowled, matches, legal_balls, runs_conceded, wickets, dot_balls, maidens,
               ROUND(economy, 2) AS economy,
               ROUND(bowling_average, 2) AS bowling_average,
               ROUND(bowling_strike_rate, 2) AS bowling_strike_rate
        FROM bowling_player_season
        WHERE bowler = ?
        ORDER BY season
    """, (player_name,))
    season_bowling = [dict(r) for r in cur.fetchall()]

    cur.execute("""
        SELECT match_id, date, season, batting_team, bowling_team, total_runs, total_balls_faced, fours, sixes, out
        FROM batter_scorecards
        WHERE batter = ?
        ORDER BY date DESC
        LIMIT 10
    """, (player_name,))
    recent_batting = [dict(r) for r in cur.fetchall()]

    conn.close()

    total_matches = max(b_row['matches'] or 0, bowl_row['matches'] or 0)

    return {
        "player": player_name,
        "matches_played": total_matches,
        "total_runs": batting_runs,
        "total_wickets": wickets,
        "batting_average": batting_avg,
        "batting_strike_rate": strike_rate,
        "bowling_economy": economy,
        "highest_score": b_row['highest_score'] or 0,
        "best_bowling": best_bowling,
        "batting": {
            "innings": b_row['innings'] or 0,
            "runs": batting_runs,
            "balls": balls_faced,
            "fours": b_row['fours'] or 0,
            "sixes": b_row['sixes'] or 0,
            "fifties": b_row['fifties'] or 0,
            "hundreds": b_row['hundreds'] or 0,
            "dismissals": dismissals,
            "not_outs": b_row['not_outs'] or 0,
            "average": batting_avg,
            "strike_rate": strike_rate,
            "highest_score": b_row['highest_score'] or 0,
            "season_progression": season_batting,
            "recent_innings": recent_batting
        },
        "bowling": {
            "innings": bowl_row['innings'] or 0,
            "wickets": wickets,
            "overs": overs,
            "runs_conceded": runs_conceded,
            "dot_balls": bowl_row['dot_balls'] or 0,
            "maidens": bowl_row['maidens'] or 0,
            "four_wickets": bowl_row['four_wickets'] or 0,
            "five_wickets": bowl_row['five_wickets'] or 0,
            "economy": economy,
            "average": bowling_avg,
            "strike_rate": bowling_sr,
            "best_figures": best_bowling,
            "season_progression": season_bowling
        }
    }

@app.get("/api/matches")
def get_matches(
    season: Optional[str] = None,
    team: Optional[str] = None,
    opponent: Optional[str] = None,
    venue: Optional[str] = None,
    result: Optional[str] = None,
    player_of_match: Optional[str] = None,
    page: int = 1,
    limit: int = 20
):
    conn = get_db()
    cur = conn.cursor()
    offset = (page - 1) * limit

    where = []
    params = []

    if season and season != "all":
        where.append("season = ?")
        params.append(season)
    if team and team != "all":
        where.append("(team1 = ? OR team2 = ?)")
        params.extend([team, team])
    if opponent and opponent != "all":
        where.append("(team1 = ? OR team2 = ?)")
        params.extend([opponent, opponent])
    if venue and venue != "all":
        where.append("venue = ?")
        params.append(venue)
    if player_of_match and player_of_match != "all":
        where.append("player_of_match LIKE ?")
        params.append(f"%{player_of_match}%")
    if result and result != "all":
        if result == "tie":
            where.append("result = 'tie'")
        elif result == "no result":
            where.append("result = 'no result'")
        else:
            where.append("winner = ?")
            params.append(result)

    clause = ("WHERE " + " AND ".join(where)) if where else ""

    cur.execute(f"SELECT COUNT(*) FROM matches {clause}", params)
    total = cur.fetchone()[0]

    cur.execute(f"""
        SELECT 
            match_id, date, season, match_number, event_stage,
            team1, team2, venue, city,
            toss_winner, toss_decision,
            winner, win_type, win_margin, result,
            first_innings_score, second_innings_score,
            player_of_match
        FROM matches
        {clause}
        ORDER BY date DESC
        LIMIT ? OFFSET ?
    """, params + [limit, offset])

    matches = [dict(r) for r in cur.fetchall()]
    conn.close()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "pages": math.ceil(total / limit) if limit else 1,
        "matches": matches
    }

@app.get("/api/matches/{match_id}")
def get_match_detail(match_id: int):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT * FROM matches WHERE match_id = ?", (match_id,))
    match_row = cur.fetchone()
    if not match_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Match not found")
    match_data = dict(match_row)

    cur.execute("""
        SELECT * FROM batter_scorecards
        WHERE match_id = ?
        ORDER BY innings, batting_position, total_runs DESC
    """, (match_id,))
    batters = [dict(r) for r in cur.fetchall()]

    cur.execute("""
        SELECT * FROM bowler_scorecards
        WHERE match_id = ?
        ORDER BY innings, wickets DESC, runs ASC
    """, (match_id,))
    bowlers = [dict(r) for r in cur.fetchall()]

    cur.execute("""
        SELECT innings, over, ball, batter, bowler, batter_runs, extras_total, total_runs,
               is_wicket, player_out, dismissal_kind
        FROM deliveries
        WHERE match_id = ?
        ORDER BY innings, over, ball
    """, (match_id,))
    deliveries = [dict(r) for r in cur.fetchall()]

    inngs_data = {1: {"batters": [], "bowlers": [], "overs": [], "fow": [], "runs": 0, "wickets": 0, "extras": 0},
                  2: {"batters": [], "bowlers": [], "overs": [], "fow": [], "runs": 0, "wickets": 0, "extras": 0}}

    for b in batters:
        inn = b.get('innings', 1)
        if inn in inngs_data:
            inngs_data[inn]["batters"].append(b)

    for b in bowlers:
        inn = b.get('innings', 1)
        if inn in inngs_data:
            inngs_data[inn]["bowlers"].append(b)

    cum_runs = {1: 0, 2: 0}
    cum_wickets = {1: 0, 2: 0}
    over_summary = {1: {}, 2: {}}

    for d in deliveries:
        inn = d['innings']
        if inn not in inngs_data:
            continue
        
        runs = d['total_runs'] or 0
        cum_runs[inn] += runs
        inngs_data[inn]["runs"] = cum_runs[inn]
        inngs_data[inn]["extras"] += (d['extras_total'] or 0)

        ov = d['over']
        if ov not in over_summary[inn]:
            over_summary[inn][ov] = {"over": ov + 1, "runs": 0, "wickets": 0, "cum_runs": 0}
        over_summary[inn][ov]["runs"] += runs
        
        if d['is_wicket'] == 1:
            cum_wickets[inn] += 1
            over_summary[inn][ov]["wickets"] += 1
            inngs_data[inn]["fow"].append({
                "wicket": cum_wickets[inn],
                "score": cum_runs[inn],
                "player_out": d['player_out'],
                "over": f"{ov}.{d['ball']}",
                "dismissal": d['dismissal_kind']
            })
        over_summary[inn][ov]["cum_runs"] = cum_runs[inn]

    for inn in [1, 2]:
        inngs_data[inn]["wickets"] = cum_wickets[inn]
        inngs_data[inn]["overs"] = list(over_summary[inn].values())

    conn.close()

    return {
        "match": match_data,
        "innings_1": inngs_data[1],
        "innings_2": inngs_data[2]
    }

@app.get("/api/venues")
def get_venues():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
        SELECT 
            venue,
            matches,
            ROUND(avg_innings_score, 1) AS avg_score,
            ROUND(median_score, 1) AS median_score,
            ROUND(avg_run_rate, 2) AS avg_run_rate,
            ROUND(avg_wickets, 1) AS avg_wickets,
            ROUND(avg_sixes, 1) AS avg_sixes,
            ROUND(avg_fours, 1) AS avg_fours
        FROM s4_venue_insights
        ORDER BY matches DESC
    """)
    venues = []
    for r in cur.fetchall():
        vname = r[0]
        cur.execute("""
            SELECT 
                SUM(CASE WHEN win_type = 'runs' THEN 1 ELSE 0 END) AS bat_first_wins,
                SUM(CASE WHEN win_type = 'wickets' THEN 1 ELSE 0 END) AS chase_wins,
                MAX(first_innings_score) AS max_1st_score,
                MIN(first_innings_score) AS min_1st_score
            FROM matches
            WHERE venue = ?
        """, (vname,))
        vw = cur.fetchone()
        bat_first_wins = vw[0] or 0
        chase_wins = vw[1] or 0
        total_w = bat_first_wins + chase_wins
        venues.append({
            "venue": vname,
            "matches": r[1],
            "avg_score": r[2],
            "median_score": r[3],
            "avg_run_rate": r[4],
            "avg_wickets": r[5],
            "avg_sixes": r[6],
            "avg_fours": r[7],
            "bat_first_wins": bat_first_wins,
            "chase_wins": chase_wins,
            "bat_first_win_pct": round(bat_first_wins / total_w * 100, 1) if total_w else 0,
            "chase_win_pct": round(chase_wins / total_w * 100, 1) if total_w else 0,
            "highest_total": vw[2] or 0,
            "lowest_total": vw[3] or 0
        })
    conn.close()
    return venues

@app.get("/api/venues/{venue_name}")
def get_venue_detail(venue_name: str):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT COUNT(*) AS matches,
               ROUND(AVG(first_innings_score), 1) AS avg_1st,
               ROUND(AVG(second_innings_score), 1) AS avg_2nd,
               MAX(first_innings_score) AS max_score,
               MIN(CASE WHEN first_innings_score > 40 THEN first_innings_score ELSE NULL END) AS min_score,
               SUM(CASE WHEN win_type = 'runs' THEN 1 ELSE 0 END) AS bat_first_wins,
               SUM(CASE WHEN win_type = 'wickets' THEN 1 ELSE 0 END) AS chase_wins,
               SUM(CASE WHEN win_type NOT IN ('runs', 'wickets') OR win_type IS NULL THEN 1 ELSE 0 END) AS ties
        FROM matches
        WHERE venue = ?
    """, (venue_name,))
    row = cur.fetchone()
    if not row or row[0] == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Venue not found")

    matches_count = row[0]
    bat_first_wins = row[5] or 0
    chase_wins = row[6] or 0
    total_w = bat_first_wins + chase_wins

    cur.execute("""
        SELECT season, COUNT(*) AS matches,
               ROUND(AVG(first_innings_score), 1) AS avg_score,
               MAX(first_innings_score) AS high_score
        FROM matches
        WHERE venue = ?
        GROUP BY season
        ORDER BY season
    """, (venue_name,))
    season_trends = [dict(r) for r in cur.fetchall()]

    cur.execute("""
        SELECT match_id, date, season, batting_team, bowling_team, innings_runs, wickets, overs
        FROM match_innings
        WHERE venue = ?
        ORDER BY innings_runs DESC
        LIMIT 5
    """, (venue_name,))
    highest_totals = [
        {
            "match_id": r[0], "date": r[1], "season": r[2],
            "team": r[3], "opponent": r[4], "score": f"{r[5]}/{r[6]}", "overs": r[7]
        }
        for r in cur.fetchall()
    ]

    conn.close()

    return {
        "venue": venue_name,
        "matches": matches_count,
        "avg_1st_innings": row[1] or 0,
        "avg_2nd_innings": row[2] or 0,
        "highest_score": row[3] or 0,
        "lowest_score": row[4] or 0,
        "bat_first_wins": bat_first_wins,
        "chase_wins": chase_wins,
        "ties": row[7] or 0,
        "bat_first_win_pct": round(bat_first_wins / total_w * 100, 1) if total_w else 0,
        "chase_win_pct": round(chase_wins / total_w * 100, 1) if total_w else 0,
        "season_trends": season_trends,
        "highest_totals": highest_totals
    }

@app.get("/api/seasons")
def get_seasons():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT DISTINCT season FROM matches ORDER BY season")
    seasons = [r[0] for r in cur.fetchall()]

    season_list = []
    for s in seasons:
        cur.execute("SELECT COUNT(*) FROM matches WHERE season = ?", (s,))
        mcount = cur.fetchone()[0]

        cur.execute("""
            SELECT winner, team1, team2 FROM matches
            WHERE season = ? AND (LOWER(COALESCE(event_stage, '')) LIKE '%final%' OR LOWER(COALESCE(match_number, '')) LIKE '%final%')
            ORDER BY date DESC LIMIT 1
        """, (s,))
        final_row = cur.fetchone()
        if not final_row:
            cur.execute("SELECT winner, team1, team2 FROM matches WHERE season = ? ORDER BY date DESC, match_id DESC LIMIT 1", (s,))
            final_row = cur.fetchone()
        champion = final_row[0] if final_row else "TBD"
        runner_up = final_row[2] if final_row and final_row[0] == final_row[1] else (final_row[1] if final_row else "TBD")

        cur.execute("""
            SELECT batter, runs FROM batting_player_season
            WHERE season = ? ORDER BY runs DESC LIMIT 1
        """, (s,))
        oc = cur.fetchone()

        cur.execute("""
            SELECT bowler, wickets FROM bowling_player_season
            WHERE season = ? ORDER BY wickets DESC LIMIT 1
        """, (s,))
        pc = cur.fetchone()

        cur.execute("SELECT SUM(innings_runs), SUM(wickets) FROM match_innings WHERE season = ?", (s,))
        tot = cur.fetchone()

        season_list.append({
            "season": s,
            "matches": mcount,
            "champion": champion,
            "runner_up": runner_up,
            "orange_cap": {"player": oc[0], "runs": oc[1]} if oc else {"player": "N/A", "runs": 0},
            "purple_cap": {"player": pc[0], "wickets": pc[1]} if pc else {"player": "N/A", "wickets": 0},
            "total_runs": tot[0] or 0,
            "total_wickets": tot[1] or 0
        })

    conn.close()
    return season_list

@app.get("/api/seasons/{season}")
def get_season_detail(season: str):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) FROM matches WHERE season = ?", (season,))
    matches_count = cur.fetchone()[0]
    if matches_count == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Season not found")

    cur.execute("""
        SELECT team, matches, wins, (matches - wins) AS losses,
               ROUND(win_percentage, 1) AS win_pct, total_runs,
               ROUND(average_score, 1) AS avg_score,
               ROUND(average_run_rate, 2) AS avg_run_rate
        FROM team_season
        WHERE season = ?
        ORDER BY wins DESC, win_percentage DESC
    """, (season,))
    standings = [dict(r) for r in cur.fetchall()]

    cur.execute("""
        SELECT batter, matches, innings, runs, balls_faced, fours, sixes, fifties, hundreds,
               ROUND(strike_rate, 2) AS strike_rate,
               ROUND(batting_average, 2) AS batting_average
        FROM batting_player_season
        WHERE season = ?
        ORDER BY runs DESC
        LIMIT 10
    """, (season,))
    orange_cap_race = [dict(r) for r in cur.fetchall()]

    cur.execute("""
        SELECT bowler, matches, innings_bowled, wickets, runs_conceded, dot_balls, maidens,
               ROUND(economy, 2) AS economy,
               ROUND(bowling_average, 2) AS bowling_average,
               ROUND(bowling_strike_rate, 2) AS bowling_strike_rate
        FROM bowling_player_season
        WHERE season = ?
        ORDER BY wickets DESC
        LIMIT 10
    """, (season,))
    purple_cap_race = [dict(r) for r in cur.fetchall()]

    cur.execute("""
        SELECT match_id, date, batting_team, bowling_team, innings_runs, wickets, overs
        FROM match_innings
        WHERE season = ?
        ORDER BY innings_runs DESC
        LIMIT 5
    """, (season,))
    highest_totals = [
        {
            "match_id": r[0], "date": r[1], "team": r[2], "opponent": r[3],
            "score": f"{r[4]}/{r[5]}", "overs": r[6]
        }
        for r in cur.fetchall()
    ]

    cur.execute("""
        SELECT match_id, date, batter, batting_team, bowling_team, total_runs, total_balls_faced, fours, sixes
        FROM batter_scorecards
        WHERE season = ?
        ORDER BY total_runs DESC
        LIMIT 5
    """, (season,))
    highest_individual = [
        {
            "match_id": r[0], "date": r[1], "batter": r[2], "team": r[3],
            "opponent": r[4], "runs": r[5], "balls": r[6], "fours": r[7], "sixes": r[8]
        }
        for r in cur.fetchall()
    ]

    cur.execute("""
        SELECT match_id, date, match_number, event_stage, team1, team2, venue,
               first_innings_score, second_innings_score, winner, win_type, win_margin, player_of_match
        FROM matches
        WHERE season = ?
        ORDER BY date
    """, (season,))
    matches = [dict(r) for r in cur.fetchall()]

    conn.close()

    return {
        "season": season,
        "matches_count": matches_count,
        "standings": standings,
        "orange_cap_leaderboard": orange_cap_race,
        "purple_cap_leaderboard": purple_cap_race,
        "highest_team_totals": highest_totals,
        "highest_individual_scores": highest_individual,
        "matches": matches
    }

@app.get("/api/insights/advanced")
def get_advanced_insights():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT phase, innings_phase_records,
               ROUND(avg_runs, 1) AS avg_runs,
               ROUND(avg_wickets, 2) AS avg_wickets,
               ROUND(avg_run_rate, 2) AS avg_run_rate,
               ROUND(avg_dot_ball_pct, 1) AS avg_dot_ball_pct,
               total_runs, total_wickets,
               ROUND(runs_share_pct, 1) AS runs_share_pct
        FROM s4_phase_performance
        ORDER BY CASE phase WHEN 'Powerplay' THEN 1 WHEN 'Middle' THEN 2 WHEN 'Death' THEN 3 ELSE 4 END
    """)
    phase_perf = [dict(r) for r in cur.fetchall()]

    cur.execute("""
        SELECT first_innings_score_band, matches, chasing_wins,
               ROUND(chase_win_pct, 1) AS chase_win_pct
        FROM s4_score_vs_chase
        ORDER BY first_innings_score_band
    """)
    score_chase = [dict(r) for r in cur.fetchall()]

    cur.execute("""
        SELECT bc.batter, bc.seasons,
               ROUND(bc.mean_runs_per_season, 1) AS mean_runs,
               ROUND(bc.std_runs_per_season, 1) AS std_runs,
               ROUND(bc.runs_cv_pct, 1) AS cv_pct,
               ROUND(bc.mean_sr, 1) AS mean_sr
        FROM s4_batter_consistency bc
        JOIN s4_batting_leaderboard bl ON bc.batter = bl.batter
        WHERE bc.seasons >= 5 AND bl.runs >= 1500
        ORDER BY bc.runs_cv_pct ASC
        LIMIT 10
    """)
    batter_consistency = [dict(r) for r in cur.fetchall()]

    cur.execute("""
        SELECT bc.bowler, bc.seasons,
               ROUND(bc.mean_wickets, 1) AS mean_wickets,
               ROUND(bc.std_wickets, 1) AS std_wickets,
               ROUND(bc.wicket_cv_pct, 1) AS cv_pct,
               ROUND(bc.mean_economy, 2) AS mean_economy
        FROM s4_bowler_consistency bc
        JOIN s4_bowling_leaderboard bl ON bc.bowler = bl.bowler
        WHERE bc.seasons >= 5 AND bl.wickets >= 50
        ORDER BY bc.wicket_cv_pct ASC
        LIMIT 10
    """)
    bowler_consistency = [dict(r) for r in cur.fetchall()]

    cur.execute("""
        SELECT venue, matches,
               ROUND(avg_innings_score, 1) AS avg_score,
               ROUND(avg_run_rate, 2) AS avg_run_rate,
               ROUND(avg_wickets, 1) AS avg_wickets,
               ROUND(avg_sixes, 1) AS avg_sixes,
               CASE 
                   WHEN avg_innings_score >= 165 OR avg_run_rate >= 8.6 THEN 'Batting Friendly'
                   WHEN avg_innings_score <= 150 OR avg_run_rate <= 7.8 THEN 'Bowling Friendly'
                   ELSE 'Balanced'
               END AS pitch_nature
        FROM s4_venue_insights
        WHERE matches >= 10
        ORDER BY avg_innings_score DESC
    """)
    venue_nature = [dict(r) for r in cur.fetchall()]

    cur.execute("""
        SELECT season, matches, runs,
               ROUND(mean_team_run_rate, 2) AS run_rate
        FROM s4_season_trends
        ORDER BY season
    """)
    season_trends = [dict(r) for r in cur.fetchall()]

    conn.close()

    return {
        "phases": phase_perf,
        "chase_by_score_band": score_chase,
        "batter_consistency": batter_consistency,
        "bowler_consistency": bowler_consistency,
        "venue_nature": venue_nature,
        "season_trends": season_trends
    }

# Serve static frontend in production
if os.path.exists(DIST_PATH):
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_PATH, "assets")), name="assets")
    
    charts_path = os.path.join(DIST_PATH, "charts")
    if os.path.exists(charts_path):
        app.mount("/charts", StaticFiles(directory=charts_path), name="charts")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API routes
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API endpoint not found")
        target_file = os.path.join(DIST_PATH, full_path)
        if os.path.exists(target_file) and os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(DIST_PATH, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
