import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Trophy, 
  TrendingUp, 
  Swords, 
  Percent, 
  Calendar, 
  Users, 
  RefreshCw,
  Search
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';
import StatCard from '../components/StatCard';
import { getTeamMeta } from '../utils/teamColors';

export default function Teams({ onSelectMatch }) {
  const [teamsList, setTeamsList] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('Mumbai Indians');
  const [teamDetail, setTeamDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  // Head to Head state
  const [h2hTeam1, setH2hTeam1] = useState('Mumbai Indians');
  const [h2hTeam2, setH2hTeam2] = useState('Chennai Super Kings');
  const [h2hData, setH2hData] = useState(null);
  const [h2hLoading, setH2hLoading] = useState(false);

  // Active sub-tab: 'overview' or 'head-to-head'
  const [subTab, setSubTab] = useState('overview');

  // Load teams list
  useEffect(() => {
    async function loadTeams() {
      try {
        const res = await fetch('/api/teams');
        if (res.ok) {
          const data = await res.json();
          setTeamsList(data);
          if (data.length > 0 && !selectedTeam) {
            setSelectedTeam(data[0].team);
          }
        }
      } catch (err) {
        console.error("Failed to load teams:", err);
      }
    }
    loadTeams();
  }, []);

  // Load team detail
  useEffect(() => {
    async function loadTeamDetail() {
      if (!selectedTeam) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/teams/${encodeURIComponent(selectedTeam)}`);
        if (res.ok) {
          const data = await res.json();
          setTeamDetail(data);
        }
      } catch (err) {
        console.error("Failed to load team detail:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTeamDetail();
  }, [selectedTeam]);

  // Load Head-to-Head
  useEffect(() => {
    async function loadH2H() {
      if (!h2hTeam1 || !h2hTeam2 || h2hTeam1 === h2hTeam2) return;
      try {
        setH2hLoading(true);
        const res = await fetch(`/api/teams/head-to-head?team1=${encodeURIComponent(h2hTeam1)}&team2=${encodeURIComponent(h2hTeam2)}`);
        if (res.ok) {
          const data = await res.json();
          setH2hData(data);
        }
      } catch (err) {
        console.error("Failed to load H2H:", err);
      } finally {
        setH2hLoading(false);
      }
    }
    if (subTab === 'head-to-head') {
      loadH2H();
    }
  }, [h2hTeam1, h2hTeam2, subTab]);

  const teamMeta = getTeamMeta(selectedTeam);

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Sub-tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Team Analytics & Performance
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Comprehensive franchise statistics, seasonal records, and head-to-head battles
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-[#151B24] p-1 border border-[#283241]">
          <button
            onClick={() => setSubTab('overview')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              subTab === 'overview'
                ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/20'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Team Profile
          </button>
          <button
            onClick={() => setSubTab('head-to-head')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              subTab === 'head-to-head'
                ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/20'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <Swords size={14} />
            <span>Head-to-Head</span>
          </button>
        </div>
      </div>

      {subTab === 'overview' ? (
        <>
          {/* Team Selector Ribbon */}
          <div className="p-4 rounded-xl bg-[#151B24] border border-[#283241] space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              Select Franchise
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {teamsList.map((t) => {
                const meta = getTeamMeta(t.team);
                const isSelected = selectedTeam === t.team;
                return (
                  <button
                    key={t.team}
                    onClick={() => setSelectedTeam(t.team)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-2 border transition ${
                      isSelected
                        ? 'border-[#FF6B35] bg-[#1B2430] text-white shadow-md'
                        : 'border-[#283241] bg-[#0B0F14] text-[#94A3B8] hover:text-white hover:border-[#FF6B35]/40'
                    }`}
                  >
                    <span 
                      className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black"
                      style={{ backgroundColor: meta.primary, color: meta.text }}
                    >
                      {meta.short}
                    </span>
                    <span>{t.team}</span>
                    {t.titles > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#FF6B35]/20 text-[#FF6B35] font-bold">
                        ★ {t.titles}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {loading || !teamDetail ? (
            <div className="flex justify-center py-20">
              <RefreshCw className="w-8 h-8 text-[#FF6B35] animate-spin" />
            </div>
          ) : (
            <>
              {/* Team Hero Card */}
              <div 
                className="p-6 rounded-2xl border border-[#283241] relative overflow-hidden"
                style={{ 
                  background: `linear-gradient(135deg, ${teamMeta.primary}22, #151B24 60%, #0B0F14)`
                }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black shadow-xl border border-white/20"
                      style={{ backgroundColor: teamMeta.primary, color: teamMeta.text }}
                    >
                      {teamMeta.short}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-2xl font-black text-white">{teamDetail.team}</h3>
                        {teamDetail.titles > 0 && (
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FF6B35]/20 border border-[#FF6B35]/40 text-xs font-bold text-[#FF6B35]">
                            <Trophy size={13} />
                            <span>{teamDetail.titles} {teamDetail.titles === 1 ? 'Title' : 'Titles'}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-[#94A3B8] mt-1">
                        Historical Record: {teamDetail.wins} Wins / {teamDetail.losses} Losses / {teamDetail.no_results} No Results ({teamDetail.win_percentage}% Win Rate)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                <StatCard
                  title="Total Matches"
                  value={teamDetail.total_matches}
                  icon={Shield}
                  accentColor="#38BDF8"
                />
                <StatCard
                  title="Matches Won"
                  value={teamDetail.wins}
                  icon={Trophy}
                  accentColor="#A3E635"
                />
                <StatCard
                  title="Win Percentage"
                  value={`${teamDetail.win_percentage}%`}
                  icon={Percent}
                  accentColor="#FF6B35"
                />
                <StatCard
                  title="Bat 1st Win Rate"
                  value={`${teamDetail.batting_first.win_pct}%`}
                  icon={TrendingUp}
                  accentColor="#F59E0B"
                  subtitle={`${teamDetail.batting_first.wins} of ${teamDetail.batting_first.matches} matches`}
                />
                <StatCard
                  title="Chase Win Rate"
                  value={`${teamDetail.chasing.win_pct}%`}
                  icon={TrendingUp}
                  accentColor="#EC4899"
                  subtitle={`${teamDetail.chasing.wins} of ${teamDetail.chasing.matches} matches`}
                />
                <StatCard
                  title="IPL Trophies"
                  value={teamDetail.titles}
                  icon={Trophy}
                  accentColor="#FF6B35"
                  subtitle="Championship wins"
                />
              </div>

              {/* Visualizations Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Season Performance Chart */}
                <div className="ipl-card p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        Season-wise Performance
                      </h4>
                      <p className="text-xs text-[#94A3B8]">Matches played vs wins per season</p>
                    </div>
                    <Calendar className="w-5 h-5 text-[#FF6B35]" />
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={teamDetail.seasons_performance || []}>
                        <XAxis dataKey="season" stroke="#94A3B8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#151B24', borderColor: '#283241', color: '#fff', borderRadius: '8px' }}
                        />
                        <Legend />
                        <Bar name="Matches" dataKey="matches" fill="#283241" radius={[3, 3, 0, 0]} />
                        <Bar name="Wins" dataKey="wins" fill="#FF6B35" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Wins and Losses Comparison */}
                <div className="ipl-card p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        Wins vs Losses Ratio
                      </h4>
                      <p className="text-xs text-[#94A3B8]">Overall match outcome breakdown</p>
                    </div>
                    <Percent className="w-5 h-5 text-[#A3E635]" />
                  </div>
                  <div className="h-64 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Wins", value: teamDetail.wins },
                            { name: "Losses", value: teamDetail.losses },
                            { name: "No Result", value: teamDetail.no_results }
                          ]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={4}
                        >
                          <Cell fill="#A3E635" />
                          <Cell fill="#EF4444" />
                          <Cell fill="#94A3B8" />
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#151B24', borderColor: '#283241', color: '#fff', borderRadius: '8px' }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Highest Team Totals */}
              <div className="ipl-card p-5 space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Highest Team Totals Recorded
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {teamDetail.highest_totals?.map((tot, idx) => (
                    <div 
                      key={idx}
                      onClick={() => onSelectMatch(tot.match_id)}
                      className="p-3 rounded-xl bg-[#0B0F14] border border-[#283241] hover:border-[#FF6B35]/50 cursor-pointer transition text-center"
                    >
                      <div className="text-xs font-semibold text-[#94A3B8]">vs {tot.opponent}</div>
                      <div className="text-lg font-black text-[#FF6B35] my-1">{tot.score}</div>
                      <div className="text-[11px] text-[#94A3B8]">{tot.season} • {tot.overs} ov</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Season Performance Table */}
              <div className="ipl-card p-5 space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Verified Season-by-Season Performance Table
                </h4>
                <div className="overflow-x-auto rounded-xl border border-[#283241] bg-[#0B0F14]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#151B24] text-[#94A3B8] font-semibold border-b border-[#283241]">
                      <tr>
                        <th className="p-3">Season</th>
                        <th className="p-3 text-right">Matches</th>
                        <th className="p-3 text-right">Wins</th>
                        <th className="p-3 text-right">Losses</th>
                        <th className="p-3 text-right">Win %</th>
                        <th className="p-3 text-right">Total Runs</th>
                        <th className="p-3 text-right">Avg Score</th>
                        <th className="p-3 text-right">Run Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#283241]/60">
                      {teamDetail.seasons_performance?.map((s, idx) => (
                        <tr key={idx} className="hover:bg-[#151B24]/70 transition">
                          <td className="p-3 font-bold text-white">{s.season}</td>
                          <td className="p-3 text-right text-white">{s.matches}</td>
                          <td className="p-3 text-right font-bold text-[#A3E635]">{s.wins}</td>
                          <td className="p-3 text-right text-[#EF4444]">{s.losses}</td>
                          <td className="p-3 text-right font-semibold text-[#FF6B35]">{s.win_pct}%</td>
                          <td className="p-3 text-right text-[#94A3B8]">{s.total_runs.toLocaleString()}</td>
                          <td className="p-3 text-right text-white">{s.avg_score}</td>
                          <td className="p-3 text-right text-[#38BDF8]">{s.avg_run_rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        /* HEAD TO HEAD SUB-TAB */
        <div className="space-y-6">
          {/* Team Selectors for H2H */}
          <div className="p-6 rounded-2xl bg-[#151B24] border border-[#283241] space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8]">
              Select Two Franchises for Head-to-Head Comparison
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#94A3B8] font-semibold mb-1 block">Team A</label>
                <select
                  value={h2hTeam1}
                  onChange={(e) => setH2hTeam1(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0B0F14] border border-[#283241] rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-[#FF6B35]"
                >
                  {teamsList.map((t) => (
                    <option key={t.team} value={t.team}>{t.team}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-[#94A3B8] font-semibold mb-1 block">Team B</label>
                <select
                  value={h2hTeam2}
                  onChange={(e) => setH2hTeam2(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#0B0F14] border border-[#283241] rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-[#FF6B35]"
                >
                  {teamsList.map((t) => (
                    <option key={t.team} value={t.team}>{t.team}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {h2hLoading || !h2hData ? (
            <div className="flex justify-center py-16">
              <RefreshCw className="w-8 h-8 text-[#FF6B35] animate-spin" />
            </div>
          ) : (
            <>
              {/* Head-to-Head Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-[#151B24] to-[#1B2430] border border-[#283241] text-center">
                <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                  {/* Team A */}
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg border border-white/20 mb-2"
                      style={{ 
                        backgroundColor: getTeamMeta(h2hData.team1).primary, 
                        color: getTeamMeta(h2hData.team1).text 
                      }}
                    >
                      {getTeamMeta(h2hData.team1).short}
                    </div>
                    <h4 className="text-lg font-bold text-white">{h2hData.team1}</h4>
                    <span className="text-3xl font-black text-[#FF6B35] mt-1">{h2hData.team1_wins} Wins</span>
                    <span className="text-xs text-[#94A3B8]">({h2hData.team1_win_pct}%)</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="px-4 py-1 rounded-full bg-[#0B0F14] border border-[#283241] text-xs font-bold text-[#94A3B8]">
                      {h2hData.total_matches} Total Encounters
                    </span>
                    <span className="text-xs text-[#94A3B8] mt-1">
                      {h2hData.no_results} Ties / No Results
                    </span>
                  </div>

                  {/* Team B */}
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black shadow-lg border border-white/20 mb-2"
                      style={{ 
                        backgroundColor: getTeamMeta(h2hData.team2).primary, 
                        color: getTeamMeta(h2hData.team2).text 
                      }}
                    >
                      {getTeamMeta(h2hData.team2).short}
                    </div>
                    <h4 className="text-lg font-bold text-white">{h2hData.team2}</h4>
                    <span className="text-3xl font-black text-[#A3E635] mt-1">{h2hData.team2_wins} Wins</span>
                    <span className="text-xs text-[#94A3B8]">({h2hData.team2_win_pct}%)</span>
                  </div>
                </div>
              </div>

              {/* Season-by-Season Head-to-Head Breakdown */}
              <div className="ipl-card p-5 space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Season-wise Head-to-Head Performance
                </h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={h2hData.season_breakdown || []}>
                      <XAxis dataKey="season" stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#151B24', borderColor: '#283241', color: '#fff', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Bar name={`${h2hData.team1} Wins`} dataKey="team1_wins" fill="#FF6B35" />
                      <Bar name={`${h2hData.team2} Wins`} dataKey="team2_wins" fill="#A3E635" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* All Matches History */}
              <div className="ipl-card p-5 space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  All Head-to-Head Encounters ({h2hData.matches.length})
                </h4>
                <div className="space-y-2 overflow-y-auto max-h-96 pr-1">
                  {h2hData.matches.map((m) => (
                    <div 
                      key={m.match_id}
                      onClick={() => onSelectMatch(m.match_id)}
                      className="p-3.5 rounded-xl bg-[#0B0F14] border border-[#283241] hover:border-[#FF6B35]/50 flex items-center justify-between cursor-pointer transition text-xs"
                    >
                      <div>
                        <div className="font-semibold text-white">
                          {m.season} • {m.date} • {m.venue}
                        </div>
                        <div className="text-[#94A3B8] text-[11px] mt-0.5">
                          Winner: <strong className="text-white">{m.winner}</strong> won by {m.win_margin} {m.win_type}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-1 rounded-md bg-[#1B2430] border border-[#283241] text-[#FF6B35] font-semibold text-[11px]">
                          Scorecard →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
