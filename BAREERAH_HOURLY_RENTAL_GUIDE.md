# Bareerah Hourly Rental System - Complete Integration Guide

**Last Updated:** November 30, 2025  
**Status:** ✅ Production Ready  
**Version:** 1.0

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Rental Pricing Rules](#rental-pricing-rules)
4. [API Endpoints](#api-endpoints)
5. [Examples & CURL Commands](#examples--curl-commands)
6. [Integration Steps](#integration-steps)
7. [Error Handling](#error-handling)
8. [FAQ](#faq)

---

## Overview

The new **Hourly Rental System** allows customers to book vehicles for extended periods (3-14 hours) at calculated hourly rates. It's a separate booking type that works alongside point-to-point, round-trip, and multi-stop bookings.

### Key Features:
- ✅ Configurable hourly rates per vehicle type
- ✅ Minimum 3 hours, maximum 14 hours rental period
- ✅ Automatic fare calculation based on hours
- ✅ Admin can edit pricing anytime
- ✅ New vehicle types can be added
- ✅ Email notifications for rental bookings
- ✅ Integrated with existing booking system

### Booking Types Available:
1. **point_to_point** - From A to B (existing)
2. **round_trip** - A → B → A with wait time (existing)
3. **multi_stop** - Multiple stops in one journey (existing)
4. **hourly_rental** - ✨ NEW - Vehicle for X hours

---

## Database Schema

### 1. rental_rules Table (NEW)

```sql
CREATE TABLE rental_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_type VARCHAR(255) NOT NULL UNIQUE,
  hourly_rate_aed DECIMAL(10,2) NOT NULL,
  min_hours INT NOT NULL DEFAULT 3,
  max_hours INT NOT NULL DEFAULT 14,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Fields:**
- `id` - Unique identifier (UUID)
- `vehicle_type` - Vehicle category (e.g., "classic", "executive", "luxury_suv")
- `hourly_rate_aed` - Price per hour in AED
- `min_hours` - Minimum rental hours (default: 3)
- `max_hours` - Maximum rental hours (default: 14)
- `is_active` - Enable/disable this vehicle for rental
- `created_at` - Record creation time
- `updated_at` - Last update time

**Pre-populated Data:**
```sql
INSERT INTO rental_rules (vehicle_type, hourly_rate_aed, min_hours, max_hours) VALUES
('classic', 95.00, 3, 14),
('executive', 105.00, 3, 14),
('first_class', 150.00, 3, 14),
('urban_suv', 108.00, 3, 14),
('luxury_suv', 450.00, 3, 14),
('elite_van', 165.00, 3, 14),
('mini_bus', 1050.00, 3, 14);
```

---

### 2. bookings Table (MODIFIED)

Two new columns added to existing `bookings` table:

```sql
ALTER TABLE bookings ADD COLUMN rental_hours INT;
ALTER TABLE bookings ADD COLUMN hourly_rate_aed DECIMAL(10,2);
```

**New Fields:**
- `rental_hours` - Number of hours booked (only for hourly_rental type)
- `hourly_rate_aed` - Hourly rate used for this booking

**Indexes Created:**
```sql
CREATE INDEX idx_bookings_type ON bookings(booking_type);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);
```

---

### 3. Booking Data Structure

When creating hourly rental booking, this data is stored:

```json
{
  "id": "uuid",
  "customer_name": "Ahmed Al Mansouri",
  "customer_phone": "+971501234567",
  "customer_email": "ahmed@example.ae",
  "pickup_location": "Dubai Marina",
  "dropoff_location": "Dubai Marina",
  "booking_type": "hourly_rental",
  "vehicle_type": "classic",
  "vehicle_model": "Toyota Camry",
  "vehicle_color": "White",
  "passengers_count": 2,
  "luggage_count": 1,
  "rental_hours": 5,
  "hourly_rate_aed": 95,
  "fare_aed": 475,
  "payment_method": "card",
  "notes": "Airport transfer, need wifi in vehicle",
  "status": "pending",
  "booking_source": "bareerah_ai",
  "created_at": "2025-11-30T19:15:00.000Z"
}
```

---

## Rental Pricing Rules

### Current Vehicle Types & Rates

| Vehicle Type | Hourly Rate | Min Hours | Max Hours | 3-Hour Total | 14-Hour Total |
|---|---|---|---|---|---|
| **classic** | AED 95 | 3 | 14 | AED 285 | AED 1,330 |
| **executive** | AED 105 | 3 | 14 | AED 315 | AED 1,470 |
| **first_class** | AED 150 | 3 | 14 | AED 450 | AED 2,100 |
| **urban_suv** | AED 108 | 3 | 14 | AED 324 | AED 1,512 |
| **luxury_suv** | AED 450 | 3 | 14 | AED 1,350 | AED 6,300 |
| **elite_van** | AED 165 | 3 | 14 | AED 495 | AED 2,310 |
| **mini_bus** | AED 1,050 | 3 | 14 | AED 3,150 | AED 14,700 |

### Fare Calculation Formula:
```
Total Fare = Hourly Rate × Number of Hours
```

**Example:**
- Vehicle: Classic (AED 95/hour)
- Duration: 5 hours
- Total Fare: 95 × 5 = **AED 475**

---

## API Endpoints

### Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

### 1. Create Hourly Rental Booking

**Endpoint:** `POST /api/bookings/create-hourly-rental`

**Required Permission:** `admin` or `operator` role

**Request Body:**
```json
{
  "customer_name": "Ahmed Al Mansouri",
  "customer_phone": "+971501234567",
  "customer_email": "ahmed@example.ae",
  "pickup_location": "Dubai Marina",
  "vehicle_type": "classic",
  "vehicle_model": "Toyota Camry",
  "vehicle_color": "White",
  "passengers_count": 2,
  "luggage_count": 1,
  "rental_hours": 5,
  "payment_method": "card",
  "notes": "Need wifi in vehicle",
  "booking_source": "bareerah_ai"
}
```

**Required Fields:**
- `customer_name` (string)
- `customer_phone` (string) - E.164 format: +971...
- `customer_email` (string)
- `pickup_location` (string)
- `vehicle_type` (string)
- `rental_hours` (integer) - 3-14 hours

**Optional Fields:**
- `vehicle_model` (string)
- `vehicle_color` (string)
- `passengers_count` (integer) - default: 1
- `luggage_count` (integer) - default: 0
- `payment_method` (string) - "card" or "cash"
- `notes` (string) - up to 2000 characters
- `booking_source` (string) - for tracking

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Hourly rental booking created successfully",
  "booking": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "customer_name": "Ahmed Al Mansouri",
    "booking_type": "hourly_rental",
    "vehicle_type": "classic",
    "vehicle_model": "Toyota Camry",
    "vehicle_color": "White",
    "rental_hours": 5,
    "hourly_rate_aed": 95,
    "fare_aed": 475,
    "status": "pending",
    "created_at": "2025-11-30T19:15:00.000Z"
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "error": "Hours must be between 3 and 14"
}
```

---

### 2. Get All Rental Rules

**Endpoint:** `GET /api/bookings/rental-rules/all`

**Required Permission:** `admin` role

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "vehicle_type": "classic",
      "hourly_rate_aed": 95,
      "min_hours": 3,
      "max_hours": 14,
      "is_active": true,
      "created_at": "2025-11-30T19:00:00.000Z",
      "updated_at": "2025-11-30T19:00:00.000Z"
    },
    {
      "id": "uuid-2",
      "vehicle_type": "executive",
      "hourly_rate_aed": 105,
      "min_hours": 3,
      "max_hours": 14,
      "is_active": true,
      "created_at": "2025-11-30T19:00:00.000Z",
      "updated_at": "2025-11-30T19:00:00.000Z"
    }
    // ... more vehicles
  ]
}
```

---

### 3. Get Single Rental Rule

**Endpoint:** `GET /api/bookings/rental-rules/:vehicleType`

**Required Permission:** `admin` role

**Path Parameters:**
- `:vehicleType` - Vehicle type (e.g., "classic", "luxury_suv")

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "vehicle_type": "classic",
    "hourly_rate_aed": 95,
    "min_hours": 3,
    "max_hours": 14,
    "is_active": true,
    "created_at": "2025-11-30T19:00:00.000Z",
    "updated_at": "2025-11-30T19:00:00.000Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Rental rule not found"
}
```

---

### 4. Update Rental Rule (Edit Pricing)

**Endpoint:** `PUT /api/bookings/rental-rules/:vehicleType`

**Required Permission:** `admin` role (Admin only - edit pricing)

**Path Parameters:**
- `:vehicleType` - Vehicle type

**Request Body:**
```json
{
  "hourly_rate_aed": 110,
  "min_hours": 3,
  "max_hours": 14
}
```

**Fields (all optional):**
- `hourly_rate_aed` (number) - New hourly rate
- `min_hours` (integer) - New minimum hours
- `max_hours` (integer) - New maximum hours

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "vehicle_type": "classic",
    "hourly_rate_aed": 110,
    "min_hours": 3,
    "max_hours": 14,
    "is_active": true,
    "updated_at": "2025-11-30T19:30:00.000Z"
  },
  "message": "Rental rule updated successfully"
}
```

**Validation Errors:**
```json
{
  "success": false,
  "error": "Hourly rate must be greater than 0"
}
```

---

### 5. Create New Rental Rule (Add Vehicle)

**Endpoint:** `POST /api/bookings/rental-rules/create`

**Required Permission:** `admin` role (Admin only - add vehicles)

**Request Body:**
```json
{
  "vehicle_type": "new_vehicle_type",
  "hourly_rate_aed": 200,
  "min_hours": 3,
  "max_hours": 14
}
```

**Required Fields:**
- `vehicle_type` (string) - Unique vehicle identifier
- `hourly_rate_aed` (number) - Hourly rate

**Optional Fields:**
- `min_hours` (integer) - default: 3
- `max_hours` (integer) - default: 14

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "vehicle_type": "new_vehicle_type",
    "hourly_rate_aed": 200,
    "min_hours": 3,
    "max_hours": 14,
    "is_active": true,
    "created_at": "2025-11-30T19:30:00.000Z"
  },
  "message": "Rental rule created/updated successfully"
}
```

