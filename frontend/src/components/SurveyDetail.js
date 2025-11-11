/**
 * SurveyDetail component for viewing and editing a single survey record.
 * Displays all survey information in a detailed view and provides edit/delete functionality.
 */
import React, { useState } from 'react';
import SurveyForm from './SurveyForm';
import './SurveyDetail.css';

const SurveyDetail = ({ survey, onClose, onEdit, onDelete, onSaved }) => {
  const [isEditing, setIsEditing] = useState(survey.editMode || false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (survey.editMode) {
      onClose();
    } else {
      setIsEditing(false);
    }
  };

  const handleSaveSuccess = () => {
    setIsEditing(false);
    if (onSaved) {
      onSaved();
    }
  };

  if (isEditing) {
    return (
      <div className="survey-detail-container">
        <SurveyForm
          surveyId={survey.id}
          onSuccess={handleSaveSuccess}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="survey-detail-container">
      <div className="survey-detail-header">
        <h2>Survey Details - ID: {survey.id}</h2>
        <button onClick={onClose} className="btn-close">×</button>
      </div>

      <div className="survey-detail-content">
        <div className="detail-section">
          <h3>Personal Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>First Name:</label>
              <span>{survey.first_name}</span>
            </div>
            <div className="detail-item">
              <label>Last Name:</label>
              <span>{survey.last_name}</span>
            </div>
            <div className="detail-item">
              <label>Email:</label>
              <span>{survey.email}</span>
            </div>
            <div className="detail-item">
              <label>Telephone:</label>
              <span>{survey.telephone}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Address Information</h3>
          <div className="detail-grid">
            <div className="detail-item full-width">
              <label>Street Address:</label>
              <span>{survey.street_address}</span>
            </div>
            <div className="detail-item">
              <label>City:</label>
              <span>{survey.city}</span>
            </div>
            <div className="detail-item">
              <label>State:</label>
              <span>{survey.state}</span>
            </div>
            <div className="detail-item">
              <label>ZIP Code:</label>
              <span>{survey.zip}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Survey Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Date of Survey:</label>
              <span>{survey.date_of_survey}</span>
            </div>
            <div className="detail-item">
              <label>Liked Most:</label>
              <span>{Array.isArray(survey.liked_most) ? survey.liked_most.join(', ') : survey.liked_most}</span>
            </div>
            <div className="detail-item">
              <label>Became Interested In:</label>
              <span>{survey.interested_in}</span>
            </div>
            <div className="detail-item">
              <label>Recommendation:</label>
              <span>{survey.recommendation}</span>
            </div>
          </div>
        </div>

        <div className="detail-actions">
          <button onClick={handleEdit} className="btn-edit">
            Edit Survey
          </button>
          <button onClick={() => onDelete(survey.id)} className="btn-delete">
            Delete Survey
          </button>
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveyDetail;



