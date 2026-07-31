import React from 'react';
import Sidebar from './components/Sidebar';
import SearchPage from './pages/SearchPage';

function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content-wrapper">
        <header className="app-header">
          <h1>BookInn Hotel</h1>
          <p>Find & Check Available Rooms</p>
        </header>
        <main>
          <SearchPage />
        </main>
      </div>
    </div>
  );
}

export default App;
