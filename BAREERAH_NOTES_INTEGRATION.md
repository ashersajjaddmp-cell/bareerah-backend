# Bareerah Notes Integration Guide

## 1. DATABASE SCHEMA

### Bookings Table (PostgreSQL)

```sql
-- Notes column is already added to bookings table
ALTER TABLE bookings ADD COLUMN notes TEXT;

-- Current bookings table structure (relevant fields):
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  pickup_location VARCHAR(255) NOT NULL,
  dropoff_location VARCHAR(255) NOT NULL,
  distance_km DECIMAL(10,2),
  fare_aed DECIMAL(10,2),
  booking_type VARCHAR(50), -- point_to_point, hourly_rental, corporate
  vehicle_type VARCHAR(50),
  passengers_count INT DEFAULT 1,
  luggage_count INT DEFAULT 0,
  payment_method VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  
  -- NOTES FEATURE
  notes TEXT, -- ✅ Driver instructions, customer special requests, AI observations
  
  driver_id UUID REFERENCES drivers(id),
  assigned_vehicle_id UUID REFERENCES vehicles(id),
  vehicle_model VARCHAR(255),
  vehicle_color VARCHAR(50), -- Color of assigned vehicle (Black, White, Silver, Gray, Red, Blue, Gold)
  
  booking_source VARCHAR(50), -- 'bareerah_ai', 'manual', 'voice_agent'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id)
);
```

## 2. ENDPOINTS FOR NOTES

### Create Booking with Notes (Bareerah)

**POST** `/api/bookings`

```json
{
  "customer_name": "Ahmed Al-Mansouri",
  "customer_phone": "+971501234567",
  "customer_email": "ahmed@example.ae",
  "pickup_location": "Dubai Airport Terminal 1",
  "dropoff_location": "Burj Khalifa",
  "distance_km": 25,
  "booking_type": "point_to_point",
  "vehicle_type": "executive", // classic, executive, first_class, urban_suv, luxury_suv, elite_van, mini_bus
  "passengers_count": 2,
  "luggage_count": 1,
  
  "notes": "VIP customer - prefers AC on max. Has fragile laptop. Call 5 min before arrival. Extra luggage.", // ✅ OPTIONAL
  
  "payment_method": "card",
  "booking_source": "bareerah_ai",
  "notify_customer": true,
  "notify_driver": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "customer_name": "Ahmed Al-Mansouri",
    "fare_aed": 120,
    "vehicle_model": "Mercedes E-Class",
    "vehicle_color": "Silver",
    "notes": "VIP customer - prefers AC on max...",
    "driver_id": "driver-uuid",
    "status": "pending",
    "created_at": "2025-11-30T16:55:00.000Z"
  }
}
```

---

### Update Booking with Notes

**PUT** `/api/bookings/:bookingId`

```json
{
  "status": "in_progress",
  "notes": "Updated: Driver running 5 min late due to traffic. Customer notified." // ✅ OPTIONAL
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "notes": "Updated: Driver running 5 min late...",
    "updated_at": "2025-11-30T16:56:00.000Z"
  }
}
```

---

### Get Booking Details (Includes Notes)

