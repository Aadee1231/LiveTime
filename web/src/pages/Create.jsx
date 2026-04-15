import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { geocodeAddress, reverseGeocode } from '../lib/geocoding';
import { uploadEventImage } from '../lib/storage';
import LocationPicker from '../components/LocationPicker';
import ImageUpload from '../components/ImageUpload';

export default function Create() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    location_address: '',
    start_time: '',
    end_time: '',
    description: '',
    club_name: ''
  });
  const [coordinates, setCoordinates] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.location_address.trim() || 
        !formData.start_time || !formData.end_time || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    const startDate = new Date(formData.start_time);
    const endDate = new Date(formData.end_time);

    if (endDate <= startDate) {
      setError('End time must be after start time');
      return;
    }

    setLoading(true);

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

      const { error: insertError } = await supabase
        .from('events')
        .insert(eventData);

      if (insertError) throw insertError;

      navigate('/feed');
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
        <h1>Post Event</h1>
        <p className="create-subtitle">Share what's happening on campus</p>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <form className="create-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Event Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Basketball Game, Study Session"
            required
            autoFocus
          />
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
            required
          />
          <LocationPicker
            onLocationSelect={handleMapLocationSelect}
            initialPosition={coordinates ? [coordinates.lat, coordinates.lng] : null}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="start_time">Start *</label>
            <input
              type="datetime-local"
              id="start_time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="end_time">End *</label>
            <input
              type="datetime-local"
              id="end_time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="What's happening? Who should come?"
            rows="3"
            required
          />
        </div>

        <div className="form-divider"></div>

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
          <label htmlFor="image-upload">Event Flyer/Image</label>
          <ImageUpload onImageSelect={handleImageSelect} />
          <p className="input-hint">Upload a flyer or image (max 5MB, optional)</p>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Posting...' : 'Post Event'}
        </button>
      </form>
    </div>
  );
}
