import React from 'react';
import { 
  LayoutDashboard, 
  Shield, 
  Users, 
  Trophy, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Info, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  Activity
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'teams', label: 'Teams', icon: Shield },
    { id: 'players', label: 'Players', icon: Users },
    { id: 'matches', label: 'Matches', icon: Trophy },
    { id: 'venues', label: 'Venues', icon: MapPin },
    { id: 'seasons', label: 'Season Explorer', icon: Calendar },
    { id: 'insights', label: 'Advanced Insights', icon: TrendingUp },
    { id: 'about', label: 'About Project', icon: Info },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0B0F14] border-r border-[#283241] transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-18 px-4 border-b border-[#283241]">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => setActiveTab('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#E04F16] flex items-center justify-center shadow-lg shadow-[#FF6B35]/20 shrink-0">
              <Flame className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-wider text-white">IPL ANALYTICS</span>
                <span className="text-[10px] tracking-widest text-[#FF6B35] font-semibold uppercase">PRO SAAS PLATFORM</span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-[#94A3B8] hover:text-white hover:bg-[#151B24] border border-transparent hover:border-[#283241] transition"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150 group relative
                  ${isActive 
                    ? 'bg-[#151B24] text-[#FF6B35] border border-[#FF6B35]/40 shadow-md shadow-[#FF6B35]/5' 
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#151B24]/70 border border-transparent'}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#FF6B35] rounded-r-full" />
                )}
                <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-[#FF6B35]' : 'text-[#94A3B8] group-hover:text-white'}`} />
                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Coverage & Status Footer */}
        <div className="p-3 border-t border-[#283241] bg-[#0E131A]">
          {!isCollapsed ? (
            <div className="p-3 rounded-xl bg-[#151B24] border border-[#283241] text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[#94A3B8] font-medium">Dataset Coverage</span>
                <span className="flex items-center gap-1.5 text-[#A3E635] text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635] animate-pulse"></span>
                  LIVE
                </span>
              </div>
              <div className="text-white font-semibold text-xs">2008 – 2026 (19 Seasons)</div>
              <div className="text-[#94A3B8] text-[11px] mt-0.5">1,243 Matches • 295K Balls</div>
            </div>
          ) : (
            <div className="flex justify-center py-2" title="19 Seasons (2008-2026) | 1,243 Matches">
              <Activity className="w-5 h-5 text-[#A3E635]" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
