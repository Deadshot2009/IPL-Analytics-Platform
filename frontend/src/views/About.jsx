import React from 'react';
import { Database, FileText, Cpu, CheckCircle2, Shield, Flame, Activity } from 'lucide-react';

export default function About() {
  return (
    <div className="space-y-8 pb-12 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          About the IPL Analytics Platform
        </h2>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          Architecture, verified data integrity, statistical methodologies, and data dictionary
        </p>
      </div>

      {/* Platform Architecture Overview */}
      <div className="ipl-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#FF6B35]/10 border border-[#FF6B35]/30">
            <Cpu className="w-6 h-6 text-[#FF6B35]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Full-Stack SaaS Architecture</h3>
            <p className="text-xs text-[#94A3B8]">Engineered for high performance, dynamic calculations, and millisecond query latency</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-4 rounded-xl bg-[#0B0F14] border border-[#283241] space-y-1.5">
            <span className="font-bold text-[#FF6B35] uppercase text-[10px]">Data Processing Engine</span>
            <div className="text-white font-semibold">Stage 2 & Stage 4 Pipeline</div>
            <p className="text-[#94A3B8]">
              Cleaned, feature-engineered CSV datasets integrated into an optimized, indexed SQLite database running in WAL mode.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0F14] border border-[#283241] space-y-1.5">
            <span className="font-bold text-[#38BDF8] uppercase text-[10px]">Backend API</span>
            <div className="text-white font-semibold">Python FastAPI Core</div>
            <p className="text-[#94A3B8]">
              High-throughput async REST endpoints providing parametric filtering, player autocomplete, scorecards, and aggregations.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0F14] border border-[#283241] space-y-1.5">
            <span className="font-bold text-[#A3E635] uppercase text-[10px]">Client Presentation</span>
            <div className="text-white font-semibold">React + Vite + Tailwind CSS</div>
            <p className="text-[#94A3B8]">
              Sports-themed dark UI (`#0B0F14`, `#151B24`, `#FF6B35`), responsive layouts, interactive Recharts, and live scorecards.
            </p>
          </div>
        </div>
      </div>

      {/* Verified Integrity Rules */}
      <div className="ipl-card p-6 space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#A3E635]" />
          <span>Data Integrity & Cricket Analytics Standards</span>
        </h3>

        <div className="space-y-3 text-xs text-[#94A3B8]">
          <div className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-[#A3E635] mt-1 shrink-0"></span>
            <div>
              <strong className="text-white">Authentic IPL Records:</strong> Zero simulated or fabricated matches. All 1,243 fixtures and 295,732 deliveries are sourced directly from official Cricsheet and BCCI feeds (2008 to 2026).
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-[#FF6B35] mt-1 shrink-0"></span>
            <div>
              <strong className="text-white">Mathematically Correct Cricket Statistics:</strong> Batting averages are computed as <code className="text-[#FF6B35]">Total Runs / Dismissals</code> (handling not-outs with precision). Bowling economy rates are computed as <code className="text-[#FF6B35]">(Runs Conceded / Legal Balls) * 6</code>. Runouts are correctly excluded from bowler wickets.
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-[#38BDF8] mt-1 shrink-0"></span>
            <div>
              <strong className="text-white">Phase Categorization:</strong> Powerplay covers Overs 1–6 (deliveries 0.1 to 5.6), Middle covers Overs 7–15 (deliveries 6.1 to 14.6), and Death covers Overs 16–20 (deliveries 15.1 to 19.6).
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] mt-1 shrink-0"></span>
            <div>
              <strong className="text-white">Franchise Identity Transparency:</strong> Rebranded franchises (e.g., Delhi Daredevils → Delhi Capitals, Kings XI Punjab → Punjab Kings, Royal Challengers Bangalore → Royal Challengers Bengaluru) are preserved in their authentic season contexts while supporting combined historical franchise records.
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Summary */}
      <div className="ipl-card p-6 space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Database className="w-5 h-5 text-[#FF6B35]" />
          <span>Integrated Dataset Inventory</span>
        </h3>

        <div className="overflow-x-auto rounded-xl border border-[#283241] bg-[#0B0F14]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#151B24] text-[#94A3B8] font-semibold border-b border-[#283241]">
              <tr>
                <th className="p-3">Dataset Name</th>
                <th className="p-3">Grain</th>
                <th className="p-3 text-right">Rows</th>
                <th className="p-3 text-right">Columns</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#283241]/60">
              <tr>
                <td className="p-3 font-semibold text-white">base/matches.csv</td>
                <td className="p-3 text-[#94A3B8]">Match level</td>
                <td className="p-3 text-right font-bold text-[#FF6B35]">1,243</td>
                <td className="p-3 text-right text-white">45</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">base/deliveries.csv</td>
                <td className="p-3 text-[#94A3B8]">Ball-by-ball level</td>
                <td className="p-3 text-right font-bold text-[#FF6B35]">295,732</td>
                <td className="p-3 text-right text-white">41</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">base/batter_scorecard.csv</td>
                <td className="p-3 text-[#94A3B8]">Batter innings</td>
                <td className="p-3 text-right font-bold text-[#FF6B35]">18,837</td>
                <td className="p-3 text-right text-white">44</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">base/bowler_scorecard.csv</td>
                <td className="p-3 text-[#94A3B8]">Bowler innings</td>
                <td className="p-3 text-right font-bold text-[#FF6B35]">14,734</td>
                <td className="p-3 text-right text-white">40</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">analytics/match_phase_features.csv</td>
                <td className="p-3 text-[#94A3B8]">Phase level</td>
                <td className="p-3 text-right font-bold text-[#FF6B35]">7,338</td>
                <td className="p-3 text-right text-white">16</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">analytics/batting_features_player_season.csv</td>
                <td className="p-3 text-[#94A3B8]">Player-season</td>
                <td className="p-3 text-right font-bold text-[#FF6B35]">2,959</td>
                <td className="p-3 text-right text-white">17</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">analytics/bowling_features_player_season.csv</td>
                <td className="p-3 text-[#94A3B8]">Bowler-season</td>
                <td className="p-3 text-right font-bold text-[#FF6B35]">2,201</td>
                <td className="p-3 text-right text-white">15</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">stage4/player_batting_leaderboard.csv</td>
                <td className="p-3 text-[#94A3B8]">All-time batter</td>
                <td className="p-3 text-right font-bold text-[#FF6B35]">738</td>
                <td className="p-3 text-right text-white">14</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-white">stage4/player_bowling_leaderboard.csv</td>
                <td className="p-3 text-[#94A3B8]">All-time bowler</td>
                <td className="p-3 text-right font-bold text-[#FF6B35]">577</td>
                <td className="p-3 text-right text-white">12</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-[#94A3B8]">
          Refer to the root documentation file <code className="text-[#FF6B35]">PROJECT_DATA_DICTIONARY.md</code> for full column-level schemas, keys, data types, and null tolerances.
        </p>
      </div>
    </div>
  );
}