---

### 6. Calculate Rental Fare

**Endpoint:** `POST /api/bookings/rental-rules/calculate-fare`

**Required Permission:** Any authenticated user

**Request Body:**
```json
{
  "vehicle_type": "classic",
  "hours": 5
}
```

**Required Fields:**
- `vehicle_type` (string)
- `hours` (integer) - Must be between min and max hours

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "vehicle_type": "classic",
    "hours": 5,
    "hourly_rate": 95,
    "total_fare": 475,
    "min_hours": 3,
    "max_hours": 14
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Hours must be between 3 and 14"
}
```

---

### 7. Get Bookings with Filtering

**Endpoint:** `GET /api/bookings?booking_type=hourly_rental&limit=30&offset=0`

**Required Permission:** Authenticated user

**Query Parameters:**
- `booking_type` (string) - Filter by type:
  - `all` - All booking types
  - `point_to_point` - Point-to-point bookings
  - `round_trip` - Round-trip bookings
  - `multi_stop` - Multi-stop bookings
  - `hourly_rental` - Hourly rental bookings
- `limit` (integer) - Max 30 bookings per page (default: 30)
- `offset` (integer) - Pagination offset (default: 0)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "customer_name": "Ahmed Al Mansouri",
      "booking_type": "hourly_rental",
      "rental_hours": 5,
      "hourly_rate_aed": 95,
      "fare_aed": 475,
      "status": "pending",
      "created_at": "2025-11-30T19:15:00.000Z"
    },
    // ... more bookings (max 30)
  ],
  "pagination": {
    "limit": 30,
    "offset": 0,
    "total": 156
  }
}
```

