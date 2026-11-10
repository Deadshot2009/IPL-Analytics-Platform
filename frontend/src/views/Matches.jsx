import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Award, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { getTeamMeta } from '../utils/teamColors';

export default function Matches({ onSelectMatch }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalMatches, setTotalMatches] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  // Filters
  const [season, setSeason] = useState('all');
  const [team, setTeam] = useState('all');
  const [opponent, setOpponent] = useState('all');
  const [venue, setVenue] = useState('all');
  const [playerOfMatch, setPlayerOfMatch] = useState('');

  // Filter options list
  const [filterOptions, setFilterOptions] = useState({ seasons: [], teams: [], venues: [] });

  // Load filter options once
  useEffect(() => {
    async function loadOptions() {
      try {
        const res = await fetch('/api/overview');
        if (res.ok) {
          const data = await res.json();
          setFilterOptions(data.filters || { seasons: [], teams: [], venues: [] });
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadOptions();
  }, []);

  // Fetch matches
  useEffect(() => {
    async function fetchMatches() {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '20'
        });
        if (season !== 'all') params.append('season', season);
        if (team !== 'all') params.append('team', team);
        if (opponent !== 'all') params.append('opponent', opponent);
        if (venue !== 'all') params.append('venue', venue);
        if (playerOfMatch.trim()) params.append('player_of_match', playerOfMatch.trim());

        const res = await fetch(`/api/matches?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setMatches(data.matches || []);
          setTotalMatches(data.total || 0);
          setTotalPages(data.pages || 1);
        }
      } catch (err) {
        console.error("Failed to load matches:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, [season, team, opponent, venue, playerOfMatch, page]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Match Explorer & Scorecards
        </h2>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          Search 1,243 historical IPL fixtures with official ball-by-ball scorecards and milestone tracking
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="p-5 rounded-2xl bg-[#151B24] border border-[#283241] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
            <Filter size={15} className="text-[#FF6B35]" />
            <span>Search & Filter Fixtures</span>
          </div>
          {(season !== 'all' || team !== 'all' || opponent !== 'all' || venue !== 'all' || playerOfMatch) && (
            <button
              onClick={() => {
                setSeason('all');
                setTeam('all');
                setOpponent('all');
                setVenue('all');
                setPlayerOfMatch('');
                setPage(1);
              }}
              className="text-xs text-[#FF6B35] hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Season */}
          <div>
            <label className="text-[11px] text-[#94A3B8] font-semibold mb-1 block">Season</label>
            <select
              value={season}
              onChange={(e) => { setSeason(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-[#0B0F14] border border-[#283241] rounded-xl text-xs font-medium text-white focus:outline-none focus:border-[#FF6B35]"
            >
              <option value="all">All Seasons</option>
              {filterOptions.seasons.map((s) => (
                <option key={s} value={s}>Season {s}</option>
              ))}
            </select>
          </div>

          {/* Team */}
          <div>
            <label className="text-[11px] text-[#94A3B8] font-semibold mb-1 block">Team</label>
            <select
              value={team}
              onChange={(e) => { setTeam(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-[#0B0F14] border border-[#283241] rounded-xl text-xs font-medium text-white focus:outline-none focus:border-[#FF6B35]"
            >
              <option value="all">All Teams</option>
              {filterOptions.teams.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Opponent */}
          <div>
            <label className="text-[11px] text-[#94A3B8] font-semibold mb-1 block">Opponent</label>
            <select
              value={opponent}
              onChange={(e) => { setOpponent(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-[#0B0F14] border border-[#283241] rounded-xl text-xs font-medium text-white focus:outline-none focus:border-[#FF6B35]"
            >
              <option value="all">All Opponents</option>
              {filterOptions.teams.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Venue */}
          <div>
            <label className="text-[11px] text-[#94A3B8] font-semibold mb-1 block">Venue</label>
            <select
              value={venue}
              onChange={(e) => { setVenue(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-[#0B0F14] border border-[#283241] rounded-xl text-xs font-medium text-white focus:outline-none focus:border-[#FF6B35] truncate"
            >
              <option value="all">All Venues</option>
              {filterOptions.venues.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Player of Match */}
          <div>
            <label className="text-[11px] text-[#94A3B8] font-semibold mb-1 block">Player of the Match</label>
            <input
              type="text"
              value={playerOfMatch}
              onChange={(e) => { setPlayerOfMatch(e.target.value); setPage(1); }}
              placeholder="e.g. Kohli, Rohit..."
              className="w-full px-3 py-2 bg-[#0B0F14] border border-[#283241] rounded-xl text-xs font-medium text-white focus:outline-none focus:border-[#FF6B35]"
            />
          </div>
        </div>
      </div>

      {/* Match Results Listing */}
      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="w-8 h-8 text-[#FF6B35] animate-spin" />
        </div>
      ) : matches.length === 0 ? (
        <div className="p-12 rounded-xl bg-[#151B24] border border-[#283241] text-center text-[#94A3B8]">
          No matches found matching the specified filters.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-[#94A3B8] px-1 font-medium">
            Found <strong className="text-white">{totalMatches}</strong> matching matches
          </div>

          {/* Grid of Match Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((m) => {
              const meta1 = getTeamMeta(m.team1);
              const meta2 = getTeamMeta(m.team2);
              return (
                <div
                  key={m.match_id}
                  onClick={() => onSelectMatch(m.match_id)}
                  className="ipl-card p-4 hover:border-[#FF6B35]/50 cursor-pointer flex flex-col justify-between gap-4 group"
                >
                  {/* Top info */}
                  <div className="flex items-center justify-between text-[11px] text-[#94A3B8] pb-2 border-b border-[#283241]">
                    <div className="flex items-center gap-1.5 font-semibold text-white">
                      <span>{m.season}</span>
                      <span>•</span>
                      <span>{m.date}</span>
                      {m.event_stage && (
                        <span className="px-2 py-0.2 rounded bg-[#FF6B35]/20 text-[#FF6B35] font-bold text-[10px]">
                          {m.event_stage}
                        </span>
                      )}
                    </div>
                    <div className="truncate max-w-[150px]" title={m.venue}>
                      {m.city || m.venue}
                    </div>
                  </div>

                  {/* Teams and Scores */}
                  <div className="space-y-2">
                    {/* Team 1 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0"
                          style={{ backgroundColor: meta1.primary, color: meta1.text }}
                        >
                          {meta1.short}
                        </span>
                        <span className={`text-xs font-bold ${m.winner === m.team1 ? 'text-white' : 'text-[#94A3B8]'}`}>
                          {m.team1}
                        </span>
                      </div>
                      <span className="text-xs font-black text-white">
                        {m.first_innings_score || "—"}
                      </span>
                    </div>

                    {/* Team 2 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0"
                          style={{ backgroundColor: meta2.primary, color: meta2.text }}
                        >
                          {meta2.short}
                        </span>
                        <span className={`text-xs font-bold ${m.winner === m.team2 ? 'text-white' : 'text-[#94A3B8]'}`}>
                          {m.team2}
                        </span>
                      </div>
                      <span className="text-xs font-black text-white">
                        {m.second_innings_score || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Result & POTM */}
                  <div className="pt-2 border-t border-[#283241] flex items-center justify-between text-[11px]">
                    <div className="font-semibold text-[#A3E635]">
                      {m.winner ? (
                        <span>{m.winner} won by {m.win_margin} {m.win_type}</span>
                      ) : (
                        <span className="text-[#FF6B35]">{m.result || "No Result / Tie"}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[#94A3B8] group-hover:text-[#FF6B35] font-medium transition">
                      <span>View Scorecard</span>
                      <ExternalLink size={12} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-[#94A3B8] pt-4 px-1">
            <div>
              Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, totalMatches)} of {totalMatches} fixtures
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-lg bg-[#151B24] border border-[#283241] disabled:opacity-40 hover:text-white"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-semibold text-white">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 rounded-lg bg-[#151B24] border border-[#283241] disabled:opacity-40 hover:text-white"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
