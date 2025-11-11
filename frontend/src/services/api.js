/**
 * API service module for communicating with the backend REST API.
 * Provides functions for all CRUD operations (create, read, update, delete) on surveys.
 */
// In Kubernetes, use relative path to leverage nginx proxy
// For local development, use full URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (window.location.hostname === 'localhost' ? 'http://localhost:8000' : '');

export const api = {
  // Get all surveys
  getAllSurveys: async () => {
    const response = await fetch(`${API_BASE_URL}/api/surveys`);
    if (!response.ok) {
      throw new Error('Failed to fetch surveys');
    }
    return response.json();
  },

  // Get a single survey by ID
  getSurvey: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/surveys/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch survey');
    }
    return response.json();
  },

  // Create a new survey
  createSurvey: async (surveyData) => {
    const response = await fetch(`${API_BASE_URL}/api/surveys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(surveyData),
    });
    if (!response.ok) {
      throw new Error('Failed to create survey');
    }
    return response.json();
  },

  // Update an existing survey
  updateSurvey: async (id, surveyData) => {
    const response = await fetch(`${API_BASE_URL}/api/surveys/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(surveyData),
    });
    if (!response.ok) {
      throw new Error('Failed to update survey');
    }
    return response.json();
  },

  // Delete a survey
  deleteSurvey: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/surveys/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete survey');
    }
    return true;
  },
};

