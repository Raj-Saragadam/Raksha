import React from 'react';

function HomePage() {
  return (
    <div className="home-page" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      backgroundColor: '#f0f4f8', 
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '3rem', color: '#1a202c', marginBottom: '1rem' }}>
        Welcome to Your Personal AI Assistant
      </h1>
      <p style={{ fontSize: '1.25rem', color: '#4a5568', maxWidth: '600px', marginBottom: '2rem' }}>
        Meet <strong>Raksha</strong> — your smart companion for health support, guidance, and more. 
        Get started by selecting "Raksha" from the menu and begin your journey toward smarter living!
      </p>
    </div>
  );
}

export default HomePage;
