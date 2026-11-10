import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
import server

print("--- Testing get_overview ---")
ov = server.get_overview()
print(f"Matches: {ov['total_matches']}, Seasons: {ov['total_seasons']}, Runs: {ov['total_runs']}, Wickets: {ov['total_wickets']}")

print("--- Testing get_teams ---")
teams = server.get_teams()
print(f"Teams count: {len(teams)}, Top team: {teams[0]['team']}")

print("--- Testing get_team_detail ---")
csk = server.get_team_detail("Chennai Super Kings")
print(f"CSK wins: {csk['wins']}, Titles: {csk['titles']}, Seasons: {len(csk['seasons_performance'])}")

print("--- Testing get_head_to_head ---")
h2h = server.get_head_to_head("Mumbai Indians", "Chennai Super Kings")
print(f"MI vs CSK matches: {h2h['total_matches']}, MI wins: {h2h['team1_wins']}, CSK wins: {h2h['team2_wins']}")

print("--- Testing get_player_profile ---")
vk = server.get_player_profile("V Kohli")
print(f"Virat Kohli runs: {vk['total_runs']}, 50s: {vk['batting']['fifties']}, 100s: {vk['batting']['hundreds']}")

print("--- Testing get_matches ---")
matches = server.get_matches(limit=5)
print(f"Matches returned: {len(matches['matches'])}, Total matches: {matches['total']}")

print("--- Testing get_match_detail ---")
m1 = server.get_match_detail(matches['matches'][0]['match_id'])
print(f"Match detail for ID {m1['match']['match_id']}: {m1['match']['team1']} vs {m1['match']['team2']}, Innings 1 batters: {len(m1['innings_1']['batters'])}")

print("--- Testing get_venues ---")
venues = server.get_venues()
print(f"Venues count: {len(venues)}, Top venue: {venues[0]['venue']}")

print("--- Testing get_seasons ---")
seasons = server.get_seasons()
print(f"Seasons count: {len(seasons)}, Latest season: {seasons[-1]['season']}, Champion: {seasons[-1]['champion']}")

print("--- Testing get_advanced_insights ---")
insights = server.get_advanced_insights()
print(f"Phases: {[p['phase'] for p in insights['phases']]}")
print(f"Score bands: {len(insights['chase_by_score_band'])}")
print(f"Consistent batters: {len(insights['batter_consistency'])}")
print("\n>>> ALL TESTS COMPLETED SUCCESSFULLY! <<<")
