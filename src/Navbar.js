import React from 'react';
import './Navbar.css';

function Navbar({ activeTab, setActiveTab }) {
  return (
    <div className="navbar-wrapper">
      <div className="floating-tabs">
        <button
          className={`tab-btn ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          🏠 Home
        </button>
        <button
          className={`tab-btn ${activeTab === 'raksha' ? 'active' : ''}`}
          onClick={() => setActiveTab('raksha')}
        >
          🤖 Raksha
        </button>
        <button
          className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          🔍 Health Monitor
        </button>
        <button
          className={`tab-btn ${activeTab === 'medical' ? 'active' : ''}`}
          onClick={() => setActiveTab('medical')}
        >
          📝 Medical Records
        </button>
        <button
          className={`tab-btn ${activeTab === 'visualize' ? 'active' : ''}`}
          onClick={() => setActiveTab('visualize')}
        >
          🧬 3D Disease Visualization
        </button>

      </div>
    </div>
  );
}

export default Navbar;
