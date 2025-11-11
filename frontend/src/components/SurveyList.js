/**
 * SurveyList component for displaying all student surveys in a table format.
 * Provides functionality to view, edit, and delete individual surveys.
 */
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import SurveyDetail from './SurveyDetail';
import './SurveyList.css';

const SurveyList = ({ onNewSurvey }) => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAllSurveys();
      setSurveys(data);
    } catch (err) {
      setError('Failed to load surveys: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (survey) => {
    setSelectedSurvey(survey);
  };

  const handleEdit = (survey) => {
    setSelectedSurvey({ ...survey, editMode: true });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this survey?')) {
      try {
        await api.deleteSurvey(id);
        alert('Survey deleted successfully!');
        loadSurveys();
        if (selectedSurvey && selectedSurvey.id === id) {
          setSelectedSurvey(null);
        }
      } catch (err) {
        alert('Failed to delete survey: ' + err.message);
      }
    }
  };

  const handleCloseDetail = () => {
    setSelectedSurvey(null);
  };

  const handleSurveySaved = () => {
    loadSurveys();
    setSelectedSurvey(null);
  };

  if (loading) {
    return <div className="loading">Loading surveys...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (selectedSurvey) {
    return (
      <SurveyDetail
        survey={selectedSurvey}
        onClose={handleCloseDetail}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSaved={handleSurveySaved}
      />
    );
  }

  return (
    <div className="survey-list-container">
      <div className="survey-list-header">
        <h2>All Student Surveys</h2>
        <button onClick={onNewSurvey} className="btn-primary">
          New Survey
        </button>
      </div>

      {surveys.length === 0 ? (
        <div className="no-surveys">
          <p>No surveys found. Create a new survey to get started.</p>
        </div>
      ) : (
        <div className="survey-table-container">
          <table className="survey-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>City</th>
                <th>State</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {surveys.map((survey) => (
                <tr key={survey.id}>
                  <td>{survey.id}</td>
                  <td>{survey.first_name} {survey.last_name}</td>
                  <td>{survey.email}</td>
                  <td>{survey.city}</td>
                  <td>{survey.state}</td>
                  <td>{survey.date_of_survey}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleView(survey)}
                        className="btn-view"
                        title="View"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(survey)}
                        className="btn-edit"
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(survey.id)}
                        className="btn-delete"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SurveyList;



