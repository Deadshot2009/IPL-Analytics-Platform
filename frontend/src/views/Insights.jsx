import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Activity, 
  Flame, 
  Target, 
  Shield, 
  MapPin, 
  Percent, 
  RefreshCw,
  Zap,
  BarChart2
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
  Line,
  Cell
} from 'recharts';
import StatCard from '../components/StatCard';

export default function Insights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeInsightTab, setActiveInsightTab] = useState('phases');

  useEffect(() => {
    async function fetchInsights() {
      try {
        setLoading(true);
        const res = await fetch('/api/insights/advanced');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load insights:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Advanced Cricket Analytics & Insights
        </h2>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          Phase dynamics, player coefficient of variation (CV%), chase probability models, and pitch favorability matrices
        </p>
      </div>

      {/* Insight Navigation Tabs */}
      <div className="flex gap-2 border-b border-[#283241] pb-2 overflow-x-auto scrollbar-thin">
        {[
          { id: 'phases', label: 'Phase-wise Analysis (Powerplay / Middle / Death)' },
          { id: 'chase', label: 'Chase Probability by Score Band' },
          { id: 'consistency', label: 'Player Consistency Models (CV%)' },
          { id: 'venues', label: 'Pitch Nature Classification' },
          { id: 'charts', label: 'Verified Analytical Visualizations' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveInsightTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
              activeInsightTab === tab.id
                ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/20'
                : 'text-[#94A3B8] hover:text-white bg-[#151B24]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading || !data ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="w-8 h-8 text-[#FF6B35] animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* TAB 1: PHASE PERFORMANCE */}
          {activeInsightTab === 'phases' && (
            <div className="space-y-6">
              {/* Phase Macro Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.phases.map((p, idx) => (
                  <div key={idx} className="ipl-card p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base font-extrabold text-white">{p.phase} Phase</span>
                      <span className="text-xs font-bold text-[#FF6B35]">
                        {p.phase === 'Powerplay' ? 'Overs 1 – 6' : p.phase === 'Middle' ? 'Overs 7 – 15' : 'Overs 16 – 20'}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-[#283241]">
                        <span className="text-[#94A3B8]">Run Rate</span>
                        <strong className="text-white text-sm">{p.avg_run_rate} RPO</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#283241]">
                        <span className="text-[#94A3B8]">Avg Runs in Phase</span>
                        <strong className="text-[#FF6B35]">{p.avg_runs} runs</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#283241]">
                        <span className="text-[#94A3B8]">Avg Wickets Lost</span>
                        <strong className="text-[#A3E635]">{p.avg_wickets} wkts</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#283241]">
                        <span className="text-[#94A3B8]">Dot Ball Percentage</span>
                        <strong className="text-white">{p.avg_dot_ball_pct}%</strong>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-[#94A3B8]">Tournament Runs Share</span>
                        <strong className="text-[#38BDF8]">{p.runs_share_pct}%</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Phase Comparison Chart */}
              <div className="ipl-card p-5 space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Phase Run Rate Comparison (RPO)
                </h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.phases}>
                      <XAxis dataKey="phase" stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#151B24', borderColor: '#283241', color: '#fff', borderRadius: '8px' }}
                      />
                      <Bar dataKey="avg_run_rate" fill="#FF6B35" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHASE PROBABILITY BY SCORE BAND */}
          {activeInsightTab === 'chase' && (
            <div className="space-y-6">
              <div className="ipl-card p-5 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    First Innings Score vs Chasing Success Probability
                  </h4>
                  <p className="text-xs text-[#94A3B8]">
                    Empirical win rates of chasing teams across 19 IPL seasons grouped by target brackets
                  </p>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.chase_by_score_band}>
                      <XAxis dataKey="first_innings_score_band" stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} unit="%" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#151B24', borderColor: '#283241', color: '#fff', borderRadius: '8px' }}
                        formatter={(val) => [`${val}%`, 'Chase Win Rate']}
                      />
                      <Bar dataKey="chase_win_pct" radius={[4, 4, 0, 0]}>
                        {data.chase_by_score_band.map((entry, idx) => (
                          <Cell 
                            key={`cell-${idx}`} 
                            fill={entry.chase_win_pct > 50 ? '#A3E635' : entry.chase_win_pct > 30 ? '#F59E0B' : '#EF4444'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Data Table */}
              <div className="ipl-card p-5 space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Score Band Probability Metrics
                </h4>
                <div className="overflow-x-auto rounded-xl border border-[#283241] bg-[#0B0F14]">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#151B24] text-[#94A3B8] font-semibold border-b border-[#283241]">
                      <tr>
                        <th className="p-3">Target Range</th>
                        <th className="p-3 text-right">Sample Matches</th>
                        <th className="p-3 text-right">Chasing Wins</th>
                        <th className="p-3 text-right">Chase Win %</th>
                        <th className="p-3">Defend Difficulty Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#283241]/60">
                      {data.chase_by_score_band.map((b, idx) => (
                        <tr key={idx} className="hover:bg-[#151B24]/70 transition">
                          <td className="p-3 font-bold text-white">{b.first_innings_score_band}</td>
                          <td className="p-3 text-right text-white">{b.matches}</td>
                          <td className="p-3 text-right text-[#A3E635] font-semibold">{b.chasing_wins}</td>
                          <td className="p-3 text-right font-black text-[#FF6B35]">{b.chase_win_pct}%</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              b.chase_win_pct > 60 ? 'bg-red-500/20 text-red-400' :
                              b.chase_win_pct > 40 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/20 text-emerald-400'
                            }`}>
                              {b.chase_win_pct > 60 ? 'Extreme Chaser Advantage' : b.chase_win_pct > 40 ? 'Evenly Balanced' : 'Fortress Total / Hard to Chase'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PLAYER CONSISTENCY (CV%) */}
          {activeInsightTab === 'consistency' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Most Consistent Batters */}
                <div className="ipl-card p-5 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
                      <span>Most Consistent Batters (Lowest CV%)</span>
                      <span className="text-[10px] text-[#A3E635]">Min. 5 Seasons & 1500+ Runs</span>
                    </h4>
                    <p className="text-xs text-[#94A3B8]">
                      Coefficient of Variation (CV% = σ / μ × 100) — lower indicates year-after-year run output stability
                    </p>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-[#283241] bg-[#0B0F14]">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#151B24] text-[#94A3B8] font-semibold border-b border-[#283241]">
                        <tr>
                          <th className="p-2.5">Batter</th>
                          <th className="p-2.5 text-right">Seasons</th>
                          <th className="p-2.5 text-right">Mean Runs</th>
                          <th className="p-2.5 text-right">Std Dev</th>
                          <th className="p-2.5 text-right font-bold text-[#A3E635]">CV %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#283241]/60">
                        {data.batter_consistency.map((b, idx) => (
                          <tr key={idx} className="hover:bg-[#151B24]/70 transition">
                            <td className="p-2.5 font-bold text-white">{b.batter}</td>
                            <td className="p-2.5 text-right text-white">{b.seasons}</td>
                            <td className="p-2.5 text-right font-semibold text-[#FF6B35]">{b.mean_runs}</td>
                            <td className="p-2.5 text-right text-[#94A3B8]">±{b.std_runs}</td>
                            <td className="p-2.5 text-right font-black text-[#A3E635]">{b.cv_pct}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Most Consistent Bowlers */}
                <div className="ipl-card p-5 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
                      <span>Most Consistent Bowlers (Lowest CV%)</span>
                      <span className="text-[10px] text-[#A3E635]">Min. 5 Seasons & 50+ Wickets</span>
                    </h4>
                    <p className="text-xs text-[#94A3B8]">
                      Wicket stability across multiple years with controlled economy
                    </p>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-[#283241] bg-[#0B0F14]">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#151B24] text-[#94A3B8] font-semibold border-b border-[#283241]">
                        <tr>
                          <th className="p-2.5">Bowler</th>
                          <th className="p-2.5 text-right">Seasons</th>
                          <th className="p-2.5 text-right">Mean Wkts</th>
                          <th className="p-2.5 text-right">Mean Econ</th>
                          <th className="p-2.5 text-right font-bold text-[#A3E635]">CV %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#283241]/60">
                        {data.bowler_consistency.map((bw, idx) => (
                          <tr key={idx} className="hover:bg-[#151B24]/70 transition">
                            <td className="p-2.5 font-bold text-white">{bw.bowler}</td>
                            <td className="p-2.5 text-right text-white">{bw.seasons}</td>
                            <td className="p-2.5 text-right font-semibold text-[#38BDF8]">{bw.mean_wickets}</td>
                            <td className="p-2.5 text-right text-white">{bw.mean_economy}</td>
                            <td className="p-2.5 text-right font-black text-[#A3E635]">{bw.cv_pct}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PITCH NATURE CLASSIFICATION */}
          {activeInsightTab === 'venues' && (
            <div className="ipl-card p-5 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Stadium Nature & Pitch Classification
                </h4>
                <p className="text-xs text-[#94A3B8]">
                  Statistical categorization into Batting-Friendly (≥165 runs / 8.6+ RPO), Bowling-Friendly (≤150 runs / ≤7.8 RPO), or Balanced
                </p>
              </div>
              <div className="overflow-x-auto rounded-xl border border-[#283241] bg-[#0B0F14]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#151B24] text-[#94A3B8] font-semibold border-b border-[#283241]">
                    <tr>
                      <th className="p-3">Stadium</th>
                      <th className="p-3 text-right">Matches</th>
                      <th className="p-3 text-right">Avg Score</th>
                      <th className="p-3 text-right">Run Rate</th>
                      <th className="p-3 text-right">Avg Sixes</th>
                      <th className="p-3">Classification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#283241]/60">
                    {data.venue_nature.map((v, idx) => (
                      <tr key={idx} className="hover:bg-[#151B24]/70 transition">
                        <td className="p-3 font-bold text-white">{v.venue}</td>
                        <td className="p-3 text-right text-white">{v.matches}</td>
                        <td className="p-3 text-right font-bold text-[#FF6B35]">{v.avg_score}</td>
                        <td className="p-3 text-right text-[#38BDF8]">{v.avg_run_rate}</td>
                        <td className="p-3 text-right text-[#A3E635]">{v.avg_sixes}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                            v.pitch_nature === 'Batting Friendly' ? 'bg-orange-500/20 text-[#FF6B35] border border-orange-500/30' :
                            v.pitch_nature === 'Bowling Friendly' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                            'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                          }`}>
                            {v.pitch_nature}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: VERIFIED ANALYTICAL CHARTS */}
          {activeInsightTab === 'charts' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: "Team Historical Wins Distribution", file: "team_wins.png" },
                  { title: "Season-wise Run Rate Evolution Trend", file: "season_run_rate_trend.png" },
                  { title: "Phase Run Rate Acceleration (PP vs Middle vs Death)", file: "phase_run_rate.png" },
                  { title: "Top Batters Career Runs", file: "top_batters.png" },
                  { title: "Top Bowlers Career Wickets", file: "top_bowlers.png" },
                  { title: "Venue Average Scoring Profiles", file: "venue_scoring.png" },
                  { title: "Chase Win Rate by 1st Innings Target", file: "chase_win_by_score.png" },
                  { title: "Team Season-by-Season Win Heatmap", file: "team_season_win_heatmap.png" }
                ].map((c, idx) => (
                  <div key={idx} className="ipl-card p-4 space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-white">
                      {c.title}
                    </h5>
                    <div className="rounded-xl overflow-hidden border border-[#283241] bg-[#0B0F14]">
                      <img 
                        src={`/charts/${c.file}`} 
                        alt={c.title} 
                        className="w-full h-auto object-cover hover:scale-105 transition duration-300" 
                        loading="lazy"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
