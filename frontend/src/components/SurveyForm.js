/**
 * SurveyForm component for creating and editing student surveys.
 * Handles form validation, submission, and all required survey fields as specified in the assignment.
 */
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './SurveyForm.css';

const SurveyForm = ({ surveyId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    street_address: '',
    city: '',
    state: '',
    zip: '',
    telephone: '',
    email: '',
    date_of_survey: new Date().toISOString().split('T')[0],
    liked_most: [],
    interested_in: '',
    recommendation: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (surveyId) {
      loadSurvey();
    }
  }, [surveyId]);

  const loadSurvey = async () => {
    try {
      setLoading(true);
      const survey = await api.getSurvey(surveyId);
      setFormData({
        ...survey,
        date_of_survey: survey.date_of_survey,
        // Ensure liked_most is always an array
        liked_most: Array.isArray(survey.liked_most) ? survey.liked_most : (survey.liked_most ? [survey.liked_most] : []),
      });
    } catch (error) {
      alert('Failed to load survey: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox for liked_most (multiple selections)
    if (name === 'liked_most' && type === 'checkbox') {
      setFormData((prev) => {
        const currentLiked = prev.liked_most || [];
        let updatedLiked;
        if (checked) {
          // Add to array if checked
          updatedLiked = [...currentLiked, value];
        } else {
          // Remove from array if unchecked
          updatedLiked = currentLiked.filter(item => item !== value);
        }
        return {
          ...prev,
          liked_most: updatedLiked,
        };
      });
    } else {
      // Handle regular input fields
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.street_address.trim()) newErrors.street_address = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zip.trim()) newErrors.zip = 'ZIP code is required';
    if (!formData.telephone.trim()) newErrors.telephone = 'Telephone is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.date_of_survey) newErrors.date_of_survey = 'Date of survey is required';
    if (!formData.liked_most || formData.liked_most.length === 0) {
      newErrors.liked_most = 'Please select at least one thing you liked most';
    }
    if (!formData.interested_in) newErrors.interested_in = 'Please select how you became interested';
    if (!formData.recommendation) newErrors.recommendation = 'Please select recommendation likelihood';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      if (surveyId) {
        await api.updateSurvey(surveyId, formData);
        alert('Survey updated successfully!');
      } else {
        await api.createSurvey(formData);
        alert('Survey submitted successfully!');
      }
      onSuccess();
    } catch (error) {
      alert('Failed to save survey: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && surveyId) {
    return <div className="loading">Loading survey...</div>;
  }

  return (
    <div className="survey-form-container">
      <h2>{surveyId ? 'Edit Survey' : 'Student Survey Form'}</h2>
      <form onSubmit={handleSubmit} className="survey-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="first_name">First Name *</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            {errors.first_name && <span className="error">{errors.first_name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Last Name *</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
            {errors.last_name && <span className="error">{errors.last_name}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="street_address">Street Address *</label>
          <input
            type="text"
            id="street_address"
            name="street_address"
            value={formData.street_address}
            onChange={handleChange}
            required
          />
          {errors.street_address && <span className="error">{errors.street_address}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">City *</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
            {errors.city && <span className="error">{errors.city}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="state">State *</label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              required
            />
            {errors.state && <span className="error">{errors.state}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="zip">ZIP Code *</label>
            <input
              type="text"
              id="zip"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              required
            />
            {errors.zip && <span className="error">{errors.zip}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="telephone">Telephone Number *</label>
            <input
              type="tel"
              id="telephone"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              required
            />
            {errors.telephone && <span className="error">{errors.telephone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="date_of_survey">Date of Survey *</label>
            <input
              type="date"
              id="date_of_survey"
              name="date_of_survey"
              value={formData.date_of_survey}
              onChange={handleChange}
              required
            />
            {errors.date_of_survey && <span className="error">{errors.date_of_survey}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>What did you like most about the campus? *</label>
          <div className="checkbox-group">
            {['students', 'location', 'campus', 'atmosphere', 'dorm rooms', 'sports'].map((option) => (
              <label key={option} className="checkbox-label">
                <input
                  type="checkbox"
                  name="liked_most"
                  value={option}
                  checked={formData.liked_most.includes(option)}
                  onChange={handleChange}
                />
                <span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
              </label>
            ))}
          </div>
          {errors.liked_most && <span className="error">{errors.liked_most}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="interested_in">How did you become interested in the university? *</label>
          <select
            id="interested_in"
            name="interested_in"
            value={formData.interested_in}
            onChange={handleChange}
            required
          >
            <option value="">Select an option</option>
            <option value="friends">Friends</option>
            <option value="television">Television</option>
            <option value="Internet">Internet</option>
            <option value="other">Other</option>
          </select>
          {errors.interested_in && <span className="error">{errors.interested_in}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="recommendation">Likelihood of recommending this school to others *</label>
          <select
            id="recommendation"
            name="recommendation"
            value={formData.recommendation}
            onChange={handleChange}
            required
          >
            <option value="">Select an option</option>
            <option value="Very Likely">Very Likely</option>
            <option value="Likely">Likely</option>
            <option value="Unlikely">Unlikely</option>
          </select>
          {errors.recommendation && <span className="error">{errors.recommendation}</span>}
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : (surveyId ? 'Update Survey' : 'Submit Survey')}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SurveyForm;