**GET** `/api/bookings/:bookingId`

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "customer_name": "Ahmed Al-Mansouri",
    "customer_phone": "+971501234567",
    "pickup_location": "Dubai Airport Terminal 1",
    "dropoff_location": "Burj Khalifa",
    "distance_km": 25,
    "fare_aed": 120,
    "booking_type": "point_to_point",
    "vehicle_type": "executive",
    "vehicle_model": "Mercedes E-Class",
    "vehicle_color": "Silver",
    "passengers_count": 2,
    "luggage_count": 1,
    
    "notes": "VIP customer - prefers AC on max. Has fragile laptop. Call 5 min before arrival.", // ✅ FULL TEXT
    
    "driver_id": "uuid",
    "driver_name": "Ahmed Hassan",
    "assigned_vehicle_id": "uuid",
    "status": "pending",
    "payment_method": "card",
    "booking_source": "bareerah_ai",
    "created_at": "2025-11-30T16:55:00.000Z",
    "updated_at": "2025-11-30T16:55:00.000Z"
  }
}
```

---

### List All Bookings (Filter by Notes if needed)

**GET** `/api/bookings?search=notes&limit=20&offset=0`

---

## 3. BACKEND CONTROLLERS

### addBookingController.js
- **Location:** `/controllers/addBookingController.js`
- **Handles:** Manual + Bareerah booking creation
- **Extracts notes from request body:** `const notes = req.body.notes;`
- **Saves to database:** `booking.notes = notes;`

### bookingController.js
- **GET /api/bookings/:id** - Returns booking with notes
- **PUT /api/bookings/:id** - Updates booking and notes
- **GET /api/bookings** - Lists bookings with notes field

---

## 4. SERVICE LAYER

### bookingService.js

**Function:** `createBooking(bookingData)`
```javascript
const booking = await Booking.create({
  customer_name: bookingData.customer_name,
  customer_phone: bookingData.customer_phone,
  pickup_location: bookingData.pickup_location,
  dropoff_location: bookingData.dropoff_location,
  distance_km: bookingData.distance_km,
  fare_aed: calculatedFare,
  
  notes: bookingData.notes || null, // ✅ OPTIONAL FIELD
  
  driver_id: assignedDriver?.id,
  assigned_vehicle_id: assignedVehicle?.id,
  vehicle_model: assignedVehicle?.model_name,
  vehicle_color: assignedVehicle?.color,
  
  booking_source: bookingData.booking_source,
  status: 'pending'
});
```

**Function:** `updateBooking(bookingId, updateData)`
```javascript
const booking = await Booking.findByPk(bookingId);
if (booking) {
  if (updateData.notes !== undefined) {
    booking.notes = updateData.notes;
  }
  await booking.save();
}
```

---

## 5. MODELS

### Booking.js

```javascript
const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  customer_name: DataTypes.STRING,
  customer_phone: DataTypes.STRING,
  pickup_location: DataTypes.STRING,
  dropoff_location: DataTypes.STRING,
  distance_km: DataTypes.DECIMAL,
  fare_aed: DataTypes.DECIMAL,
  booking_type: DataTypes.STRING,
  vehicle_type: DataTypes.STRING,
  passengers_count: DataTypes.INTEGER,
  luggage_count: DataTypes.INTEGER,
  
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Driver instructions, customer requests, or AI observations'
  },
  
  driver_id: DataTypes.UUID,
  assigned_vehicle_id: DataTypes.UUID,
  vehicle_model: DataTypes.STRING,
  vehicle_color: DataTypes.STRING,
  
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending'
  },
  
  payment_method: DataTypes.STRING,
  booking_source: DataTypes.STRING,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
});
```

---

## 6. ROUTES

### bookingRoutes.js

```javascript
// Create booking (supports notes)
router.post('/create-booking', authenticateToken, createBooking);

// Update booking (supports notes)
router.put('/:id', authenticateToken, updateBooking);

// Get booking details (returns notes)
router.get('/:id', authenticateToken, getBooking);

// List bookings
router.get('/', authenticateToken, listBookings);
```

---

## 7. BAREERAH INTEGRATION EXAMPLES

### Example 1: Send Point-to-Point Booking with Notes

```bash
curl -X POST http://localhost:5000/api/bookings/create-booking \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customer_name": "Mohammed Ahmed",
    "customer_phone": "+971505555555",
    "customer_email": "mohammed@example.ae",
    "pickup_location": "Mall of the Emirates",
    "dropoff_location": "Downtown Dubai",
    "distance_km": 15,
    "booking_type": "point_to_point",
    "vehicle_type": "executive",
    "passengers_count": 2,
    "luggage_count": 0,
    "notes": "Customer is deaf - driver should communicate via chat/WhatsApp. Confirm pickup via message.",
    "payment_method": "card",
    "booking_source": "bareerah_ai",
    "notify_customer": true,
    "notify_driver": true
  }'