---

## Examples & CURL Commands

### Example 1: Get JWT Token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Response:
# {
#   "success": true,
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "user": {
#     "username": "admin",
#     "role": "admin"
#   }
# }
```

**Save token:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Example 2: Create 5-Hour Rental Booking

```bash
curl -X POST http://localhost:5000/api/bookings/create-hourly-rental \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Ahmed Al Mansouri",
    "customer_phone": "+971501234567",
    "customer_email": "ahmed@example.ae",
    "pickup_location": "Dubai Marina",
    "vehicle_type": "classic",
    "vehicle_model": "Toyota Camry",
    "vehicle_color": "White",
    "passengers_count": 2,
    "luggage_count": 1,
    "rental_hours": 5,
    "payment_method": "card",
    "notes": "Need wifi in vehicle"
  }'

# Response:
# {
#   "success": true,
#   "message": "Hourly rental booking created successfully",
#   "booking": {
#     "id": "550e8400-...",
#     "fare_aed": 475,
#     "rental_hours": 5,
#     "status": "pending"
#   }
# }
```

---

### Example 3: View All Rental Rules

```bash
curl -X GET http://localhost:5000/api/bookings/rental-rules/all \
  -H "Authorization: Bearer $TOKEN"

# Response shows all 7 vehicle types with their rates
```

---

### Example 4: Edit Classic Vehicle Rate (Increase to AED 120/hour)

```bash
curl -X PUT http://localhost:5000/api/bookings/rental-rules/classic \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hourly_rate_aed": 120
  }'

