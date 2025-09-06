import React, { useState } from 'react';
import Navbar from './Navbar';
import HomePage from './HomePage';
import RakshaApp from './RakshaApp';
import HealthDashboard from './HealthDashboard';
import MedicalForm from './MedicalForm';
import Login from './Login';
import Visualize from './Visualize';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [username, setUsername] = useState('');

  if (!username) {
    return <Login onLogin={(user) => setUsername(user)} />;
  }

  return (
    <>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'home' && <HomePage />}
      {activeTab === 'raksha' && <RakshaApp username={username} />}
      {activeTab === 'report' && <HealthDashboard />}
      {activeTab === 'medical' && <MedicalForm />}
      {activeTab === 'visualize' && <Visualize />}
    </>
  );
}

export default App;