# BAREERAH BACKEND INTEGRATION GUIDE
**Star Skyline Limousine - Dubai Limo Booking System**

**Last Updated:** 2025-11-28  
**Backend Version:** 1.0  
**API Base URL:** `https://your-domain.com/api`

---

## 📋 TABLE OF CONTENTS
1. [Authentication](#authentication)
2. [Available Vehicle Types](#available-vehicle-types)
3. [Fare Calculation Rules](#fare-calculation-rules)
4. [API Endpoints](#api-endpoints)
5. [Database Reference](#database-reference)
6. [Error Handling](#error-handling)

---

## 🔐 AUTHENTICATION

### Login Endpoint
**Endpoint:** `POST /auth/login`  
**No Token Required** (first call only)

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**Token Details:**
- Valid for: 24 hours
- Include in all requests: `Authorization: Bearer {token}`
- Refresh: Call login again when expired

---

## 🚗 AVAILABLE VEHICLE TYPES

### Fare Rule Categories (7 Types)

| Vehicle Type | Base Fare (AED) | Per KM Rate (AED) | Notes |
|--------------|-----------------|-------------------|-------|
| **classic** | 95.00 | 1.00 | Standard sedan vehicles |
| **executive** | 105.00 | 1.00 | Premium sedans (Tesla, Lexus) |
| **urban_suv** | 108.00 | 1.00 | Modern SUVs |
| **luxury_suv** | 450.00 | 0.00 | Flat rate - NO per-km charge |
| **elite_van** | 165.00 | 2.00 | Premium vans (7-seater) |
| **mini_bus** | 1050.00 | 12.50 | 12-14 seater buses |
| **elite_van_vip** | 750.00 | 10.00 | VIP service (optional) |

---

## 📊 VEHICLE INVENTORY

### Classic (Sedan) - 3 Vehicles
- Honda Civic (4 pax, 3 luggage)
- Toyota Camry (4 pax, 3 luggage)
- Toyota Corolla (4 pax, 3 luggage)
- BYD Han (4 pax, 2 luggage)

### Executive - 4 Vehicles
- Lexus ES 300H (4 pax, 3 luggage)
- Mercedes E Class (4 pax, 3 luggage)
- Tesla Model 3 (4 pax, 2 luggage)
- Tesla Model Y (5 pax, 3 luggage)

### Urban SUV - 2 Vehicles
- BYD Song (5 pax, 4 luggage)
- Toyota Highlander (7 pax, 4 luggage)

### Luxury SUV - 2 Vehicles
- Cadillac Escalade (7 pax, 5 luggage)
- GMC Yukon (6 pax, 5 luggage)

### First Class - 3 Vehicles
- Audi A8 (4 pax, 3 luggage)
- BMW 7 Series (4 pax, 3 luggage)
- Mercedes S Class (4 pax, 3 luggage)

### Luxury (Premium) - 5 Vehicles
- BMW 5 Series (4 pax, 3 luggage)
- BMW 7 Series (4 pax, 3 luggage)
- BYD Han (4 pax, 3 luggage)
- Lexus (4 pax, 3 luggage)
- Mercedes E-Class (4 pax, 3 luggage)
- Tesla (4 pax, 2 luggage)

### Elite Van - 1 Vehicle
- Mercedes V Class (7 pax, 5 luggage)

### Mini Bus - 2 Vehicles
- Mercedes Sprinter (12 pax, 8 luggage)
- Toyota Hiace (14 pax, 8 luggage)

---

## 💰 FARE CALCULATION RULES

### Formula
```
Fare = Base Fare + (Distance in KM × Per KM Rate)
```

### Examples

**Example 1: Classic Sedan, 50 km**
```
Fare = 95 + (50 × 1.00) = 145 AED
```

**Example 2: Urban SUV, 100 km**
```
Fare = 108 + (100 × 1.00) = 208 AED
```

**Example 3: Luxury SUV (Flat Rate)**
```
Fare = 450 + (100 × 0) = 450 AED (regardless of distance)
```

**Example 4: Elite Van, 75 km**
```
Fare = 165 + (75 × 2.00) = 315 AED
```

**Example 5: Mini Bus, 120 km**
```
Fare = 1050 + (120 × 12.50) = 2550 AED
```

### Special Rules
- **Minimum Distance:** 2 km (for calculation purposes)
- **Luxury SUV:** Fixed rate - distance doesn't affect price
- **Airport Transfer:** +10% surcharge on calculated fare
- **City Tour:** Uses hourly rates (75-150 AED/hour)

---

## 🔌 API ENDPOINTS FOR BAREERAH

### 1. Calculate Fare
**Endpoint:** `POST /bookings/calculate-fare`  
**Authentication:** Required (Bearer token)

**Request:**
```json
{
  "distance_km": 36.4,
  "vehicle_type": "classic",
  "booking_type": "point_to_point"
}
```

**Allowed Values:**
- `vehicle_type`: classic, executive, urban_suv, luxury_suv, elite_van, mini_bus
- `booking_type`: point_to_point, airport_transfer, city_tour, hourly_rental
- `distance_km`: > 0 (decimal allowed)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "distance_km": 36.4,
    "vehicle_type": "classic",
    "booking_type": "point_to_point",
    "fare": 131.40,
    "currency": "AED",
    "breakdown": {
      "base_fare": 95.00,
      "distance_charge": 36.40,
      "surcharge": 0,
      "total": 131.40
    }
  }
}
```

**Error Responses:**
```json
// 400 - Invalid input
{
  "success": false,
  "error": "distance_km must be greater than 0"
}

// 401 - Unauthorized
{
  "success": false,
  "error": "Invalid or expired token"
}

// 500 - Server error
{
  "success": false,
  "error": "Failed to calculate fare"
}
```

---

### 2. Get Vehicles
**Endpoint:** `GET /vehicles`  
**Authentication:** Required (Bearer token)

**Query Parameters (Optional):**
- `type`: Filter by vehicle type (e.g., `?type=classic`)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "vehicle-uuid",
      "model": "Honda Civic",
      "type": "classic",
      "plate_number": "ABU-3001",
      "max_passengers": 4,
      "max_luggage": 3,
      "status": "available",
      "per_km_price": "3.50",
      "hourly_price": "75.00"
    },
    ...
  ]
}
```

---

### 3. Create Booking (Manual/Bareerah)
**Endpoint:** `POST /bookings/create-manual`  
**Authentication:** Required (Bearer token)  
**Role Required:** admin

**Request:**
```json
{
  "customer_name": "Ahmed Al Maktoum",
  "customer_phone": "+971501234567",
  "customer_email": "ahmed@email.com",
  "pickup_location": "Dubai Marina Mall",
  "dropoff_location": "Sharjah Airport",
  "distance_km": 36.4,
  "booking_type": "point_to_point",
  "vehicle_type": "classic",
  "vehicle_model": "Honda Civic",
  "passengers_count": 3,
  "luggage_count": 2,
  "payment_method": "cash",
  "booking_source": "bareerah"
}
```

**Required Fields:**
- customer_name (2-100 characters)
- customer_phone (valid phone format)
- pickup_location
- dropoff_location
- distance_km (> 0)
- booking_type
- vehicle_type
- passengers_count (≥ 1)
- luggage_count (≥ 0)
- payment_method (cash, card, wallet)

**Optional Fields:**
- customer_email
- vehicle_model

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "booking": {
    "id": "booking-uuid",
    "customer_name": "Ahmed Al Maktoum",
    "customer_phone": "+971501234567",
    "pickup_location": "Dubai Marina Mall",
    "dropoff_location": "Sharjah Airport",
    "distance_km": 36.4,
    "fare_aed": 131.40,
    "vehicle_type": "classic",
    "booking_type": "point_to_point",
    "passengers_count": 3,
    "luggage_count": 2,
    "status": "in-process",
    "booking_source": "bareerah",
    "created_at": "2025-11-28T18:00:00Z"
  }
}
```

**Error Responses:**
```json
// 400 - Missing required field
{
  "success": false,
  "error": "customer_name is required"
}

// 400 - Validation error
{
  "success": false,
  "error": "passengers_count must be >= 1"
}

// 401 - Unauthorized
{
  "success": false,
  "error": "Invalid or expired token"
}

// 500 - Database error
{
  "success": false,
  "error": "Failed to create booking"
}
```

---

### 4. Get Booking Status
**Endpoint:** `GET /bookings/{booking_id}`  
**Authentication:** Required (Bearer token)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "customer_name": "Ahmed Al Maktoum",
    "status": "in-process",
    "vehicle_type": "classic",
    "fare_aed": 131.40,
    "driver_id": "driver-uuid or null",
    "driver_name": "Driver Name or null",
    "assigned_vehicle_id": "vehicle-uuid or null",
    "created_at": "2025-11-28T18:00:00Z"
  }
}
```

---

### 5. Get Fare Rules (for reference)
**Endpoint:** `GET /fare-rules`  
**Authentication:** Required (Bearer token)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "vehicle_type": "classic",
      "base_fare": 95.00,
      "per_km_rate": 1.00,
      "active": true
    },
    ...
  ]
}
```

---

## 📊 DATABASE REFERENCE

### Bookings Table Structure
```sql
id: UUID (primary key)
customer_name: VARCHAR(100) - NOT NULL
customer_phone: VARCHAR(20) - NOT NULL
customer_email: VARCHAR(100)
pickup_location: VARCHAR(255) - NOT NULL
dropoff_location: VARCHAR(255) - NOT NULL
distance_km: DECIMAL(10,2)
fare_aed: DECIMAL(10,2) - NOT NULL
booking_type: VARCHAR(50) - [point_to_point, airport_transfer, city_tour, hourly_rental]
vehicle_type: VARCHAR(50) - NOT NULL
vehicle_model: VARCHAR(100)
passengers_count: INT - NOT NULL
luggage_count: INT - NOT NULL
payment_method: VARCHAR(20) - [cash, card, wallet]
status: VARCHAR(50) - [in-process, confirmed, completed, cancelled]
booking_source: VARCHAR(50) - [manually_created, bareerah, etc]
driver_id: UUID
assigned_vehicle_id: UUID
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### Fare Rules Table
```sql
vehicle_type: VARCHAR(50) - PRIMARY KEY
base_fare: DECIMAL(10,2)
per_km_rate: DECIMAL(10,2)
active: BOOLEAN
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

---

## ❌ ERROR HANDLING

### Standard Error Response Format
```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common HTTP Status Codes
| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Proceed normally |
| 201 | Created | Resource created, proceed |
| 400 | Bad Request | Fix request data and retry |
| 401 | Unauthorized | Token invalid/expired - call login again |
| 403 | Forbidden | Not enough permissions (need admin role) |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Retry after delay, contact support if persists |

