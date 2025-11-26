const RATES = {
  perKm: {
    sedan: 3.5,
    suv: 4.5,
    luxury: 6.5,
    van: 5.0
  },
  hourly: {
    sedan: 75,
    suv: 90,
    luxury: 150,
    van: 120
  }
};

/**
 * STRICT fare calculation with surcharges
 * @param {string} booking_type - point_to_point, airport_transfer, city_tour, hourly_rental
 * @param {string} vehicle_type - sedan, suv, luxury, van
 * @param {number} distance_km - required for distance-based bookings
 * @param {number} hours - required for time-based bookings
 * @returns {object} {distance_km, vehicle_type, booking_type, fare, currency}
 */
function calculateFare(booking_type, vehicle_type, distance_km = 0, hours = 0) {
  // STRICT validation - no fallbacks
  if (!booking_type || !vehicle_type) {
    throw new Error('Missing required fields: booking_type and vehicle_type');
  }

  if (!distance_km && !hours) {
    throw new Error('Either distance_km or hours must be provided');
  }

  const validTypes = ['point_to_point', 'airport_transfer', 'city_tour', 'hourly_rental'];
  if (!validTypes.includes(booking_type)) {
    throw new Error(`Invalid booking_type. Must be one of: ${validTypes.join(', ')}`);
  }

  const validVehicles = Object.keys(RATES.perKm);
  if (!validVehicles.includes(vehicle_type)) {
    throw new Error(`Invalid vehicle_type. Must be one of: ${validVehicles.join(', ')}`);
  }

  let fare = 0;

  if (booking_type === 'hourly_rental' || booking_type === 'city_tour') {
    // Time-based: use hourly rate
    if (!hours || hours <= 0) {
      throw new Error('hours is required and must be > 0 for hourly bookings');
    }
    fare = hours * (RATES.hourly[vehicle_type] || RATES.hourly.sedan);
  } else {
    // Distance-based
    if (!distance_km || distance_km <= 0) {
      throw new Error('distance_km is required and must be > 0 for distance-based bookings');
    }

    const perKmRate = RATES.perKm[vehicle_type] || RATES.perKm.sedan;
    let baseFare = distance_km * perKmRate;

    // Apply surcharges
    if (booking_type === 'airport_transfer') {
      baseFare = baseFare * 1.10; // +10% surcharge
    }

    fare = baseFare;
  }

  // Round to 2 decimals
  fare = Math.round(fare * 100) / 100;

  return {
    distance_km: distance_km || 0,
    hours: hours || 0,
    vehicle_type,
    booking_type,
    fare,
    currency: 'AED'
  };
}

module.exports = {
  RATES,
  calculateFare
};
