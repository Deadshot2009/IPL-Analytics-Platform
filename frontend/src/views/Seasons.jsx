import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Trophy, 
  Award, 
  Flame, 
  Target, 
  TrendingUp, 
  RefreshCw,
  GitCompare,
  ArrowRight
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { getTeamMeta } from '../utils/teamColors';

export default function Seasons({ onSelectMatch, onSelectPlayer }) {
  const [seasonsList, setSeasonsList] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('2026');
  const [seasonDetail, setSeasonDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  // Compare mode
  const [compareMode, setCompareMode] = useState(false);
  const [compareSeason, setCompareSeason] = useState('2024');
  const [compareDetail, setCompareDetail] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  // Load all seasons summary
  useEffect(() => {
    async function fetchSeasons() {
      try {
        const res = await fetch('/api/seasons');
        if (res.ok) {
          const data = await res.json();
          setSeasonsList(data);
          if (data.length > 0 && !selectedSeason) {
            setSelectedSeason(data[data.length - 1].season);
          }
        }
      } catch (err) {
        console.error("Failed to load seasons list:", err);
      }
    }
    fetchSeasons();
  }, []);

  // Load selected season detail
  useEffect(() => {
    async function fetchSeasonDetail() {
      if (!selectedSeason) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/seasons/${encodeURIComponent(selectedSeason)}`);
        if (res.ok) {
          const data = await res.json();
          setSeasonDetail(data);
        }
      } catch (err) {
        console.error("Failed to load season detail:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSeasonDetail();
  }, [selectedSeason]);

  // Load compare season detail
  useEffect(() => {
    async function fetchCompare() {
      if (!compareMode || !compareSeason) return;
      try {
        setCompareLoading(true);
        const res = await fetch(`/api/seasons/${encodeURIComponent(compareSeason)}`);
        if (res.ok) {
          const data = await res.json();
          setCompareDetail(data);
        }
      } catch (err) {
        console.error("Failed to load compare season:", err);
      } finally {
        setCompareLoading(false);
      }
    }
    fetchCompare();
  }, [compareMode, compareSeason]);

  const currentSummary = seasonsList.find(s => s.season === selectedSeason);
  const compareSummary = seasonsList.find(s => s.season === compareSeason);

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Compare toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Season Explorer (2008 – 2026)
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Historical championship timelines, standings, cap races, and cross-season comparisons
          </p>
        </div>

        <button
          onClick={() => setCompareMode(!compareMode)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
            compareMode
              ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
              : 'bg-[#151B24] text-[#94A3B8] hover:text-white border-[#283241]'
          }`}
        >
          <GitCompare size={15} />
          <span>{compareMode ? 'Exit Compare Mode' : 'Compare Two Seasons'}</span>
        </button>
      </div>

      {/* Season Selector Bar */}
      <div className="p-4 rounded-xl bg-[#151B24] border border-[#283241] space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
          Select IPL Season
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {seasonsList.map((s) => {
            const isSelected = selectedSeason === s.season;
            return (
              <button
                key={s.season}
                onClick={() => setSelectedSeason(s.season)}
                className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-2 border transition ${
                  isSelected
                    ? 'border-[#FF6B35] bg-[#1B2430] text-white shadow-md'
                    : 'border-[#283241] bg-[#0B0F14] text-[#94A3B8] hover:text-white hover:border-[#FF6B35]/40'
                }`}
              >
                <Calendar size={13} className={isSelected ? 'text-[#FF6B35]' : 'text-[#94A3B8]'} />
                <span>Season {s.season}</span>
                {s.champion && (
                  <span className="text-[10px] text-[#A3E635]">🏆</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* COMPARE MODE VIEW */}
      {compareMode && (
        <div className="p-5 rounded-2xl bg-[#151B24] border border-[#FF6B35]/30 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <GitCompare size={16} className="text-[#FF6B35]" />
              <span>Cross-Season Comparative Analytics</span>
            </h3>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#94A3B8]">Comparing Season {selectedSeason} with:</span>
              <select
                value={compareSeason}
                onChange={(e) => setCompareSeason(e.target.value)}
                className="px-3 py-1.5 bg-[#0B0F14] border border-[#283241] rounded-lg text-xs font-bold text-white focus:outline-none focus:border-[#FF6B35]"
              >
                {seasonsList.map(s => (
                  <option key={s.season} value={s.season}>Season {s.season}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Season A Card */}
            <div className="p-4 rounded-xl bg-[#0B0F14] border border-[#283241] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-white">Season {selectedSeason}</span>
                <span className="text-xs text-[#A3E635] font-bold">Champion: {currentSummary?.champion}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-[#151B24]">
                  <div className="text-[10px] text-[#94A3B8]">Matches</div>
                  <div className="font-bold text-white mt-0.5">{currentSummary?.matches}</div>
                </div>
                <div className="p-2 rounded bg-[#151B24]">
                  <div className="text-[10px] text-[#94A3B8]">Total Runs</div>
                  <div className="font-bold text-[#FF6B35] mt-0.5">{currentSummary?.total_runs.toLocaleString()}</div>
                </div>
                <div className="p-2 rounded bg-[#151B24]">
                  <div className="text-[10px] text-[#94A3B8]">Wickets</div>
                  <div className="font-bold text-[#A3E635] mt-0.5">{currentSummary?.total_wickets}</div>
                </div>
              </div>
              <div className="text-xs text-[#94A3B8] space-y-1 pt-1 border-t border-[#283241]">
                <div>Orange Cap: <strong className="text-white">{currentSummary?.orange_cap.player}</strong> ({currentSummary?.orange_cap.runs} runs)</div>
                <div>Purple Cap: <strong className="text-white">{currentSummary?.purple_cap.player}</strong> ({currentSummary?.purple_cap.wickets} wkts)</div>
              </div>
            </div>

            {/* Season B Card */}
            <div className="p-4 rounded-xl bg-[#0B0F14] border border-[#283241] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-white">Season {compareSeason}</span>
                <span className="text-xs text-[#A3E635] font-bold">Champion: {compareSummary?.champion}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-[#151B24]">
                  <div className="text-[10px] text-[#94A3B8]">Matches</div>
                  <div className="font-bold text-white mt-0.5">{compareSummary?.matches}</div>
                </div>
                <div className="p-2 rounded bg-[#151B24]">
                  <div className="text-[10px] text-[#94A3B8]">Total Runs</div>
                  <div className="font-bold text-[#FF6B35] mt-0.5">{compareSummary?.total_runs.toLocaleString()}</div>
                </div>
                <div className="p-2 rounded bg-[#151B24]">
                  <div className="text-[10px] text-[#94A3B8]">Wickets</div>
                  <div className="font-bold text-[#A3E635] mt-0.5">{compareSummary?.total_wickets}</div>
                </div>
              </div>
              <div className="text-xs text-[#94A3B8] space-y-1 pt-1 border-t border-[#283241]">
                <div>Orange Cap: <strong className="text-white">{compareSummary?.orange_cap.player}</strong> ({compareSummary?.orange_cap.runs} runs)</div>
                <div>Purple Cap: <strong className="text-white">{compareSummary?.purple_cap.player}</strong> ({compareSummary?.purple_cap.wickets} wkts)</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading || !seasonDetail ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="w-8 h-8 text-[#FF6B35] animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Season Champion Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#151B24] via-[#1B2430] to-[#0E1520] border border-[#283241] shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#E04F16] flex items-center justify-center font-black text-white shadow-xl shadow-[#FF6B35]/20">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black text-white">IPL Season {seasonDetail.season}</h3>
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Champion: <strong className="text-[#A3E635]">{currentSummary?.champion}</strong> • Runner-up: <strong className="text-slate-300">{currentSummary?.runner_up}</strong>
                  </p>
                </div>
              </div>

              {/* Cap Winners Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="px-3.5 py-2 rounded-xl bg-[#0B0F14] border border-[#FF6B35]/40 text-xs">
                  <div className="text-[10px] text-[#FF6B35] font-bold uppercase">Orange Cap</div>
                  <div className="font-bold text-white">{currentSummary?.orange_cap.player} ({currentSummary?.orange_cap.runs} runs)</div>
                </div>

                <div className="px-3.5 py-2 rounded-xl bg-[#0B0F14] border border-[#8B5CF6]/40 text-xs">
                  <div className="text-[10px] text-[#8B5CF6] font-bold uppercase">Purple Cap</div>
                  <div className="font-bold text-white">{currentSummary?.purple_cap.player} ({currentSummary?.purple_cap.wickets} wkts)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            <StatCard
              title="Fixtures Played"
              value={seasonDetail.matches_count}
              icon={Calendar}
              accentColor="#38BDF8"
            />
            <StatCard
              title="Total Runs"
              value={currentSummary?.total_runs || 0}
              icon={Flame}
              accentColor="#FF6B35"
            />
            <StatCard
              title="Total Wickets"
              value={currentSummary?.total_wickets || 0}
              icon={Target}
              accentColor="#A3E635"
            />
            <StatCard
              title="Highest Team Score"
              value={seasonDetail.highest_team_totals[0]?.score || "N/A"}
              icon={Trophy}
              accentColor="#F59E0B"
              subtitle={seasonDetail.highest_team_totals[0] ? `${seasonDetail.highest_team_totals[0].team}` : ""}
            />
            <StatCard
              title="Top Individual Knock"
              value={seasonDetail.highest_individual_scores[0]?.runs ? `${seasonDetail.highest_individual_scores[0].runs}*` : "N/A"}
              icon={Award}
              accentColor="#EC4899"
              subtitle={seasonDetail.highest_individual_scores[0] ? `${seasonDetail.highest_individual_scores[0].batter}` : ""}
            />
          </div>

          {/* Standings Table */}
          <div className="ipl-card p-5 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Season {seasonDetail.season} Points Table & Standings
            </h4>
            <div className="overflow-x-auto rounded-xl border border-[#283241] bg-[#0B0F14]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#151B24] text-[#94A3B8] font-semibold border-b border-[#283241]">
                  <tr>
                    <th className="p-3">Pos</th>
                    <th className="p-3">Team</th>
                    <th className="p-3 text-right">P</th>
                    <th className="p-3 text-right">W</th>
                    <th className="p-3 text-right">L</th>
                    <th className="p-3 text-right">Pts</th>
                    <th className="p-3 text-right">Win %</th>
                    <th className="p-3 text-right">Runs</th>
                    <th className="p-3 text-right">Avg Score</th>
                    <th className="p-3 text-right">NRR Est</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#283241]/60">
                  {seasonDetail.standings?.map((s, idx) => (
                    <tr key={idx} className="hover:bg-[#151B24]/70 transition">
                      <td className="p-3 font-bold text-[#94A3B8]">#{idx + 1}</td>
                      <td className="p-3 font-bold text-white">{s.team}</td>
                      <td className="p-3 text-right text-white">{s.matches}</td>
                      <td className="p-3 text-right font-bold text-[#A3E635]">{s.wins}</td>
                      <td className="p-3 text-right text-[#EF4444]">{s.losses}</td>
                      <td className="p-3 text-right font-black text-[#FF6B35]">{s.wins * 2}</td>
                      <td className="p-3 text-right font-semibold text-white">{s.win_pct}%</td>
                      <td className="p-3 text-right text-[#94A3B8]">{s.total_runs.toLocaleString()}</td>
                      <td className="p-3 text-right text-white">{s.avg_score}</td>
                      <td className="p-3 text-right text-[#38BDF8]">{s.avg_run_rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Leaderboards Grid (Orange & Purple Caps) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orange Cap Leaderboard */}
            <div className="ipl-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Orange Cap Race (Most Runs)
                  </h4>
                  <p className="text-xs text-[#94A3B8]">Top run-getters in Season {seasonDetail.season}</p>
                </div>
                <Flame className="w-5 h-5 text-[#FF6B35]" />
              </div>
              <div className="overflow-x-auto rounded-xl border border-[#283241] bg-[#0B0F14]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#151B24] text-[#94A3B8] font-semibold border-b border-[#283241]">
                    <tr>
                      <th className="p-2.5">Player</th>
                      <th className="p-2.5 text-right">Inns</th>
                      <th className="p-2.5 text-right font-bold text-[#FF6B35]">Runs</th>
                      <th className="p-2.5 text-right">SR</th>
                      <th className="p-2.5 text-right">50/100</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#283241]/60">
                    {seasonDetail.orange_cap_leaderboard?.map((b, idx) => (
                      <tr 
                        key={idx} 
                        onClick={() => onSelectPlayer && onSelectPlayer(b.batter)}
                        className="hover:bg-[#151B24]/70 cursor-pointer transition"
                      >
                        <td className="p-2.5 font-bold text-white">{b.batter}</td>
                        <td className="p-2.5 text-right text-white">{b.innings}</td>
                        <td className="p-2.5 text-right font-black text-[#FF6B35]">{b.runs}</td>
                        <td className="p-2.5 text-right text-[#38BDF8]">{b.strike_rate}</td>
                        <td className="p-2.5 text-right text-[#A3E635]">{b.fifties} / {b.hundreds}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Purple Cap Leaderboard */}
            <div className="ipl-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Purple Cap Race (Most Wickets)
                  </h4>
                  <p className="text-xs text-[#94A3B8]">Top wicket takers in Season {seasonDetail.season}</p>
                </div>
                <Target className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <div className="overflow-x-auto rounded-xl border border-[#283241] bg-[#0B0F14]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#151B24] text-[#94A3B8] font-semibold border-b border-[#283241]">
                    <tr>
                      <th className="p-2.5">Bowler</th>
                      <th className="p-2.5 text-right">Inns</th>
                      <th className="p-2.5 text-right font-bold text-[#8B5CF6]">Wkts</th>
                      <th className="p-2.5 text-right">Econ</th>
                      <th className="p-2.5 text-right">Avg</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#283241]/60">
                    {seasonDetail.purple_cap_leaderboard?.map((w, idx) => (
                      <tr 
                        key={idx} 
                        onClick={() => onSelectPlayer && onSelectPlayer(w.bowler)}
                        className="hover:bg-[#151B24]/70 cursor-pointer transition"
                      >
                        <td className="p-2.5 font-bold text-white">{w.bowler}</td>
                        <td className="p-2.5 text-right text-white">{w.innings_bowled}</td>
                        <td className="p-2.5 text-right font-black text-[#A3E635]">{w.wickets}</td>
                        <td className="p-2.5 text-right text-[#FF6B35] font-semibold">{w.economy}</td>
                        <td className="p-2.5 text-right text-white">{w.bowling_average}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Season Matches Table */}
          <div className="ipl-card p-5 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              All Match Results in Season {seasonDetail.season} ({seasonDetail.matches.length})
            </h4>
            <div className="overflow-x-auto rounded-xl border border-[#283241] bg-[#0B0F14] max-h-96">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#151B24] text-[#94A3B8] font-semibold border-b border-[#283241] sticky top-0">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Teams</th>
                    <th className="p-3">Venue</th>
                    <th className="p-3 text-right">Scorecard</th>
                    <th className="p-3 text-right">Winner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#283241]/60">
                  {seasonDetail.matches?.map((m) => (
                    <tr 
                      key={m.match_id} 
                      onClick={() => onSelectMatch(m.match_id)}
                      className="hover:bg-[#151B24]/70 cursor-pointer transition"
                    >
                      <td className="p-3 text-[#94A3B8]">{m.date}</td>
                      <td className="p-3 font-bold text-white">{m.team1} vs {m.team2}</td>
                      <td className="p-3 text-[#94A3B8] truncate max-w-xs">{m.venue}</td>
                      <td className="p-3 text-right font-medium text-white">{m.first_innings_score || '—'} / {m.second_innings_score || '—'}</td>
                      <td className="p-3 text-right font-bold text-[#A3E635]">
                        {m.winner ? `${m.winner} (+${m.win_margin} ${m.win_type})` : (m.result || 'No Result')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
