# Bareerah Flight Schema Update (December 12, 2025)

## New Fields Added to Bookings Table

### Database Schema Changes
Two new columns have been added to support Bareerah's flight information requirements:

```sql
ALTER TABLE bookings 
ADD COLUMN flight_type VARCHAR(20),
ADD COLUMN flight_time TIMESTAMP WITH TIME ZONE;
```

### Field Specifications

#### flight_type
- **Type**: VARCHAR(20)
- **Values**: `'arrival'`, `'departure'`, or `NULL`
- **Description**: Indicates whether the flight time is an arrival or departure time
- **Required**: No (optional for Airport Transfer bookings)
- **Example**: `"arrival"` or `"departure"`

#### flight_time
- **Type**: TIMESTAMP WITH TIME ZONE
- **Format**: ISO 8601 datetime (UTC)
- **Description**: The actual flight time (arrival or departure)
- **Required**: No (optional for Airport Transfer bookings)
- **Example**: `"2025-12-15T14:30:00Z"`

### Bareerah Integration

When Bareerah sends a booking with flight information, include these fields:

```json
{
  "booking_type": "airport_transfer",
  "flight_type": "arrival",
  "flight_time": "2025-12-15T14:30:00Z",
  ...other fields
}
```

Or for departure:

```json
{
  "booking_type": "airport_transfer",
  "flight_type": "departure",
  "flight_time": "2025-12-15T18:45:00Z",
  ...other fields
}
```

### Backwards Compatibility

The existing fields are maintained for backwards compatibility:
- `flight_arrival_time` (TIMESTAMP) - Legacy field
- `flight_departure_time` (TIMESTAMP) - Legacy field

### Email Notifications

Flight information is automatically included in email notifications sent to admin when:
- `booking_type` is `'airport_transfer'`
- `flight_time` and `flight_type` are provided

Flight times are converted to Dubai timezone (Asia/Dubai, UTC+4) for display.

### API Endpoint

**Endpoint**: `POST /api/bookings/add-booking`

**Request Body Example**:
```json
{
  "customer_name": "John Doe",
  "customer_phone": "+971501234567",
  "pickup_location": "Dubai International Airport",
  "dropoff_location": "Downtown Dubai",
  "booking_type": "airport_transfer",
  "vehicle_type": "executive",
  "passengers_count": 2,
  "luggage_count": 2,
  "flight_type": "arrival",
  "flight_time": "2025-12-15T14:30:00Z",
  "booking_source": "bareerah_ai"
}
```

### Response

Successful response includes the booking with all flight details:

```json
{
  "success": true,
  "data": {
    "id": "uuid...",
    "customer_name": "John Doe",
    "booking_type": "airport_transfer",
    "flight_type": "arrival",
    "flight_time": "2025-12-15T14:30:00Z",
    ...other fields
  }
}
```

### Dashboard Display

The Airport Transfer Flights dashboard card displays:
- Flight type (Arrival/Departure)
- Flight time in Dubai timezone (DD/MM/YYYY HH:MM format)
- Auto-refreshes every 30 seconds
- Drag-drop functionality for organization

---

**Status**: ✅ Ready for Bareerah Integration
**Last Updated**: December 12, 2025
