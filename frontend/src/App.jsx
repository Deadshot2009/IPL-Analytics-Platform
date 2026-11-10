import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import MatchDetailModal from './components/MatchDetailModal';

// Views
import Overview from './views/Overview';
import Teams from './views/Teams';
import Players from './views/Players';
import Matches from './views/Matches';
import Venues from './views/Venues';
import Seasons from './views/Seasons';
import Insights from './views/Insights';
import About from './views/About';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Selected modal match
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  
  // Selected player for direct navigation
  const [selectedPlayerName, setSelectedPlayerName] = useState(null);

  const handleSelectPlayer = (playerName) => {
    setSelectedPlayerName(playerName);
    setActiveTab('players');
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#FFFFFF] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        {/* Top Navbar */}
        <Navbar
          onOpenMobile={() => setMobileOpen(true)}
          onSelectPlayer={handleSelectPlayer}
          onSelectTeam={() => setActiveTab('teams')}
        />

        {/* View Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'overview' && (
            <Overview 
              onNavigate={(tab) => setActiveTab(tab)} 
              onSelectMatch={(mid) => setSelectedMatchId(mid)} 
            />
          )}

          {activeTab === 'teams' && (
            <Teams 
              onSelectMatch={(mid) => setSelectedMatchId(mid)} 
            />
          )}

          {activeTab === 'players' && (
            <Players 
              initialPlayer={selectedPlayerName}
              onSelectMatch={(mid) => setSelectedMatchId(mid)} 
            />
          )}

          {activeTab === 'matches' && (
            <Matches 
              onSelectMatch={(mid) => setSelectedMatchId(mid)} 
            />
          )}

          {activeTab === 'venues' && (
            <Venues 
              onSelectMatch={(mid) => setSelectedMatchId(mid)} 
            />
          )}

          {activeTab === 'seasons' && (
            <Seasons 
              onSelectMatch={(mid) => setSelectedMatchId(mid)} 
              onSelectPlayer={handleSelectPlayer}
            />
          )}

          {activeTab === 'insights' && (
            <Insights />
          )}

          {activeTab === 'about' && (
            <About />
          )}
        </main>
      </div>

      {/* Global Match Scorecard Modal */}
      {selectedMatchId && (
        <MatchDetailModal
          matchId={selectedMatchId}
          onClose={() => setSelectedMatchId(null)}
        />
      )}
    </div>
  );
}
