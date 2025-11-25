const RATES = {
  perKm: {
    sedan: 3.5,
    suv: 4.5,
    luxury: 6.5
  },
  pickupFee: 5,
  hourly: {
    sedan: { rate: 75, minHours: 2, includedKmPerHour: 20 },
    suv: { rate: 90, minHours: 2, includedKmPerHour: 20 },
    luxury: { rate: 150, minHours: 2, includedKmPerHour: 20 }
  }
};

function calculateFare(bookingType, vehicleType, distanceKm = 0, hours = 0) {
  let fareBeforeDiscount = 0;
  
  if (bookingType === 'point') {
    const ratePerKm = RATES.perKm[vehicleType] || RATES.perKm.sedan;
    fareBeforeDiscount = RATES.pickupFee + (distanceKm * ratePerKm);
  } else if (bookingType === 'hourly') {
    const hourlyConfig = RATES.hourly[vehicleType] || RATES.hourly.sedan;
    const billedHours = Math.max(hours, hourlyConfig.minHours);
    fareBeforeDiscount = billedHours * hourlyConfig.rate;
  }
  
  const fareAfterDiscount = fareBeforeDiscount;
  
  return {
    fare_before_discount: Math.round(fareBeforeDiscount * 100) / 100,
    fare_after_discount: Math.round(fareAfterDiscount * 100) / 100
  };
}

module.exports = {
  RATES,
  calculateFare
};
