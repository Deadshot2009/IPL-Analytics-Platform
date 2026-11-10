import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Trophy, 
  TrendingUp, 
  Percent, 
  Flame, 
  RefreshCw,
  Search,
  Shield
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

export default function Venues({ onSelectMatch }) {
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState('Eden Gardens');
  const [venueDetail, setVenueDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  // Load venues list
  useEffect(() => {
    async function fetchVenues() {
      try {
        const res = await fetch('/api/venues');
        if (res.ok) {
          const data = await res.json();
          setVenues(data);
          if (data.length > 0 && !selectedVenue) {
            setSelectedVenue(data[0].venue);
          }
        }
      } catch (err) {
        console.error("Failed to load venues:", err);
      }
    }
    fetchVenues();
  }, []);

  // Load venue detail
  useEffect(() => {
    async function fetchVenueDetail() {
      if (!selectedVenue) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/venues/${encodeURIComponent(selectedVenue)}`);
        if (res.ok) {
          const data = await res.json();
          setVenueDetail(data);
        }
      } catch (err) {
        console.error("Failed to load venue detail:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchVenueDetail();
  }, [selectedVenue]);

  const filteredVenues = venues.filter(v => 
    v.venue.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Stadium & Venue Analytics
        </h2>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          Pitch characteristics, average scoring rates, toss advantages, and boundary metrics across IPL stadiums
        </p>
      </div>

      {/* Venue Selector Bar */}
      <div className="p-4 rounded-xl bg-[#151B24] border border-[#283241] space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
            Select Stadium
          </div>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter stadiums..."
            className="px-2.5 py-1 bg-[#0B0F14] border border-[#283241] rounded-lg text-xs text-white focus:outline-none focus:border-[#FF6B35]"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {filteredVenues.map((v) => (
            <button
              key={v.venue}
              onClick={() => setSelectedVenue(v.venue)}
              className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-2 border transition ${
                selectedVenue === v.venue
                  ? 'border-[#FF6B35] bg-[#1B2430] text-white shadow-md'
                  : 'border-[#283241] bg-[#0B0F14] text-[#94A3B8] hover:text-white hover:border-[#FF6B35]/40'
              }`}
            >
              <MapPin size={13} className={selectedVenue === v.venue ? 'text-[#FF6B35]' : 'text-[#94A3B8]'} />
              <span>{v.venue}</span>
              <span className="text-[10px] text-[#94A3B8]">({v.matches}m)</span>
            </button>
          ))}
        </div>
      </div>

      {loading || !venueDetail ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="w-8 h-8 text-[#FF6B35] animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Venue Hero Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#151B24] via-[#1B2430] to-[#0E1520] border border-[#283241]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#E04F16] flex items-center justify-center text-white shadow-lg shadow-[#FF6B35]/20">
                  <MapPin className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">{venueDetail.venue}</h3>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Host to {venueDetail.matches} IPL fixtures • 1st Innings Average: {venueDetail.avg_1st_innings} Runs
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Venue KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            <StatCard
              title="Total Matches"
              value={venueDetail.matches}
              icon={MapPin}
              accentColor="#38BDF8"
            />
            <StatCard
              title="Avg 1st Innings"
              value={venueDetail.avg_1st_innings}
              icon={TrendingUp}
              accentColor="#FF6B35"
              subtitle="First innings par"
            />
            <StatCard
              title="Avg 2nd Innings"
              value={venueDetail.avg_2nd_innings}
              icon={TrendingUp}
              accentColor="#A3E635"
              subtitle="Chasing innings par"
            />
            <StatCard
              title="Highest Total"
              value={venueDetail.highest_score}
              icon={Trophy}
              accentColor="#F59E0B"
              subtitle="Record team score"
            />
            <StatCard
              title="Bat 1st Wins"
              value={`${venueDetail.bat_first_win_pct}%`}
              icon={Shield}
              accentColor="#EC4899"
              subtitle={`${venueDetail.bat_first_wins} matches defended`}
            />
            <StatCard
              title="Chase Wins"
              value={`${venueDetail.chase_win_pct}%`}
              icon={Percent}
              accentColor="#A3E635"
              subtitle={`${venueDetail.chase_wins} matches chased`}
            />
          </div>

          {/* Visualizations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Season-wise scoring trends at this venue */}
            <div className="ipl-card p-5 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Season-wise Scoring Trends at Stadium
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={venueDetail.season_trends || []}>
                    <XAxis dataKey="season" stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#151B24', borderColor: '#283241', color: '#fff', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Line type="monotone" name="Avg Score" dataKey="avg_score" stroke="#FF6B35" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" name="High Score" dataKey="high_score" stroke="#38BDF8" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bat First vs Chasing Comparison Donut */}
            <div className="ipl-card p-5 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Defending vs Chasing Win Distribution
              </h4>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Batting First", value: venueDetail.bat_first_wins },
                        { name: "Chasing", value: venueDetail.chase_wins },
                        { name: "Ties / No Result", value: venueDetail.ties }
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      <Cell fill="#FF6B35" />
                      <Cell fill="#A3E635" />
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

          {/* Highest Totals at Venue */}
          <div className="ipl-card p-5 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Highest Team Totals Recorded at {venueDetail.venue}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {venueDetail.highest_totals?.map((tot, idx) => (
                <div 
                  key={idx}
                  onClick={() => onSelectMatch(tot.match_id)}
                  className="p-3 rounded-xl bg-[#0B0F14] border border-[#283241] hover:border-[#FF6B35]/50 cursor-pointer transition text-center"
                >
                  <div className="text-xs font-semibold text-white">{tot.team}</div>
                  <div className="text-lg font-black text-[#FF6B35] my-1">{tot.score}</div>
                  <div className="text-[11px] text-[#94A3B8]">vs {tot.opponent} • {tot.season}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Complete Venue Ranking Table */}
          <div className="ipl-card p-5 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              All Available IPL Stadiums Ranking Table ({venues.length})
            </h4>
            <div className="overflow-x-auto rounded-xl border border-[#283241] bg-[#0B0F14]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#151B24] text-[#94A3B8] font-semibold border-b border-[#283241]">
                  <tr>
                    <th className="p-3">Stadium / Venue</th>
                    <th className="p-3 text-right">Matches</th>
                    <th className="p-3 text-right">Avg Score</th>
                    <th className="p-3 text-right">Median Score</th>
                    <th className="p-3 text-right">Run Rate</th>
                    <th className="p-3 text-right">Avg Wickets</th>
                    <th className="p-3 text-right">Avg 6s</th>
                    <th className="p-3 text-right">Chase Win %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#283241]/60">
                  {venues.map((v, idx) => (
                    <tr 
                      key={idx}
                      onClick={() => setSelectedVenue(v.venue)}
                      className={`cursor-pointer transition ${selectedVenue === v.venue ? 'bg-[#1B2430]' : 'hover:bg-[#151B24]/70'}`}
                    >
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <MapPin size={12} className="text-[#FF6B35]" />
                        <span>{v.venue}</span>
                      </td>
                      <td className="p-3 text-right text-white">{v.matches}</td>
                      <td className="p-3 text-right font-bold text-[#FF6B35]">{v.avg_score}</td>
                      <td className="p-3 text-right text-white">{v.median_score}</td>
                      <td className="p-3 text-right text-[#38BDF8]">{v.avg_run_rate}</td>
                      <td className="p-3 text-right text-[#A3E635]">{v.avg_wickets}</td>
                      <td className="p-3 text-right text-[#F59E0B]">{v.avg_sixes}</td>
                      <td className="p-3 text-right font-semibold text-[#A3E635]">{v.chase_win_pct}%</td>
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
