import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { geocodeAddress, reverseGeocode } from '../lib/geocoding';
import { uploadEventImage } from '../lib/storage';
import LocationPicker from '../components/LocationPicker';
import ImageUpload from '../components/ImageUpload';
import CategorySelector from '../components/CategorySelector';
import ToggleSwitch from '../components/ToggleSwitch';
import SuccessModal from '../components/SuccessModal';

export default function Create() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    location_address: '',
    start_time: '',
    end_time: '',
    description: '',
    club_name: '',
    category: '',
    event_link: '',
    free_food: false
  });
  const [coordinates, setCoordinates] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdEventId, setCreatedEventId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category === category ? '' : category
    }));
    setFieldErrors(prev => ({ ...prev, category: '' }));
  };

  const handleToggleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMapLocationSelect = async (lat, lng) => {
    setCoordinates({ lat, lng });
    
    const result = await reverseGeocode(lat, lng);
    if (result.success) {
      setFormData(prev => ({
        ...prev,
        location_address: result.address
      }));
    }
  };

  const handleImageSelect = (file) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    if (!formData.location_address.trim()) {
      errors.location_address = 'Location is required';
    }
    if (!formData.start_time) {
      errors.start_time = 'Start time is required';
    }
    if (!formData.end_time) {
      errors.end_time = 'End time is required';
    }
    
    if (formData.start_time && formData.end_time) {
      const startDate = new Date(formData.start_time);
      const endDate = new Date(formData.end_time);
      if (endDate <= startDate) {
        errors.end_time = 'End time must be after start time';
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!validateForm()) {
      setError('Please fix the errors above');
      return;
    }

    setLoading(true);

    const startDate = new Date(formData.start_time);
    const endDate = new Date(formData.end_time);

    try {
      let imageUrl = null;

      if (imageFile) {
        const uploadResult = await uploadEventImage(imageFile, user.id);
        if (uploadResult.success) {
          imageUrl = uploadResult.url;
        } else {
          setError(`Image upload failed: ${uploadResult.error}`);
          setLoading(false);
          return;
        }
      }

      const eventData = {
        creator_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        location_address: formData.location_address.trim(),
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
      };

      if (coordinates) {
        eventData.location_lat = coordinates.lat;
        eventData.location_lng = coordinates.lng;
      } else {
        const geocodeResult = await geocodeAddress(formData.location_address.trim());
        if (geocodeResult.success) {
          eventData.location_lat = geocodeResult.lat;
          eventData.location_lng = geocodeResult.lng;
        }
      }

      if (formData.club_name.trim()) {
        eventData.club_name = formData.club_name.trim();
      }

      if (imageUrl) {
        eventData.image_url = imageUrl;
      }

      if (formData.category) {
        eventData.category = formData.category;
      }

      if (formData.event_link.trim()) {
        eventData.event_link = formData.event_link.trim();
      }

      eventData.free_food = formData.free_food;

      const { data: insertData, error: insertError } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();

      if (insertError) throw insertError;

      setCreatedEventId(insertData.id);
      setShowSuccess(true);
      
      setFormData({
        title: '',
        location_address: '',
        start_time: '',
        end_time: '',
        description: '',
        club_name: '',
        category: '',
        event_link: '',
        free_food: false
      });
      setImageFile(null);
      setImagePreview(null);
      setCoordinates(null);
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err.message || 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page create-page">
      <div className="create-header">
        <h1>Create Event</h1>
        <p className="create-subtitle">Share what's happening on campus</p>
      </div>
      
      {error && <div className="error-banner">{error}</div>}
      
      <form className="create-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3 className="section-title">Basic Info</h3>
          <div className="form-group">
            <label htmlFor="title">Event Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Basketball Game, Study Session"
              className={fieldErrors.title ? 'error' : ''}
              autoFocus
            />
            {fieldErrors.title && <span className="field-error">{fieldErrors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What's happening? Who should come?"
              rows="4"
              className={fieldErrors.description ? 'error' : ''}
            />
            {fieldErrors.description && <span className="field-error">{fieldErrors.description}</span>}
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">When & Where</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_time">Start Time *</label>
              <input
                type="datetime-local"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className={fieldErrors.start_time ? 'error' : ''}
              />
              {fieldErrors.start_time && <span className="field-error">{fieldErrors.start_time}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="end_time">End Time *</label>
              <input
                type="datetime-local"
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className={fieldErrors.end_time ? 'error' : ''}
              />
              {fieldErrors.end_time && <span className="field-error">{fieldErrors.end_time}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location_address">Location *</label>
            <input
              type="text"
              id="location_address"
              name="location_address"
              value={formData.location_address}
              onChange={handleChange}
              placeholder="e.g., Talley Student Union, D.H. Hill Library"
              className={fieldErrors.location_address ? 'error' : ''}
            />
            {fieldErrors.location_address && <span className="field-error">{fieldErrors.location_address}</span>}
            <LocationPicker
              onLocationSelect={handleMapLocationSelect}
              initialPosition={coordinates ? [coordinates.lat, coordinates.lng] : null}
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Category</h3>
          <div className="form-group">
            <label>Event Category</label>
            <CategorySelector 
              value={formData.category}
              onChange={handleCategoryChange}
            />
            <p className="input-hint">Select a category to help people discover your event</p>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Event Details</h3>
          
          <div className="form-group">
            <label htmlFor="image-upload">Event Flyer/Image</label>
            <ImageUpload onImageSelect={handleImageSelect} />
            {imagePreview && (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Event preview" className="event-image-preview" />
                <button
                  type="button"
                  className="remove-preview-btn"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                >
                  ✕ Remove
                </button>
              </div>
            )}
            <p className="input-hint">Upload a flyer or image (max 5MB, optional)</p>
          </div>

          <div className="form-group">
            <label htmlFor="club_name">Club/Organization</label>
            <input
              type="text"
              id="club_name"
              name="club_name"
              value={formData.club_name}
              onChange={handleChange}
              placeholder="e.g., Computer Science Club (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="event_link">Event Link (Optional)</label>
            <input
              type="url"
              id="event_link"
              name="event_link"
              value={formData.event_link}
              onChange={handleChange}
              placeholder="e.g., RSVP link, Instagram, website"
            />
            <p className="input-hint">Add a link for RSVP, more info, or social media</p>
          </div>

          <div className="toggles-group">
            <ToggleSwitch
              label="Free Food Available"
              icon="🍕"
              checked={formData.free_food}
              onChange={(value) => handleToggleChange('free_food', value)}
            />
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? (
            <>
              <span className="btn-spinner"></span>
              Posting...
            </>
          ) : (
            'Post Event 🎉'
          )}
        </button>
      </form>

      <SuccessModal 
        show={showSuccess} 
        onClose={() => {
          setShowSuccess(false);
          setFormData({
            title: '',
            location_address: '',
            start_time: '',
            end_time: '',
            description: '',
            club_name: '',
            category: '',
            event_link: '',
            free_food: false
          });
        }}
        eventId={createdEventId}
      />
    </div>
  );
}