### Retry Logic
- **401 Unauthorized**: Call `/auth/login` to get new token
- **500 Server Error**: Retry after 5 seconds
- **400 Bad Request**: Fix data and retry (no backoff needed)

---

## 🔄 SAMPLE INTEGRATION FLOW FOR BAREERAH

```
1. STARTUP
   POST /auth/login
   → Get JWT token
   → Store token (valid 24 hours)

2. USER REQUESTS BOOKING (WhatsApp)
   Collect: customer_name, phone, locations, passenger count, luggage count

3. CALCULATE FARE
   POST /bookings/calculate-fare
   {
     "distance_km": (calculated by Bareerah),
     "vehicle_type": "classic",
     "booking_type": "point_to_point"
   }
   → Get fare_aed
   → Show to user in WhatsApp

4. USER CONFIRMS
   POST /bookings/create-manual
   {
     All booking details...
   }
   → Booking created
   → Show confirmation to user

5. CHECK STATUS (optional)
   GET /bookings/{booking_id}
   → Show current status
```

---

## 📞 SUPPORT CONTACTS

**Backend Support:** backend@starskyline.com  
**API Issues:** api-support@starskyline.com  
**Database:** PostgreSQL (Neon-backed)  
**Timezone:** UTC+4 (Dubai/UAE)

---

## 🔒 SECURITY NOTES

✅ **All API endpoints require JWT authentication**  
✅ **Token expires after 24 hours**  
✅ **Use HTTPS only** (not HTTP)  
✅ **Never expose token in logs**  
✅ **Rate limiting:** 100 requests/minute per IP  
✅ **CORS enabled for: Bareerah WhatsApp domain**

---

**Version:** 1.0  
**Last Updated:** 2025-11-28  
**Status:** ✅ Production Ready
