#!/bin/bash

# ============================================================
# BAREERAH AI - BOOKING API EXAMPLE
# ============================================================

BASE_URL="https://5ef5530c-38d9-4731-b470-827087d7bc6f-00-2j327r1fnap1d.sisko.replit.dev"

# STEP 1: Get JWT Token
echo "🔑 STEP 1: Getting JWT Token..."
TOKEN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }')

echo "Token Response: $TOKEN_RESPONSE"
TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "✅ Token obtained: $TOKEN"

# STEP 2: Calculate Fare (Optional)
echo ""
echo "💰 STEP 2: Calculating Fare (Optional)..."
curl -s -X POST "$BASE_URL/api/bookings/calculate-fare" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_type": "point_to_point",
    "vehicle_type": "sedan",
    "distance_km": 25.5
  }' | python -m json.tool

# STEP 3: Create Booking
echo ""
echo "📍 STEP 3: Creating Booking..."
curl -s -X POST "$BASE_URL/api/bookings/create-manual" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Shahid Khan",
    "customer_phone": "+971501234567",
    "customer_email": "shahid@example.com",
    "booking_type": "point_to_point",
    "vehicle_type": "sedan",
    "distance_km": 25.5,
    "passengers_count": 3,
    "luggage_count": 2,
    "pickup_location": "Dubai Marina Mall",
    "dropoff_location": "Sharjah Airport"
  }' | python -m json.tool

echo ""
echo "✅ BOOKING CREATED SUCCESSFULLY!"
