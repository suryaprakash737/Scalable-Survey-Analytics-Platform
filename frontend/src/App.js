/**
 * Main App component for Student Survey application.
 * Manages application state and navigation between survey form and list views.
 */
import React, { useState } from 'react';
import SurveyForm from './components/SurveyForm';
import SurveyList from './components/SurveyList';
import './App.css';

function App() {
  const [view, setView] = useState('list'); // 'list' or 'form'

  const handleNewSurvey = () => {
    setView('form');
  };

  const handleFormSuccess = () => {
    setView('list');
  };

  const handleFormCancel = () => {
    setView('list');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Student Survey Application</h1>
        <p>Prospective Student Campus Visit Feedback</p>
      </header>
      <nav className="App-nav">
        <button
          onClick={() => setView('list')}
          className={view === 'list' ? 'active' : ''}
        >
          View All Surveys
        </button>
        <button
          onClick={handleNewSurvey}
          className={view === 'form' ? 'active' : ''}
        >
          New Survey
        </button>
      </nav>
      <main className="App-main">
        {view === 'form' ? (
          <SurveyForm
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        ) : (
          <SurveyList onNewSurvey={handleNewSurvey} />
        )}
      </main>
      <footer className="App-footer">
        <p>SWE 645 - Homework Assignment 3</p>
      </footer>
    </div>
  );
}

export default App;



