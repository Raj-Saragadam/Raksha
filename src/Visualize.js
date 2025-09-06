import React, { useState } from 'react';
import './Visualize.css';

const diseaseLinks = {
  "Interstitial Lung Disease (ILD)": "https://human.biodigital.com/view?id=production/maleAdult/ild&lang=en",
  "Hormone Injections": "https://human.biodigital.com/view?id=production/femaleAdult/follicle_stimulation&lang=en",
  "Ovulation": "https://human.biodigital.com/view?id=production/femaleAdult/ovulation_02&lang=en",
  "Intracytoplasmic Sperm Injection (ICSI)": "https://human.biodigital.com/view?id=production/femaleAdult/icsi&lang=en",
  "Posterior Lumbar Spinal Fusion (PSF)": "https://human.biodigital.com/view?id=production/maleAdult/posterior_lumbar_spinal_fusion&lang=en"
};

function Visualize({ goBack }) {
  const [search, setSearch] = useState('');
  const [selectedDisease, setSelectedDisease] = useState('');

  const filteredDiseases = Object.keys(diseaseLinks).filter(disease =>
    disease.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenInNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="visualize-container">
      <button className="back-button" onClick={goBack}>← Back</button>

      <h2>🧬 3D Disease Visualization</h2>

      <input
        type="text"
        placeholder="Search for a disease..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <select
        value={selectedDisease}
        onChange={(e) => setSelectedDisease(e.target.value)}
        className="dropdown"
      >
        <option value="">Select a Disease</option>
        {filteredDiseases.map((disease) => (
          <option key={disease} value={disease}>{disease}</option>
        ))}
      </select>

      {selectedDisease && (
        <div className="link-container">
          <button 
            className="open-in-new-tab"
            onClick={() => handleOpenInNewTab(diseaseLinks[selectedDisease])}
          >
            Open 3D Visualization
          </button>
        </div>
      )}
    </div>
  );
}

export default Visualize;
