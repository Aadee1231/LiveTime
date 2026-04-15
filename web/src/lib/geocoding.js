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
