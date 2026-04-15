export async function geocodeAddress(address) {
  try {
    const query = encodeURIComponent(`${address}, Raleigh, NC`);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&countrycodes=us`,
      {
        headers: {
          'User-Agent': 'LiveTime-MVP/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        success: true
      };
    }

    return {
      lat: null,
      lng: null,
      success: false,
      error: 'Address not found'
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      lat: null,
      lng: null,
      success: false,
      error: error.message
    };
  }
}

export async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      {
        headers: {
          'User-Agent': 'LiveTime-MVP/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding request failed');
    }

    const data = await response.json();

    if (data && data.display_name) {
      const address = data.address || {};
      const parts = [];
      
      if (address.building || address.house_number) {
        parts.push(address.building || address.house_number);
      }
      if (address.road) {
        parts.push(address.road);
      }
      if (address.suburb || address.neighbourhood) {
        parts.push(address.suburb || address.neighbourhood);
      }
      
      const shortAddress = parts.length > 0 ? parts.join(', ') : data.display_name.split(',')[0];
      
      return {
        address: shortAddress,
        fullAddress: data.display_name,
        success: true
      };
    }

    return {
      address: null,
      success: false,
      error: 'Address not found'
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      address: null,
      success: false,
      error: error.message
    };
  }
}
