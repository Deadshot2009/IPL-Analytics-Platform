import React, { useState, useEffect } from 'react';
import { X, Trophy, Award, MapPin, Calendar, Clock, RefreshCw } from 'lucide-react';
import { getTeamMeta } from '../utils/teamColors';

export default function MatchDetailModal({ matchId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeInnings, setActiveInnings] = useState(1);

  useEffect(() => {
    async function fetchMatch() {
      try {
        setLoading(true);
        const res = await fetch(`/api/matches/${matchId}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load match detail:", err);
      } finally {
        setLoading(false);
      }
    }
    if (matchId) {
      fetchMatch();
    }
  }, [matchId]);

  if (!matchId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0E131A] border border-[#283241] rounded-2xl shadow-2xl overflow-y-auto flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 bg-[#151B24] border-b border-[#283241]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#FF6B35]/10 border border-[#FF6B35]/30">
              <Trophy className="w-5 h-5 text-[#FF6B35]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Match #{matchId} Scorecard
              </h3>
              <p className="text-xs text-[#94A3B8]">
                {data ? `${data.match.season} • ${data.match.venue}` : "Loading match details..."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#1B2430] border border-transparent hover:border-[#283241] transition"
          >
            <X size={20} />
          </button>
        </div>

        {loading || !data ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#94A3B8]">
            <RefreshCw className="w-8 h-8 text-[#FF6B35] animate-spin" />
            <p className="text-sm">Retrieving full ball-by-ball scorecard...</p>
          </div>
        ) : (
          <div className="p-5 sm:p-6 space-y-6">
            {/* Match Summary Banner */}
            <div className="p-5 rounded-xl bg-gradient-to-r from-[#151B24] to-[#1B2430] border border-[#283241]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Team 1 */}
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm border shadow"
                    style={{ 
                      backgroundColor: getTeamMeta(data.match.team1).primary,
                      borderColor: getTeamMeta(data.match.team1).accent,
                      color: getTeamMeta(data.match.team1).text
                    }}
                  >
                    {getTeamMeta(data.match.team1).short}
                  </div>
                  <div>
                    <div className="text-base font-bold text-white">{data.match.team1}</div>
                    <div className="text-sm font-semibold text-[#FF6B35]">
                      {data.match.first_innings_score ? `${data.match.first_innings_score} Runs` : "Score N/A"}
                    </div>
                  </div>
                </div>

                <div className="text-center px-4 py-1.5 rounded-full bg-[#0B0F14] border border-[#283241] text-xs font-semibold text-[#94A3B8]">
                  VS
                </div>

                {/* Team 2 */}
                <div className="flex items-center gap-3 text-center sm:text-right flex-row-reverse">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm border shadow"
                    style={{ 
                      backgroundColor: getTeamMeta(data.match.team2).primary,
                      borderColor: getTeamMeta(data.match.team2).accent,
                      color: getTeamMeta(data.match.team2).text
                    }}
                  >
                    {getTeamMeta(data.match.team2).short}
                  </div>
                  <div>
                    <div className="text-base font-bold text-white">{data.match.team2}</div>
                    <div className="text-sm font-semibold text-[#A3E635]">
                      {data.match.second_innings_score ? `${data.match.second_innings_score} Runs` : "Score N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Match Result Banner */}
              <div className="mt-4 pt-4 border-t border-[#283241] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-white font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#A3E635]"></span>
                  {data.match.winner ? (
                    <span>
                      Winner: <strong className="text-[#A3E635]">{data.match.winner}</strong> won by {data.match.win_margin} {data.match.win_type}
                    </span>
                  ) : (
                    <span>Result: <strong className="text-[#FF6B35]">{data.match.result || "No Result / Tie"}</strong></span>
                  )}
                </div>

                {data.match.player_of_match && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0B0F14] border border-[#283241] text-[#FF6B35] font-semibold">
                    <Award size={14} />
                    <span>Player of Match: {data.match.player_of_match}</span>
                  </div>
                )}
              </div>

              <div className="mt-2 text-[11px] text-[#94A3B8]">
                Toss: {data.match.toss_winner} elected to {data.match.toss_decision} first
              </div>
            </div>

            {/* Innings Switcher Tabs */}
            <div className="flex gap-2 border-b border-[#283241] pb-2">
              <button
                onClick={() => setActiveInnings(1)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  activeInnings === 1
                    ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/20'
                    : 'text-[#94A3B8] hover:text-white bg-[#151B24]'
                }`}
              >
                1st Innings ({data.match.team1}) — {data.innings_1.runs}/{data.innings_1.wickets}
              </button>
              <button
                onClick={() => setActiveInnings(2)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  activeInnings === 2
                    ? 'bg-[#FF6B35] text-white shadow-md shadow-[#FF6B35]/20'
                    : 'text-[#94A3B8] hover:text-white bg-[#151B24]'
                }`}
              >
                2nd Innings ({data.match.team2}) — {data.innings_2.runs}/{data.innings_2.wickets}
              </button>
            </div>

            {/* Active Innings Content */}
            {(() => {
              const currentInnings = activeInnings === 1 ? data.innings_1 : data.innings_2;
              return (
                <div className="space-y-6">
                  {/* Batting Scorecard */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center justify-between">
                      <span>Batting Scorecard</span>
                      <span className="text-white">Extras: {currentInnings.extras}</span>
                    </h4>
                    <div className="overflow-x-auto rounded-xl border border-[#283241] bg-[#151B24]">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#1B2430] text-[#94A3B8] font-semibold border-b border-[#283241]">
                          <tr>
                            <th className="p-3">Batter</th>
                            <th className="p-3">Dismissal</th>
                            <th className="p-3 text-right">R</th>
                            <th className="p-3 text-right">B</th>
                            <th className="p-3 text-right">4s</th>
                            <th className="p-3 text-right">6s</th>
                            <th className="p-3 text-right">SR</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#283241]/60">
                          {currentInnings.batters.map((b, idx) => (
                            <tr key={idx} className="hover:bg-[#1B2430]/60 transition">
                              <td className="p-3 font-semibold text-white">
                                {b.batter} {b.not_out_flag === 1 ? <span className="text-[#A3E635]">*</span> : ""}
                              </td>
                              <td className="p-3 text-[#94A3B8] text-[11px]">
                                {b.out ? `${b.dismissal_kind || 'out'} (${b.dismissal_bowler || ''})` : 'not out'}
                              </td>
                              <td className="p-3 text-right font-bold text-[#FF6B35]">{b.total_runs}</td>
                              <td className="p-3 text-right text-white">{b.total_balls_faced}</td>
                              <td className="p-3 text-right text-[#94A3B8]">{b.fours}</td>
                              <td className="p-3 text-right text-[#94A3B8]">{b.sixes}</td>
                              <td className="p-3 text-right text-[#A3E635] font-medium">{b.strike_rate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Bowling Scorecard */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                      Bowling Figures
                    </h4>
                    <div className="overflow-x-auto rounded-xl border border-[#283241] bg-[#151B24]">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#1B2430] text-[#94A3B8] font-semibold border-b border-[#283241]">
                          <tr>
                            <th className="p-3">Bowler</th>
                            <th className="p-3 text-right">O</th>
                            <th className="p-3 text-right">M</th>
                            <th className="p-3 text-right">R</th>
                            <th className="p-3 text-right">W</th>
                            <th className="p-3 text-right">Econ</th>
                            <th className="p-3 text-right">Dots</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#283241]/60">
                          {currentInnings.bowlers.map((bw, idx) => (
                            <tr key={idx} className="hover:bg-[#1B2430]/60 transition">
                              <td className="p-3 font-semibold text-white">{bw.bowler}</td>
                              <td className="p-3 text-right text-white">{bw.overs}</td>
                              <td className="p-3 text-right text-[#94A3B8]">{bw.maidens}</td>
                              <td className="p-3 text-right text-white">{bw.runs}</td>
                              <td className="p-3 text-right font-bold text-[#A3E635]">{bw.wickets}</td>
                              <td className="p-3 text-right text-[#FF6B35] font-medium">{bw.economy_rate}</td>
                              <td className="p-3 text-right text-[#94A3B8]">{bw.dot_balls}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Fall of Wickets */}
                  {currentInnings.fow && currentInnings.fow.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                        Fall of Wickets
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {currentInnings.fow.map((f, idx) => (
                          <div 
                            key={idx}
                            className="px-3 py-1.5 rounded-lg bg-[#151B24] border border-[#283241] text-xs"
                          >
                            <span className="font-bold text-[#FF6B35]">{f.score}/{f.wicket}</span>
                            <span className="text-[#94A3B8] ml-1.5">({f.player_out}, {f.over} ov)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Over-by-Over Progression */}
                  {currentInnings.overs && currentInnings.overs.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                        Over-by-Over Run Progression
                      </h4>
                      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                        {currentInnings.overs.map((ov, idx) => (
                          <div 
                            key={idx}
                            className={`p-2 rounded-lg border text-center transition ${
                              ov.wickets > 0 
                                ? 'bg-[#FF6B35]/10 border-[#FF6B35]/40 text-white' 
                                : 'bg-[#151B24] border-[#283241] text-[#94A3B8]'
                            }`}
                          >
                            <div className="text-[10px] font-semibold text-[#94A3B8]">Ov {ov.over}</div>
                            <div className="text-xs font-bold text-white">{ov.runs} r</div>
                            <div className="text-[10px] text-[#A3E635] font-medium">{ov.cum_runs}/{ov.wickets > 0 ? `w${ov.wickets}` : ''}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