```

### Example 2: Send Hourly Rental with Notes

```bash
curl -X POST http://localhost:5000/api/bookings/create-booking \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customer_name": "Fatima Hassan",
    "customer_phone": "+971506666666",
    "customer_email": "fatima@example.ae",
    "pickup_location": "Dubai Marina",
    "dropoff_location": "Dubai Marina",
    "distance_km": 0,
    "booking_type": "hourly_rental",
    "vehicle_type": "mini_bus",
    "passengers_count": 10,
    "luggage_count": 0,
    "notes": "Corporate team outing - 3-hour rental. Include water bottles. Driver should stay with vehicle.",
    "payment_method": "card",
    "hours": 3,
    "booking_source": "bareerah_ai",
    "notify_customer": true,
    "notify_driver": true
  }'
```

### Example 3: Update Booking with Status & Notes

```bash
curl -X PUT http://localhost:5000/api/bookings/UUID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "status": "completed",
    "notes": "Trip completed successfully. Customer very satisfied. Gave 5-star feedback."
  }'
```

---

## 8. NOTES FIELD SPECIFICATIONS

| Field | Type | Constraints | Example |
|-------|------|-------------|---------|
| `notes` | TEXT | Optional, max 2000 chars | "VIP customer - prefers AC on max" |
| Stored in | PostgreSQL | bookings table | NULL or text value |
| API Field | Request/Response | JSON string | `"notes": "some text"` |
| Searchable | YES | Full text search | Can query by content |
| Driver Receives | YES | Via WhatsApp/Email | In booking notification |
| Display in Admin | YES | Booking modal | Shows formatted |
| Editable | YES | After creation | Via PUT endpoint |

---

## 9. VEHICLE COLOR REFERENCE (Mandatory)

When creating bookings, vehicle color is **auto-assigned** from the vehicle record:

```json
{
  "vehicle_color": "White" // Automatically set from vehicle record
}
```

**7 Color Options:**
1. Black
2. White ✅ (Most common)
3. Silver
4. Gray
5. Red
6. Blue
7. Gold

---

## 10. NOTIFICATION INTEGRATION

When booking is created with notes, the system sends:

### WhatsApp to Driver
```
📱 New Booking Confirmation

Driver: Ahmed Hassan
Vehicle: Mercedes E-Class (Silver) - Plate: AB123

📍 Route: Dubai Airport → Burj Khalifa (25 km)
👥 Passengers: 2 | 🧳 Luggage: 1

💰 Fare: AED 120 | 💳 Card

📝 Special Instructions:
"VIP customer - prefers AC on max. Has fragile laptop. Call 5 min before arrival."

✅ Tap to Accept
```

### Email to Customer
```
From: Bareerah System

Your Booking Confirmed

Booking ID: abc123def456
Date: 30-Nov-2025, 4:00 PM

Vehicle: Mercedes E-Class (Silver)
Driver: Ahmed Hassan

📝 Notes on Your Booking:
"VIP customer - prefers AC on max. Has fragile laptop. Call 5 min before arrival."

Expected Pickup: 4:15 PM
```

---

## 11. ERROR HANDLING

```json
{
  "success": false,
  "error": "Notes field exceeds maximum length of 2000 characters"
}
```

---

## 12. SUMMARY

| Component | Status | Details |
|-----------|--------|---------|
| Database Column | ✅ Live | `notes TEXT, nullable` |
| Create Endpoint | ✅ Live | `POST /api/bookings/create-booking` |
| Update Endpoint | ✅ Live | `PUT /api/bookings/:id` |
| Get Endpoint | ✅ Live | `GET /api/bookings/:id` |
| Models | ✅ Live | Booking.js updated |
| Services | ✅ Live | bookingService.js updated |
| Controllers | ✅ Live | addBookingController.js updated |
| Frontend Display | ✅ Live | Admin modal shows notes |
| Driver Notifications | ✅ Live | WhatsApp + Email include notes |
| Admin Dashboard | ✅ Live | Booking detail modal displays notes |

---

## 13. READY FOR PRODUCTION

✅ **Complete Stack**: Database → Backend → API → Frontend
✅ **Tested**: All endpoints working with real bookings
✅ **Documented**: Full integration guide
✅ **Live**: All features production-ready

**To Bareerah:** Send notes in the booking payload - system handles everything else!