# Response:
# {
#   "success": true,
#   "message": "Rental rule updated successfully",
#   "data": {
#     "vehicle_type": "classic",
#     "hourly_rate_aed": 120
#   }
# }
```

---

### Example 5: Add New Vehicle Type

```bash
curl -X POST http://localhost:5000/api/bookings/rental-rules/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_type": "premium_suv",
    "hourly_rate_aed": 300,
    "min_hours": 3,
    "max_hours": 14
  }'
```

---

### Example 6: Calculate Fare for 8-Hour Executive Rental

```bash
curl -X POST http://localhost:5000/api/bookings/rental-rules/calculate-fare \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_type": "executive",
    "hours": 8
  }'

# Response:
# {
#   "success": true,
#   "data": {
#     "vehicle_type": "executive",
#     "hours": 8,
#     "hourly_rate": 105,
#     "total_fare": 840,
#     "min_hours": 3,
#     "max_hours": 14
#   }
# }
```

---

### Example 7: Get All Hourly Rental Bookings (Paginated)

```bash
# Get first 30 hourly rental bookings
curl -X GET "http://localhost:5000/api/bookings?booking_type=hourly_rental&limit=30&offset=0" \
  -H "Authorization: Bearer $TOKEN"

# Get next 30 (page 2)
curl -X GET "http://localhost:5000/api/bookings?booking_type=hourly_rental&limit=30&offset=30" \
  -H "Authorization: Bearer $TOKEN"
```

---

### Example 8: Create 14-Hour Luxury SUV Rental (Maximum Duration)

```bash
curl -X POST http://localhost:5000/api/bookings/create-hourly-rental \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Mohammed Ahmed",
    "customer_phone": "+971505555555",
    "customer_email": "mohammed@example.ae",
    "pickup_location": "Dubai Airport",
    "vehicle_type": "luxury_suv",
    "vehicle_model": "Cadillac Escalade",
    "vehicle_color": "Black",
    "passengers_count": 4,
    "luggage_count": 3,
    "rental_hours": 14,
    "payment_method": "card",
    "notes": "Full-day corporate event transport"
  }'

