import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Calendar, 
  Shield, 
  Users, 
  Flame, 
  Target, 
  TrendingUp, 
  PieChart as PieIcon, 
  Filter, 
  ArrowRight,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import StatCard from '../components/StatCard';
import { getTeamMeta } from '../utils/teamColors';

export default function Overview({ onNavigate, onSelectMatch }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedVenue, setSelectedVenue] = useState('all');

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (selectedSeason !== 'all') params.append('season', selectedSeason);
      if (selectedTeam !== 'all') params.append('team', selectedTeam);
      if (selectedVenue !== 'all') params.append('venue', selectedVenue);

      const res = await fetch(`/api/overview?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load overview data');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [selectedSeason, selectedTeam, selectedVenue]);

  const COLORS = ['#FF6B35', '#A3E635', '#38BDF8', '#F59E0B', '#EC4899', '#8B5CF6'];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. HERO SECTION */}
      <div className="relative rounded-2xl overflow-hidden border border-[#283241] bg-gradient-to-br from-[#0E1520] via-[#111927] to-[#0B0F14] p-6 sm:p-10 shadow-2xl">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF6B35]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#A3E635]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B2430] border border-[#283241] text-xs font-semibold text-[#FF6B35]">
            <Sparkles size={14} />
            <span>PRODUCTION CRICKET SAAS ENGINE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            IPL <span className="text-[#FF6B35]">ANALYTICS</span>
          </h1>

          <p className="text-lg sm:text-xl font-medium text-slate-200">
            Explore Every Season. Every Team. Every Player.
          </p>

          <p className="text-sm text-[#94A3B8] leading-relaxed max-w-2xl">
            Discover the complete story of the Indian Premier League through historical match data, player statistics, team performance and advanced cricket analytics covering 19 seasons of world-class T20 cricket.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('matches')}
              className="px-5 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#E04F16] text-white text-sm font-bold shadow-lg shadow-[#FF6B35]/25 flex items-center gap-2 transition"
            >
              <span>Explore Matches</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onNavigate('seasons')}
              className="px-5 py-2.5 rounded-xl bg-[#151B24] hover:bg-[#1B2430] text-white text-sm font-bold border border-[#283241] hover:border-[#FF6B35]/50 flex items-center gap-2 transition"
            >
              <Calendar size={16} />
              <span>Explore Seasons</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. DASHBOARD FILTERS */}
      <div className="p-4 rounded-xl bg-[#151B24] border border-[#283241] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#94A3B8] self-start md:self-center">
          <Filter size={15} className="text-[#FF6B35]" />
          <span>Dashboard Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
          {/* Season Filter */}
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="px-3 py-2 bg-[#0B0F14] border border-[#283241] rounded-lg text-xs font-medium text-white focus:outline-none focus:border-[#FF6B35]"
          >
            <option value="all">All Seasons (2008–2026)</option>
            {data?.filters?.seasons?.map((s) => (
              <option key={s} value={s}>Season {s}</option>
            ))}
          </select>

          {/* Team Filter */}
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-3 py-2 bg-[#0B0F14] border border-[#283241] rounded-lg text-xs font-medium text-white focus:outline-none focus:border-[#FF6B35]"
          >
            <option value="all">All Teams</option>
            {data?.filters?.teams?.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Venue Filter */}
          <select
            value={selectedVenue}
            onChange={(e) => setSelectedVenue(e.target.value)}
            className="px-3 py-2 bg-[#0B0F14] border border-[#283241] rounded-lg text-xs font-medium text-white focus:outline-none focus:border-[#FF6B35] max-w-xs truncate"
          >
            <option value="all">All Venues</option>
            {data?.filters?.venues?.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. MAIN STATISTIC CARDS */}
      {loading && !data ? (
        <div className="flex justify-center py-16">
          <RefreshCw className="w-8 h-8 text-[#FF6B35] animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard
              title="Total Matches"
              value={data?.total_matches || 0}
              icon={Trophy}
              accentColor="#FF6B35"
              subtitle="Official IPL matches"
            />
            <StatCard
              title="Total Seasons"
              value={data?.total_seasons || 0}
              icon={Calendar}
              accentColor="#38BDF8"
              subtitle="2008 through 2026"
            />
            <StatCard
              title="Total Teams"
              value={data?.total_teams || 0}
              icon={Shield}
              accentColor="#A3E635"
              subtitle="Franchises competing"
            />
            <StatCard
              title="Total Players"
              value={data?.total_players || 0}
              icon={Users}
              accentColor="#F59E0B"
              subtitle="Capped & featured"
            />
            <StatCard
              title="Total Runs"
              value={data?.total_runs || 0}
              icon={Flame}
              accentColor="#EC4899"
              subtitle="Scored in tournament"
            />
            <StatCard
              title="Total Wickets"
              value={data?.total_wickets || 0}
              icon={Target}
              accentColor="#A3E635"
              subtitle="Bowler dismissals"
            />
          </div>

          {/* 4. DASHBOARD VISUALIZATIONS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Viz 1: Season-wise total runs (Line Chart) */}
            <div className="ipl-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Season-wise Total Runs
                  </h3>
                  <p className="text-xs text-[#94A3B8]">Historical aggregate scoring growth</p>
                </div>
                <TrendingUp className="w-5 h-5 text-[#FF6B35]" />
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.season_runs || []}>
                    <XAxis dataKey="season" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#151B24', borderColor: '#283241', color: '#fff', borderRadius: '8px' }}
                      formatter={(val) => [val.toLocaleString(), 'Runs']}
                    />
                    <Line type="monotone" dataKey="runs" stroke="#FF6B35" strokeWidth={3} dot={{ r: 3, fill: '#FF6B35' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Viz 2: Team-wise total wins (Bar Chart) */}
            <div className="ipl-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Team-wise Total Wins
                  </h3>
                  <p className="text-xs text-[#94A3B8]">Top franchise win counts</p>
                </div>
                <Trophy className="w-5 h-5 text-[#A3E635]" />
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.team_wins || []} layout="vertical">
                    <XAxis type="number" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis dataKey="team" type="category" stroke="#94A3B8" fontSize={10} width={90} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#151B24', borderColor: '#283241', color: '#fff', borderRadius: '8px' }}
                      formatter={(val) => [val, 'Wins']}
                    />
                    <Bar dataKey="wins" fill="#A3E635" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Viz 3: Top 10 run scorers (Horizontal Bar Chart) */}
            <div className="ipl-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Top 10 All-Time Run Scorers
                  </h3>
                  <p className="text-xs text-[#94A3B8]">Highest run aggregates in IPL history</p>
                </div>
                <Flame className="w-5 h-5 text-[#FF6B35]" />
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.top_batters || []} layout="vertical">
                    <XAxis type="number" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis dataKey="player" type="category" stroke="#94A3B8" fontSize={10} width={90} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#151B24', borderColor: '#283241', color: '#fff', borderRadius: '8px' }}
                      formatter={(val) => [val.toLocaleString(), 'Runs']}
                    />
                    <Bar dataKey="runs" fill="#FF6B35" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Viz 4: Top 10 wicket takers (Horizontal Bar Chart) */}
            <div className="ipl-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Top 10 All-Time Wicket Takers
                  </h3>
                  <p className="text-xs text-[#94A3B8]">Leading wicket takers across all seasons</p>
                </div>
                <Target className="w-5 h-5 text-[#38BDF8]" />
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.top_bowlers || []} layout="vertical">
                    <XAxis type="number" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis dataKey="player" type="category" stroke="#94A3B8" fontSize={10} width={90} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#151B24', borderColor: '#283241', color: '#fff', borderRadius: '8px' }}
                      formatter={(val) => [val, 'Wickets']}
                    />
                    <Bar dataKey="wickets" fill="#38BDF8" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Viz 5: Toss Decision Distribution (Donut Chart) */}
            <div className="ipl-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Toss Decision Distribution
                  </h3>
                  <p className="text-xs text-[#94A3B8]">Captain preferences (Field vs Bat)</p>
                </div>
                <PieIcon className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.toss_distribution || []}
                      dataKey="count"
                      nameKey="decision"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {data?.toss_distribution?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#38BDF8' : '#FF6B35'} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#151B24', borderColor: '#283241', color: '#fff', borderRadius: '8px' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Viz 6: Batting First vs Chasing Wins (Comparison Donut) */}
            <div className="ipl-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Defend vs Chase Win Outcomes
                  </h3>
                  <p className="text-xs text-[#94A3B8]">Match outcome based on innings strategy</p>
                </div>
                <Shield className="w-5 h-5 text-[#A3E635]" />
              </div>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.bat_first_vs_chasing || []}
                      dataKey="wins"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {data?.bat_first_vs_chasing?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#151B24', borderColor: '#283241', color: '#fff', borderRadius: '8px' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Viz 7: Season-wise average scoring (Line Chart) */}
            <div className="ipl-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Season-wise Average Scoring
                  </h3>
                  <p className="text-xs text-[#94A3B8]">1st vs 2nd Innings average match scores</p>
                </div>
                <TrendingUp className="w-5 h-5 text-[#A3E635]" />
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data?.season_avg_scoring || []}>
                    <XAxis dataKey="season" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#151B24', borderColor: '#283241', color: '#fff', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Line type="monotone" name="1st Innings Avg" dataKey="avg_1st" stroke="#FF6B35" strokeWidth={2.5} dot={{ r: 2 }} />
                    <Line type="monotone" name="2nd Innings Avg" dataKey="avg_2nd" stroke="#38BDF8" strokeWidth={2.5} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Viz 8: Highest Team Totals */}
            <div className="ipl-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Highest Team Totals
                  </h3>
                  <p className="text-xs text-[#94A3B8]">Record tournament innings scores</p>
                </div>
                <Trophy className="w-5 h-5 text-[#FF6B35]" />
              </div>
              <div className="space-y-2 overflow-y-auto max-h-64 pr-1">
                {data?.highest_totals?.map((t, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectMatch(t.match_id)}
                    className="p-3 rounded-lg bg-[#0B0F14] border border-[#283241] hover:border-[#FF6B35]/40 flex items-center justify-between cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-xs font-bold text-[#94A3B8]">#{idx + 1}</span>
                      <div>
                        <div className="text-xs font-bold text-white">{t.team}</div>
                        <div className="text-[11px] text-[#94A3B8]">vs {t.opponent} • {t.season}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-[#FF6B35]">{t.score}</div>
                      <div className="text-[10px] text-[#94A3B8]">{t.overs} overs</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
