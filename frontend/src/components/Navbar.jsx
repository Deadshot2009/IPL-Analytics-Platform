import React, { useState, useEffect } from 'react';
import { Menu, Search, Database, ExternalLink, RefreshCw } from 'lucide-react';

export default function Navbar({ onOpenMobile, onSelectPlayer, onSelectTeam }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await fetch(`/api/players/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-18 px-4 md:px-8 bg-[#0B0F14]/90 backdrop-blur-md border-b border-[#283241]">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={onOpenMobile}
          className="p-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#151B24] md:hidden"
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>

        {/* Global Instant Search */}
        <div className="relative w-64 md:w-96">
          <div className="flex items-center gap-2 px-3 py-2 bg-[#151B24] border border-[#283241] rounded-xl focus-within:border-[#FF6B35] transition">
            <Search className="w-4 h-4 text-[#94A3B8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search players (e.g. Kohli, Rohit, Bumrah)..."
              className="w-full bg-transparent text-sm text-white placeholder-[#94A3B8]/60 focus:outline-none"
            />
            {isSearching && (
              <RefreshCw className="w-3.5 h-3.5 text-[#FF6B35] animate-spin" />
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {results.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-[#151B24] border border-[#283241] rounded-xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto">
              <div className="px-3 py-2 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider bg-[#0B0F14]/60 border-b border-[#283241]">
                Matching Players ({results.length})
              </div>
              {results.map((player) => (
                <button
                  key={player}
                  onClick={() => {
                    onSelectPlayer(player);
                    setSearchQuery('');
                    setResults([]);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#FFFFFF] hover:text-[#FF6B35] hover:bg-[#1B2430] flex items-center justify-between transition border-b border-[#283241]/40 last:border-0"
                >
                  <span className="font-medium">{player}</span>
                  <ExternalLink size={13} className="text-[#94A3B8]" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top right badges */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#151B24] border border-[#283241] rounded-lg text-xs font-medium text-[#94A3B8]">
          <Database size={13} className="text-[#A3E635]" />
          <span>Stage 2 & 4 Verified Engine</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#FF6B35]/15 to-[#FF6B35]/5 border border-[#FF6B35]/30 rounded-lg text-xs font-semibold text-[#FF6B35]">
          <span>IPL 2008 – 2026</span>
        </div>
      </div>
    </header>
  );
}