# Total Fare: 450 × 14 = AED 6,300
```

---

## Integration Steps

### Step 1: Authenticate
Get JWT token with admin/operator credentials:
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.token')
```

### Step 2: View Current Rental Pricing
```bash
curl -s http://localhost:5000/api/bookings/rental-rules/all \
  -H "Authorization: Bearer $TOKEN" | jq '.data'
```

### Step 3: Create Hourly Rental Booking
```bash
curl -X POST http://localhost:5000/api/bookings/create-hourly-rental \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{booking data}'
```

### Step 4: Monitor Bookings
```bash
curl -s "http://localhost:5000/api/bookings?booking_type=hourly_rental" \
  -H "Authorization: Bearer $TOKEN" | jq '.data'
```

### Step 5: Edit Pricing (Optional)
```bash
curl -X PUT http://localhost:5000/api/bookings/rental-rules/classic \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"hourly_rate_aed": 120}'
```

---

## Error Handling

### Common Errors & Responses

**1. Invalid Hours (Outside 3-14 range)**
```json
{
  "success": false,
  "error": "Hours must be between 3 and 14"
}
```

**2. Missing Required Fields**
```json
{
  "success": false,
  "error": "Missing required fields"
}
```

**3. Invalid Vehicle Type**
```json
{
  "success": false,
  "error": "No rental rule found for vehicle type: invalid_type"
}
```

**4. Unauthorized (Missing Token)**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**5. Insufficient Permissions (Not Admin)**
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

**6. Negative or Zero Hourly Rate**
```json
{
  "success": false,
  "error": "Hourly rate must be greater than 0"
}
```

---

## FAQ

**Q: Can I book less than 3 hours?**  
A: No, minimum is 3 hours. System will reject booking with error: "Hours must be between 3 and 14"

**Q: Can I book more than 14 hours?**  
A: No, maximum is 14 hours. For longer rentals, use multiple bookings.

**Q: What's the fare calculation?**  
A: `Total Fare = Hourly Rate × Number of Hours`. No hidden charges.

**Q: Can I change pricing after booking?**  
A: No, the rate is locked when booking is created. New bookings use updated rates.

**Q: Which payment methods are accepted?**  
A: Card or Cash (specified at booking time)

**Q: Can I cancel hourly rental?**  
A: Use standard booking update endpoint to change status.

**Q: Are emails sent for rental bookings?**  
A: Yes, professional notification sent to customer_email automatically.

**Q: Can Bareerah WhatsApp AI create rentals?**  
A: Yes! Use booking_source: "bareerah_ai" in request.

**Q: What vehicles are available for rental?**  
A: All 7 vehicle types (classic, executive, first_class, urban_suv, luxury_suv, elite_van, mini_bus)

**Q: How do I add a new vehicle type?**  
A: POST to `/api/bookings/rental-rules/create` with vehicle_type and hourly_rate_aed

**Q: What's the booking_source field for?**  
A: Tracking origin - use "bareerah_ai" for WhatsApp AI bookings, "admin" for manual bookings

---

## Quick Reference

### Base URL
```
http://localhost:5000/api/bookings
```

### Headers Required
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

### Rental Rules Fixed
- Min Hours: 3 (always)
- Max Hours: 14 (always)
- Pricing: Per hour (AED)
- No distance-based calculation

### Booking Type Value
```
"hourly_rental"
```

### Vehicle Color Options
Black, White, Silver, Gray, Red, Blue, Gold

### Status Values
- pending (new bookings start here)
- in_progress
- completed
- cancelled

---

## Production Checklist

- ✅ Database schema created
- ✅ 7 vehicle types pre-configured
- ✅ All API endpoints live
- ✅ Authentication required
- ✅ Email notifications active
- ✅ Error handling complete
- ✅ Pagination implemented
- ✅ Backward compatible (no breaking changes)
- ✅ Indexed for performance

---

**Ready for Bareerah integration!** 🚀

For technical support or questions, contact the development team.

**Last Updated:** November 30, 2025
