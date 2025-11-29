# 🔗 BAREERAH BOOKING API - COMPLETE DOCUMENTATION

## ⚠️ IMPORTANT: CORRECT ENDPOINT PATHS

**Bareerah AI was trying to call:** ❌ `/api/create_booking`  
**Actual endpoint for creating bookings:** ✅ `/api/bookings/create-manual`

---

## 🌐 API Base URL

```
https://5ef5530c-38d9-4731-b470-827087d7bc6f-00-2j327r1fnap1d.sisko.replit.dev/api
```

---

## 📋 ALL AVAILABLE BOOKING ENDPOINTS

### 1️⃣ **CREATE BOOKING** (For Bareerah AI) ⭐ PRIMARY ENDPOINT
```
POST /api/bookings/create-manual
```

**Headers Required:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Payload:**
```json
{
  "customer_name": "Shahid Khan",
  "customer_phone": "+971501234567",
  "customer_email": "customer@example.com",
  "booking_type": "point_to_point",
  "vehicle_type": "sedan",
  "distance_km": 25.5,
  "hours": null,
  "passengers_count": 3,
  "luggage_count": 2,
  "pickup_location": "Dubai Marina Mall",
  "dropoff_location": "Sharjah Airport",
  "caller_number": "+971501234567",
  "confirmed_contact_number": "+971501234567"
}
```

**Valid Booking Types:**
- `point_to_point`
- `airport_transfer`
- `city_tour`
- `hourly_rental`

**Valid Vehicle Types:**
- `sedan`
- `suv`
- `luxury`
- `van`
- `bus`
- `minibus`

**Success Response (HTTP 200):**
```json
{
  "success": true,
  "booking_id": "BOOK-00123",
  "booking_type": "point_to_point",
  "distance_km": 25.5,
  "fare": 125.50,
  "currency": "AED",
  "vehicle": {
    "id": 5,
    "model": "Toyota Corolla",
    "type": "sedan",
    "plate_number": "ABC-1234",
    "driver_name": "Ahmed Hassan",
    "per_km_price": 2.5,
    "hourly_price": 50
  },
  "retry_attempts": 0,
  "timestamp": "2025-11-29T22:28:19.767Z"
}
```

**Error Response (HTTP 400/500):**
```json
{
  "success": false,
  "error": "No available vehicles matching capacity",
  "timestamp": "2025-11-29T22:28:19.767Z"
}
```

**Auto-Retry Logic:**
- ✅ Automatically retries 3 times on failure
- ✅ Exponential backoff: 500ms → 1000ms → 2000ms
- ✅ Detailed logging for each attempt
- ✅ Returns error only after all 3 attempts fail

---

### 2️⃣ **CALCULATE FARE** (Before Booking)
```
POST /api/bookings/calculate-fare
```

**No Authentication Required** ✅

**Request Payload:**
```json
{
  "booking_type": "point_to_point",
  "vehicle_type": "sedan",
  "distance_km": 25.5,
  "hours": null
}
```

**Response:**
```json
{
  "success": true,
  "fare": 125.50,
  "base_fare": 25,
  "distance_charge": 63.75,
  "time_charge": 0,
  "surcharge": 36.75,
  "currency": "AED"
}
```

---

### 3️⃣ **GET AVAILABLE VEHICLES** (For Suggestions)
```
GET /api/bookings/available-vehicles?passengers_count=3&luggage_count=2
```

**No Authentication Required** ✅

**Query Parameters:**
- `passengers_count` (required): Number of passengers
- `luggage_count` (required): Number of luggage items

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "model": "Toyota Corolla",
      "type": "sedan",
      "plate_number": "ABC-1234",
      "driver_name": "Ahmed Hassan",
      "max_passengers": 4,
      "max_luggage": 3,
      "hourly_price": 50,
      "per_km_price": 2.5
    }
  ]
}
```

---

### 4️⃣ **SUGGEST VEHICLES** (Smart Selection)
```
GET /api/bookings/suggest-vehicles?passengers_count=3&luggage_count=2
```

**No Authentication Required** ✅

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "model": "Toyota Corolla",
      "type": "sedan",
      "available": true,
      "hourly_price": 50,
      "per_km_price": 2.5
    }
  ]
}
```

---

## 🔐 AUTHENTICATION

### Getting JWT Token

**Endpoint:**
```
POST /api/auth/login
```

**Payload:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "role": "admin"
}
```

### Using Token in Requests

```bash
curl -X POST "https://5ef5530c-38d9-4731-b470-827087d7bc6f-00-2j327r1fnap1d.sisko.replit.dev/api/bookings/create-manual" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Shahid Khan",
    "customer_phone": "+971501234567",
    ...
  }'
```

---

## 📊 DEMO CREDENTIALS FOR TESTING

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Admin | admin@example.com | admin123 | Full access to all endpoints |
| Operator | operator@example.com | operator123 | Limited booking access |

---

## 🚀 QUICK START FOR BAREERAH

### Step 1: Get JWT Token
```bash
curl -X POST "https://5ef5530c-38d9-4731-b470-827087d7bc6f-00-2j327r1fnap1d.sisko.replit.dev/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### Step 2: Create Booking with Token
```bash
curl -X POST "https://5ef5530c-38d9-4731-b470-827087d7bc6f-00-2j327r1fnap1d.sisko.replit.dev/api/bookings/create-manual" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
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
    "pickup_location": "Dubai Marina",
    "dropoff_location": "Sharjah Airport"
  }'
```

---

## ✅ FEATURES & GUARANTEES

✅ **Automatic Retry Logic**: 3 attempts with exponential backoff  
✅ **Real-Time Logging**: Every request logged with timestamps  
✅ **Vehicle Auto-Assignment**: Company vehicles prioritized, then vendor  
✅ **Smart Capacity Checking**: Ensures vehicle matches passenger/luggage count  
✅ **Error Messages**: Clear, actionable error messages  
✅ **Production Ready**: Live, tested, stable endpoints  

---

## 🔴 COMMON ISSUES & FIXES

| Issue | Cause | Solution |
|-------|-------|----------|
| "No token provided" | Missing Authorization header | Add `Authorization: Bearer TOKEN` to headers |
| "Invalid booking_type" | Wrong booking type value | Use: point_to_point, airport_transfer, city_tour, hourly_rental |
| "No available vehicles" | Capacity mismatch | Reduce passengers_count or luggage_count |
| "Missing required fields" | Incomplete payload | Ensure all required fields are provided |
| Token expired | JWT token validity | Get new token from /api/auth/login |

---

## 📞 SUPPORT

For issues or clarifications, check:
1. Request payload format
2. Authorization header presence
3. Valid enum values (booking_type, vehicle_type)
4. API response logs in console

---

**Last Updated:** 2025-11-29  
**API Status:** ✅ LIVE & OPERATIONAL
