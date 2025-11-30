# Bareerah Notes Feature - QUICK REFERENCE

## What Changed?
✅ Bookings now support a `notes` field for driver instructions, customer preferences, or AI observations

---

## How to Use (3 Lines)

**STEP 1: Send notes in booking creation**
```json
POST /api/bookings/create-booking
{
  "customer_name": "Ahmed",
  "notes": "VIP - prefers max AC. Fragile items onboard."
}
```

**STEP 2: Notes auto-saved to database**
```
bookings.notes = "VIP - prefers max AC. Fragile items onboard."
```

**STEP 3: Notes sent to driver + customer**
```
WhatsApp: "📝 Special Instructions: VIP - prefers max AC..."
Email: Booking confirmation includes notes
```

---

## Fields You Need

| Field | Required | Type | Max Length | Example |
|-------|----------|------|-----------|---------|
| `notes` | ❌ Optional | TEXT | 2000 chars | "VIP customer - call 5 min before" |

---

## Endpoints (3 Total)

### 1️⃣ Create Booking WITH Notes
```
POST /api/bookings/create-booking
Header: Authorization: Bearer {TOKEN}

Body: { "notes": "..." }
```

### 2️⃣ Update Booking Notes
```
PUT /api/bookings/{BOOKING_ID}
Header: Authorization: Bearer {TOKEN}

Body: { "notes": "..." }
```

### 3️⃣ Get Booking (Returns notes)
```
GET /api/bookings/{BOOKING_ID}
Header: Authorization: Bearer {TOKEN}

Response includes: "notes": "..."
```

---

## Real Example

**Create Booking with Notes:**
```bash
curl -X POST http://bareerah.ae/api/bookings/create-booking \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer xyz123" \
  -d '{
    "customer_name": "Fatima Hassan",
    "customer_phone": "+971505555555",
    "pickup_location": "Dubai Airport",
    "dropoff_location": "Downtown Dubai",
    "distance_km": 30,
    "booking_type": "point_to_point",
    "vehicle_type": "executive",
    "passengers_count": 2,
    "luggage_count": 1,
    "notes": "Corporate VIP - MD of company. Prefers quiet ride. Has important meeting papers - do not disturb.",
    "payment_method": "card",
    "booking_source": "bareerah_ai"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "notes": "Corporate VIP - MD of company...",
    "fare_aed": 120,
    "vehicle_model": "Mercedes E-Class (Silver)"
  }
}
```

---

## Notes Use Cases

### 1. VIP Customers
```
"VIP customer - prefers max AC. Extra luggage. Call 5 min before arrival."
```

### 2. Special Requirements
```
"Customer has 1 wheelchair. Needs ramp access. Allow extra 10 min loading."
```

### 3. Fragile Items
```
"Transporting fragile artwork. Smooth driving required. Avoid bumps."
```

### 4. Multiple Stops
```
"Stop 1: Pick up documents at office. Stop 2: Drop at Burj Khalifa."
```

### 5. Corporate Events
```
"3-hour rental for team outing. 10 passengers. Include water bottles. Driver stays."
```

### 6. Special Access
```
"Building has strict security. Call tenant 30 min before arrival."
```

### 7. Language/Accessibility
```
"Customer is deaf - communicate via WhatsApp. Confirm via chat message."
```

---

## Driver Receives (WhatsApp Example)

```
📱 New Booking

🚗 Mercedes E-Class (Silver) - Plate AB123
👤 Driver: Ahmed Hassan

📍 Dubai Airport → Burj Khalifa (30 km)
👥 2 passengers | 🧳 1 luggage item

💰 Fare: AED 120

📝 SPECIAL INSTRUCTIONS:
"Corporate VIP - MD of company. Prefers quiet ride. 
Has important meeting papers - do not disturb."

⏰ Pickup: 4:00 PM
✅ Tap to Accept/Reject
```

---

## Admin Dashboard Shows Notes

**Booking Detail Modal:**
```
📝 Notes:
VIP customer - prefers AC on max. Has fragile laptop. 
Call 5 min before arrival.
```

---

## Database Schema (Simple)

```sql
-- Already created in bookings table
notes TEXT,  -- NULL or text value (max 2000 chars)
```

---

## Error Handling

```json
// If notes exceed limit
{
  "success": false,
  "error": "Notes field exceeds maximum length of 2000 characters"
}

// If booking not found
{
  "success": false,
  "error": "Booking not found"
}
```

---

## Testing Checklist

- [x] Create booking with notes via API ✅
- [x] Notes saved to database ✅
- [x] Driver receives notes via WhatsApp ✅
- [x] Customer gets notes in email ✅
- [x] Admin can view notes in dashboard ✅
- [x] Update booking notes ✅
- [x] Get booking returns notes ✅

---

## Support Matrix

| Task | Status | Verified |
|------|--------|----------|
| Send notes via API | ✅ LIVE | Yes |
| Store in database | ✅ LIVE | Yes |
| Driver notification | ✅ LIVE | Yes |
| Admin dashboard | ✅ LIVE | Yes |
| Update notes | ✅ LIVE | Yes |
| Get notes | ✅ LIVE | Yes |

---

## Need Help?

1. **Notes not saving?** → Check request includes `notes` field
2. **Driver not receiving?** → Check WhatsApp notifications enabled
3. **Notes not showing?** → Refresh admin dashboard (Ctrl+Shift+R)

---

**Status:** ✅ PRODUCTION READY

Bareerah can start sending notes immediately!

