import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Flame, 
  Target, 
  TrendingUp, 
  Award, 
  Calendar, 
  RefreshCw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';
import StatCard from '../components/StatCard';

export default function Players({ initialPlayer, onSelectMatch }) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'rankings'
  const [profileTab, setProfileTab] = useState('batting'); // 'batting', 'bowling', 'season'

  // Search & Profile state
  const [searchQuery, setSearchQuery] = useState(initialPlayer || 'V Kohli');
  const [selectedPlayer, setSelectedPlayer] = useState(initialPlayer || 'V Kohli');
  const [playerProfile, setPlayerProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Autocomplete suggestions
  const [suggestions, setSuggestions] = useState([]);

  // Rankings table state
  const [rankingCategory, setRankingCategory] = useState('batting'); // 'batting' or 'bowling'
  const [rankingSortBy, setRankingSortBy] = useState('runs');
  const [rankingOrder, setRankingOrder] = useState('desc');
  const [rankingSearch, setRankingSearch] = useState('');
  const [rankingPage, setRankingPage] = useState(1);
  const [rankingData, setRankingData] = useState(null);
  const [rankingLoading, setRankingLoading] = useState(false);

  // Sync initialPlayer prop
  useEffect(() => {
    if (initialPlayer) {
      setSelectedPlayer(initialPlayer);
      setSearchQuery(initialPlayer);
      setActiveTab('profile');
    }
  }, [initialPlayer]);

  // Autocomplete fetch
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/players/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const list = await res.json();
          setSuggestions(list);
        }
      } catch (err) {
        console.error(err);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load player profile
  useEffect(() => {
    async function loadProfile() {
      if (!selectedPlayer) return;
      try {
        setProfileLoading(true);
        setProfileError(null);
        const res = await fetch(`/api/players/${encodeURIComponent(selectedPlayer)}`);
        if (!res.ok) throw new Error("Player profile not found");
        const json = await res.json();
        setPlayerProfile(json);
      } catch (err) {
        setProfileError(err.message);
      } finally {
        setProfileLoading(false);
      }
    }
    loadProfile();
  }, [selectedPlayer]);

  // Load rankings
  useEffect(() => {
    async function loadRankings() {
      try {
        setRankingLoading(true);
        const params = new URLSearchParams({
          category: rankingCategory,
          sort_by: rankingSortBy,
          order: rankingOrder,
          page: rankingPage.toString(),
          limit: '20'
        });
        if (rankingSearch) params.append('search', rankingSearch);

        const res = await fetch(`/api/players?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setRankingData(json);
        }
      } catch (err) {
        console.error("Failed to load rankings:", err);
      } finally {
        setRankingLoading(false);
      }
    }
    if (activeTab === 'rankings') {
      loadRankings();
    }
  }, [rankingCategory, rankingSortBy, rankingOrder, rankingSearch, rankingPage, activeTab]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Main Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Player Analytics & Rankings
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Individual batting and bowling masteries, career milestones, and all-time leaderboards
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-[#151B24] p-1 border border-[#283241]">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'profile'
                ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/20'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Player Profile
          </button>
          <button
            onClick={() => setActiveTab('rankings')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'rankings'
                ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/20'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Award size={14} />
            <span>All-Time Rankings</span>
          </button>
        </div>
      </div>

      {activeTab === 'profile' ? (
        <div className="space-y-6">
          {/* Search Bar for Player */}
          <div className="relative max-w-xl">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#151B24] border border-[#283241] rounded-xl focus-within:border-[#FF6B35] transition shadow-md">
              <Search className="w-5 h-5 text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search any IPL player (e.g. V Kohli, JJ Bumrah, MS Dhoni)..."
                className="w-full bg-transparent text-sm text-white placeholder-[#94A3B8]/60 focus:outline-none"
              />
            </div>

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-[#151B24] border border-[#283241] rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                {suggestions.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setSelectedPlayer(p);
                      setSearchQuery(p);
                      setSuggestions([]);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-white hover:text-[#FF6B35] hover:bg-[#1B2430] border-b border-[#283241]/40 last:border-0"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {profileLoading ? (
            <div className="flex justify-center py-20">
              <RefreshCw className="w-8 h-8 text-[#FF6B35] animate-spin" />
            </div>
          ) : profileError || !playerProfile ? (
            <div className="p-8 rounded-xl bg-[#151B24] border border-[#283241] text-center text-[#94A3B8]">
              {profileError || "Select a player to view career analytics."}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Player Header Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-[#151B24] via-[#1B2430] to-[#0E1520] border border-[#283241] shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#E04F16] flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-[#FF6B35]/20">
                      {playerProfile.player.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white">{playerProfile.player}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#94A3B8] mt-1">
                        <span>{playerProfile.matches_played} Matches Played</span>
                        <span>•</span>
                        <span className="text-[#FF6B35] font-semibold">{playerProfile.total_runs.toLocaleString()} Runs</span>
                        <span>•</span>
                        <span className="text-[#A3E635] font-semibold">{playerProfile.total_wickets} Wickets</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Player Profile Quick Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                <StatCard
                  title="Batting Runs"
                  value={playerProfile.total_runs}
                  icon={Flame}
                  accentColor="#FF6B35"
                  subtitle={`Avg: ${playerProfile.batting_average}`}
                />
                <StatCard
                  title="Strike Rate"
                  value={playerProfile.batting_strike_rate}
                  icon={TrendingUp}
                  accentColor="#38BDF8"
                  subtitle="Runs per 100 balls"
                />
                <StatCard
                  title="Highest Score"
                  value={playerProfile.highest_score}
                  icon={Award}
                  accentColor="#F59E0B"
                  subtitle="Best individual score"
                />
                <StatCard
                  title="Wickets"
                  value={playerProfile.total_wickets}
                  icon={Target}
                  accentColor="#A3E635"
                  subtitle={`Econ: ${playerProfile.bowling_economy}`}
                />
                <StatCard
                  title="Best Bowling"
                  value={playerProfile.best_bowling}
                  icon={Award}
                  accentColor="#EC4899"
                  subtitle="Figures in an innings"
                />
                <StatCard
                  title="50s / 100s"
                  value={`${playerProfile.batting.fifties} / ${playerProfile.batting.hundreds}`}
                  icon={Calendar}
                  accentColor="#8B5CF6"
                  subtitle="Milestone innings"
                />
              </div>

              {/* Sub-Tabs: Batting, Bowling, Season Performance */}
              <div className="flex border-b border-[#283241] gap-2 pb-2">
                <button
                  onClick={() => setProfileTab('batting')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                    profileTab === 'batting'
                      ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/20'
                      : 'text-[#94A3B8] hover:text-white bg-[#151B24]'
                  }`}
                >
                  TAB 1 — BATTING
                </button>
                <button
                  onClick={() => setProfileTab('bowling')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                    profileTab === 'bowling'
                      ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/20'
                      : 'text-[#94A3B8] hover:text-white bg-[#151B24]'
                  }`}
                >
                  TAB 2 — BOWLING
                </button>
                <button
                  onClick={() => setProfileTab('season')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                    profileTab === 'season'
                      ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/20'
                      : 'text-[#94A3B8] hover:text-white bg-[#151B24]'
                  }`}
                >
                  TAB 3 — SEASON PERFORMANCE
                </button>
              </div>

              {/* TAB 1: BATTING */}
              {profileTab === 'batting' && (
                <div className="space-y-6">
                  {/* Detailed Batting KPIs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="ipl-card p-4 text-center">
                      <div className="text-xs text-[#94A3B8] uppercase">Innings</div>
                      <div className="text-2xl font-black text-white mt-1">{playerProfile.batting.innings}</div>
                    </div>
                    <div className="ipl-card p-4 text-center">
                      <div className="text-xs text-[#94A3B8] uppercase">Fours (4s)</div>
                      <div className="text-2xl font-black text-[#38BDF8] mt-1">{playerProfile.batting.fours}</div>
                    </div>
                    <div className="ipl-card p-4 text-center">
                      <div className="text-xs text-[#94A3B8] uppercase">Sixes (6s)</div>
                      <div className="text-2xl font-black text-[#FF6B35] mt-1">{playerProfile.batting.sixes}</div>
                    </div>
                    <div className="ipl-card p-4 text-center">
                      <div className="text-xs text-[#94A3B8] uppercase">Not Outs</div>
                      <div className="text-2xl font-black text-[#A3E635] mt-1">{playerProfile.batting.not_outs}</div>
                    </div>
                  </div>

                  {/* Season Progression Chart */}
                  <div className="ipl-card p-5 space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Season-wise Runs Progression
                    </h4>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={playerProfile.batting.season_progression || []}>
                          <XAxis dataKey="season" stroke="#94A3B8" fontSize={10} tickLine={false} />
                          <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#151B24', borderColor: '#283241', color: '#fff', borderRadius: '8px' }}
                          />
                          <Bar name="Runs" dataKey="runs" fill="#FF6B35" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Season-wise Batting Performance Table */}
                  <div className="ipl-card p-5 space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Season-wise Batting Breakdown
                    </h4>
                    <div className="overflow-x-auto rounded-xl border border-[#283241] bg-[#0B0F14]">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#151B24] text-[#94A3B8] font-semibold border-b border-[#283241]">
                          <tr>
                            <th className="p-3">Season</th>
                            <th className="p-3 text-right">Innings</th>
                            <th className="p-3 text-right">Runs</th>
                            <th className="p-3 text-right">Balls</th>
                            <th className="p-3 text-right">4s</th>
                            <th className="p-3 text-right">6s</th>
                            <th className="p-3 text-right">50s</th>
                            <th className="p-3 text-right">100s</th>
                            <th className="p-3 text-right">SR</th>
                            <th className="p-3 text-right">Avg</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#283241]/60">
                          {playerProfile.batting.season_progression?.map((s, idx) => (
                            <tr key={idx} className="hover:bg-[#151B24]/70 transition">
                              <td className="p-3 font-bold text-white">{s.season}</td>
                              <td className="p-3 text-right text-white">{s.innings}</td>
                              <td className="p-3 text-right font-bold text-[#FF6B35]">{s.runs}</td>
                              <td className="p-3 text-right text-[#94A3B8]">{s.balls_faced}</td>
                              <td className="p-3 text-right text-white">{s.fours}</td>
                              <td className="p-3 text-right text-white">{s.sixes}</td>
                              <td className="p-3 text-right text-[#A3E635]">{s.fifties}</td>
                              <td className="p-3 text-right text-[#F59E0B] font-bold">{s.hundreds}</td>
                              <td className="p-3 text-right text-[#38BDF8]">{s.strike_rate}</td>
                              <td className="p-3 text-right text-white">{s.batting_average}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BOWLING */}
              {profileTab === 'bowling' && (
                <div className="space-y-6">
                  {playerProfile.bowling.innings === 0 ? (
                    <div className="p-8 rounded-xl bg-[#151B24] border border-[#283241] text-center text-[#94A3B8]">
                      This player has not bowled any legal overs in recorded matches.
                    </div>
                  ) : (
                    <>
                      {/* Detailed Bowling KPIs */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="ipl-card p-4 text-center">
                          <div className="text-xs text-[#94A3B8] uppercase">Overs Bowled</div>
                          <div className="text-2xl font-black text-white mt-1">{playerProfile.bowling.overs}</div>
                        </div>
                        <div className="ipl-card p-4 text-center">
                          <div className="text-xs text-[#94A3B8] uppercase">Dot Balls</div>
                          <div className="text-2xl font-black text-[#38BDF8] mt-1">{playerProfile.bowling.dot_balls}</div>
                        </div>
                        <div className="ipl-card p-4 text-center">
                          <div className="text-xs text-[#94A3B8] uppercase">Maidens</div>
                          <div className="text-2xl font-black text-[#A3E635] mt-1">{playerProfile.bowling.maidens}</div>
                        </div>
                        <div className="ipl-card p-4 text-center">
                          <div className="text-xs text-[#94A3B8] uppercase">4w / 5w Hauls</div>
                          <div className="text-2xl font-black text-[#FF6B35] mt-1">{playerProfile.bowling.four_wickets} / {playerProfile.bowling.five_wickets}</div>
                        </div>
                      </div>

                      {/* Season Bowling Wickets Chart */}
                      <div className="ipl-card p-5 space-y-4">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                          Season-wise Wickets Taken
                        </h4>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={playerProfile.bowling.season_progression || []}>
                              <XAxis dataKey="season" stroke="#94A3B8" fontSize={10} tickLine={false} />
                              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#151B24', borderColor: '#283241', color: '#fff', borderRadius: '8px' }}
                              />
                              <Bar name="Wickets" dataKey="wickets" fill="#A3E635" radius={[3, 3, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Season Bowling Table */}
                      <div className="ipl-card p-5 space-y-4">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                          Season-wise Bowling Breakdown
                        </h4>
                        <div className="overflow-x-auto rounded-xl border border-[#283241] bg-[#0B0F14]">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-[#151B24] text-[#94A3B8] font-semibold border-b border-[#283241]">
                              <tr>
                                <th className="p-3">Season</th>
                                <th className="p-3 text-right">Innings</th>
                                <th className="p-3 text-right">Wickets</th>
                                <th className="p-3 text-right">Runs Conceded</th>
                                <th className="p-3 text-right">Economy</th>
                                <th className="p-3 text-right">Average</th>
                                <th className="p-3 text-right">Strike Rate</th>
                                <th className="p-3 text-right">Dots</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#283241]/60">
                              {playerProfile.bowling.season_progression?.map((s, idx) => (
                                <tr key={idx} className="hover:bg-[#151B24]/70 transition">
                                  <td className="p-3 font-bold text-white">{s.season}</td>
                                  <td className="p-3 text-right text-white">{s.innings_bowled}</td>
                                  <td className="p-3 text-right font-bold text-[#A3E635]">{s.wickets}</td>
                                  <td className="p-3 text-right text-[#94A3B8]">{s.runs_conceded}</td>
                                  <td className="p-3 text-right font-semibold text-[#FF6B35]">{s.economy}</td>
                                  <td className="p-3 text-right text-white">{s.bowling_average}</td>
                                  <td className="p-3 text-right text-[#38BDF8]">{s.bowling_strike_rate}</td>
                                  <td className="p-3 text-right text-[#94A3B8]">{s.dot_balls}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 3: COMBINED SEASON PERFORMANCE */}
              {profileTab === 'season' && (
                <div className="ipl-card p-5 space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    Dual Season Progression (Runs vs Wickets)
                  </h4>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={playerProfile.batting.season_progression || []}>
                        <XAxis dataKey="season" stroke="#94A3B8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#151B24', borderColor: '#283241', color: '#fff', borderRadius: '8px' }}
                        />
                        <Legend />
                        <Line type="monotone" name="Runs" dataKey="runs" stroke="#FF6B35" strokeWidth={2.5} dot={{ r: 3 }} />
                        <Line type="monotone" name="Strike Rate" dataKey="strike_rate" stroke="#38BDF8" strokeWidth={2} dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ALL-TIME RANKINGS TAB */
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 rounded-xl bg-[#151B24] border border-[#283241] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex rounded-lg bg-[#0B0F14] p-1 border border-[#283241]">
              <button
                onClick={() => {
                  setRankingCategory('batting');
                  setRankingSortBy('runs');
                  setRankingPage(1);
                }}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${
                  rankingCategory === 'batting'
                    ? 'bg-[#FF6B35] text-white'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Batting Leaderboard
              </button>
              <button
                onClick={() => {
                  setRankingCategory('bowling');
                  setRankingSortBy('wickets');
                  setRankingPage(1);
                }}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${
                  rankingCategory === 'bowling'
                    ? 'bg-[#FF6B35] text-white'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Bowling Leaderboard
              </button>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <input
                type="text"
                value={rankingSearch}
                onChange={(e) => {
                  setRankingSearch(e.target.value);
                  setRankingPage(1);
                }}
                placeholder="Search leaderboard..."
                className="px-3 py-1.5 bg-[#0B0F14] border border-[#283241] rounded-lg text-xs text-white focus:outline-none focus:border-[#FF6B35] w-full sm:w-48"
              />
            </div>
          </div>

          {/* Leaderboard Table */}
          {rankingLoading ? (
            <div className="flex justify-center py-16">
              <RefreshCw className="w-8 h-8 text-[#FF6B35] animate-spin" />
            </div>
          ) : !rankingData || rankingData.data.length === 0 ? (
            <div className="p-8 rounded-xl bg-[#151B24] border border-[#283241] text-center text-[#94A3B8]">
              No records found matching criteria.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-[#283241] bg-[#151B24]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#1B2430] text-[#94A3B8] font-semibold border-b border-[#283241]">
                    <tr>
                      <th className="p-3">Rank</th>
                      <th className="p-3">Player</th>
                      <th className="p-3 text-right">Seasons</th>
                      <th className="p-3 text-right">Matches</th>
                      <th className="p-3 text-right">Innings</th>
                      {rankingCategory === 'batting' ? (
                        <>
                          <th 
                            className="p-3 text-right cursor-pointer hover:text-[#FF6B35]"
                            onClick={() => {
                              setRankingSortBy('runs');
                              setRankingOrder(rankingOrder === 'asc' ? 'desc' : 'asc');
                            }}
                          >
                            <span className="flex items-center justify-end gap-1 font-bold text-[#FF6B35]">
                              Runs <ArrowUpDown size={12} />
                            </span>
                          </th>
                          <th className="p-3 text-right">Balls</th>
                          <th 
                            className="p-3 text-right cursor-pointer hover:text-white"
                            onClick={() => {
                              setRankingSortBy('strike_rate');
                              setRankingOrder(rankingOrder === 'asc' ? 'desc' : 'asc');
                            }}
                          >
                            <span className="flex items-center justify-end gap-1">
                              SR <ArrowUpDown size={12} />
                            </span>
                          </th>
                          <th 
                            className="p-3 text-right cursor-pointer hover:text-white"
                            onClick={() => {
                              setRankingSortBy('batting_average');
                              setRankingOrder(rankingOrder === 'asc' ? 'desc' : 'asc');
                            }}
                          >
                            <span className="flex items-center justify-end gap-1">
                              Avg <ArrowUpDown size={12} />
                            </span>
                          </th>
                          <th className="p-3 text-right">50s</th>
                          <th className="p-3 text-right">100s</th>
                        </>
                      ) : (
                        <>
                          <th 
                            className="p-3 text-right cursor-pointer hover:text-[#A3E635]"
                            onClick={() => {
                              setRankingSortBy('wickets');
                              setRankingOrder(rankingOrder === 'asc' ? 'desc' : 'asc');
                            }}
                          >
                            <span className="flex items-center justify-end gap-1 font-bold text-[#A3E635]">
                              Wickets <ArrowUpDown size={12} />
                            </span>
                          </th>
                          <th className="p-3 text-right">Balls</th>
                          <th className="p-3 text-right">Runs Conc.</th>
                          <th 
                            className="p-3 text-right cursor-pointer hover:text-white"
                            onClick={() => {
                              setRankingSortBy('economy');
                              setRankingOrder(rankingOrder === 'asc' ? 'desc' : 'asc');
                            }}
                          >
                            <span className="flex items-center justify-end gap-1">
                              Economy <ArrowUpDown size={12} />
                            </span>
                          </th>
                          <th className="p-3 text-right">Avg</th>
                          <th className="p-3 text-right">SR</th>
                          <th className="p-3 text-right">Dots</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#283241]/60">
                    {rankingData.data.map((row, idx) => {
                      const rank = (rankingPage - 1) * rankingData.limit + idx + 1;
                      const playerName = rankingCategory === 'batting' ? row.batter : row.bowler;
                      return (
                        <tr 
                          key={idx}
                          onClick={() => {
                            setSelectedPlayer(playerName);
                            setSearchQuery(playerName);
                            setActiveTab('profile');
                          }}
                          className="hover:bg-[#1B2430]/70 cursor-pointer transition"
                        >
                          <td className="p-3 font-bold text-[#94A3B8]">#{rank}</td>
                          <td className="p-3 font-bold text-white hover:text-[#FF6B35]">
                            {playerName}
                          </td>
                          <td className="p-3 text-right text-[#94A3B8]">{row.seasons}</td>
                          <td className="p-3 text-right text-white">{row.matches}</td>
                          <td className="p-3 text-right text-white">{row.innings}</td>
                          {rankingCategory === 'batting' ? (
                            <>
                              <td className="p-3 text-right font-black text-[#FF6B35]">{row.runs.toLocaleString()}</td>
                              <td className="p-3 text-right text-[#94A3B8]">{row.balls}</td>
                              <td className="p-3 text-right text-[#38BDF8] font-medium">{row.strike_rate}</td>
                              <td className="p-3 text-right text-white font-medium">{row.batting_average}</td>
                              <td className="p-3 text-right text-[#A3E635]">{row.fifties}</td>
                              <td className="p-3 text-right text-[#F59E0B] font-bold">{row.hundreds}</td>
                            </>
                          ) : (
                            <>
                              <td className="p-3 text-right font-black text-[#A3E635]">{row.wickets}</td>
                              <td className="p-3 text-right text-[#94A3B8]">{row.legal_balls}</td>
                              <td className="p-3 text-right text-white">{row.runs_conceded}</td>
                              <td className="p-3 text-right text-[#FF6B35] font-medium">{row.economy}</td>
                              <td className="p-3 text-right text-white">{row.bowling_average}</td>
                              <td className="p-3 text-right text-[#38BDF8]">{row.bowling_strike_rate}</td>
                              <td className="p-3 text-right text-[#94A3B8]">{row.dot_balls}</td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between text-xs text-[#94A3B8] px-1">
                <div>
                  Showing {((rankingPage - 1) * rankingData.limit) + 1} to {Math.min(rankingPage * rankingData.limit, rankingData.total)} of {rankingData.total} players
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={rankingPage <= 1}
                    onClick={() => setRankingPage(p => p - 1)}
                    className="p-1.5 rounded-lg bg-[#151B24] border border-[#283241] disabled:opacity-40 hover:text-white"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="font-semibold text-white">
                    Page {rankingPage} of {rankingData.pages}
                  </span>
                  <button
                    disabled={rankingPage >= rankingData.pages}
                    onClick={() => setRankingPage(p => p + 1)}
                    className="p-1.5 rounded-lg bg-[#151B24] border border-[#283241] disabled:opacity-40 hover:text-white"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
