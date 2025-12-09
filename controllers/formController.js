const { query } = require('../config/db');

// Popular UAE locations
const UAE_LOCATIONS = [
  // Dubai - Popular Areas
  'Dubai International Airport',
  'Dubai Airport Terminal 1',
  'Dubai Airport Terminal 2',
  'Dubai Airport Terminal 3',
  'Burj Khalifa',
  'Dubai Marina',
  'Downtown Dubai',
  'Dubai Mall',
  'Mall of Emirates',
  'The Dubai Mall',
  'Jumeirah Beach Hotel',
  'Palm Jumeirah',
  'Dubai Creek Harbour',
  'JBR Beach',
  'Deira',
  'Bur Dubai',
  'Dubai Festival City',
  'Dubai Hills Estate',
  'Emirates Hills',
  'Al Barsha',
  'Jumeirah',
  'Dubai Silicon Oasis',
  'Business Bay',
  'DIFC',
  'Dubai International Financial Centre',
  'Dubai South',
  'Jebel Ali',
  'World Trade Centre',
  'Zabeel Park',
  'Al Safa',
  'Manara',
  'Satwa',
  'Al Karama',
  'Baniyas',
  'Al Manara',
  'Oud Metha',
  'Karama',
  'Naif',
  'Al Khaleej',
  'Al Reef',
  'Mirdif',
  'Muhaisnah',
  'Warsan',
  'Nad Al Sheba',
  'Hatta',
  'Meadows',
  'Springs',
  'Arabian Ranches',
  'Emirates Living',
  'Jumeirah Islands',
  'Jumeirah Heights',
  'The Hills',
  'Madinat Jumeirah',
  'Mall of the Emirates',
  'Ibn Battuta Mall',
  'Deira City Centre',
  'The Galleria',
  
  // Abu Dhabi
  'Abu Dhabi International Airport',
  'Etihad Tower',
  'Sheikh Zayed Grand Mosque',
  'Emirates Palace',
  'Yas Island',
  'Yas Mall',
  'Ferrari World',
  'Saadiyat Island',
  'Louvre Abu Dhabi',
  'Al Bateen',
  'Marina Mall Abu Dhabi',
  'Abu Dhabi Downtown',
  'Al Mina',
  'Khalifa City',
  'Al Reem Island',
  'Al Manara',
  'Al Marjan Island',
  'Corniche Abu Dhabi',
  'Sheikh Shakhbout City',
  'Al Ain',
  'Masdar City',
  
  // Sharjah
  'Sharjah International Airport',
  'Sharjah Corniche',
  'Al Majaz Waterfront',
  'Sharjah Museum',
  'Mega Mall Sharjah',
  'City Center Sharjah',
  'Al Qasba',
  'Sharjah Hills',
  'Al Furjan',
  'Muwailih',
  'Buhaira',
  'Al Nahda',
  'Al Reef',
  
  // Ajman
  'Ajman Corniche',
  'Ajman Museum',
  'Ajman City Centre',
  'Al Zahara',
  'Ajman Marina',
  
  // Umm Al Quwain
  'Umm Al Quwain',
  'Umm Al Quwain Corniche',
  'UAQ Marina',
  
  // Ras Al Khaimah
  'Ras Al Khaimah',
  'RAK Airport',
  'Ras Al Khaimah Corniche',
  'RAK Mall',
  'Al Noor Island',
  
  // Fujairah
  'Fujairah',
  'Fujairah Corniche',
  'Al Aqah Beach',
  'Fujairah Airport'
];

const formController = {
  /**
   * Serve complete WordPress booking form - Luxury Design
   */
  async getBookingForm(req, res, next) {
    try {
      // Get the origin from request
      const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
      const host = req.get('host') || 'localhost:5000';
      const apiBase = `${protocol}://${host}`;

      // Build location JSON for JavaScript autocomplete
      const locationsJSON = JSON.stringify(UAE_LOCATIONS);

      // Build HTML form - Luxury Glass Design
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Luxury Limo Booking</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Montserrat', sans-serif;
      min-height: 100vh;
      background: url('https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1920') center/cover no-repeat fixed;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    .glass-container {
      background: rgba(30, 40, 50, 0.75);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      padding: 40px 50px;
      max-width: 700px;
      width: 100%;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
    }

    /* Tabs */
    .tabs {
      display: flex;
      justify-content: center;
      gap: 50px;
      margin-bottom: 40px;
    }

    .tab {
      color: rgba(255, 255, 255, 0.6);
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      cursor: pointer;
      padding-bottom: 8px;
      border-bottom: 2px solid transparent;
      transition: all 0.3s ease;
    }

    .tab:hover {
      color: rgba(255, 255, 255, 0.9);
    }

    .tab.active {
      color: #fff;
      border-bottom: 2px solid #fff;
    }

    /* Form Fields */
    .form-group {
      margin-bottom: 25px;
      position: relative;
    }

    .form-group label {
      display: block;
      color: rgba(255, 255, 255, 0.7);
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    .form-group input {
      width: 100%;
      background: transparent;
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.3);
      color: #fff;
      font-size: 15px;
      font-family: 'Montserrat', sans-serif;
      padding: 10px 0;
      outline: none;
      transition: all 0.3s ease;
    }

    .form-group input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    .form-group input:focus {
      border-bottom-color: rgba(255, 255, 255, 0.8);
    }

    /* Autocomplete Suggestions */
    .autocomplete-suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: rgba(20, 30, 40, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      max-height: 200px;
      overflow-y: auto;
      display: none;
      z-index: 1000;
      margin-top: 5px;
    }

    .autocomplete-suggestions.active {
      display: block;
    }

    .autocomplete-suggestions div {
      padding: 12px 15px;
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .autocomplete-suggestions div:last-child {
      border-bottom: none;
    }

    .autocomplete-suggestions div:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      padding-left: 20px;
    }

    /* Date Time Field */
    .datetime-field {
      display: flex;
      gap: 15px;
    }

    .datetime-field input {
      flex: 1;
    }

    /* Buttons Row */
    .buttons-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 35px;
      padding-top: 20px;
    }

    .btn-link {
      color: rgba(255, 255, 255, 0.8);
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 1px;
      text-transform: uppercase;
      background: none;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: 'Montserrat', sans-serif;
    }

    .btn-link:hover {
      color: #fff;
    }

    .btn-primary {
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      background: none;
      border: none;
      border-bottom: 2px solid #fff;
      padding-bottom: 5px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: 'Montserrat', sans-serif;
    }

    .btn-primary:hover {
      opacity: 0.8;
    }

    /* Footer */
    .footer-text {
      text-align: center;
      margin-top: 30px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .footer-text span {
      font-weight: 700;
      font-size: 18px;
    }

    /* Return Section (Hidden by default) */
    .return-section {
      display: none;
      margin-top: 25px;
      padding-top: 25px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .return-section.active {
      display: block;
    }

    /* Hourly Section (Hidden by default) */
    .hourly-section {
      display: none;
    }

    .hourly-section.active {
      display: block;
    }

    .transfer-section {
      display: block;
    }

    .transfer-section.hidden {
      display: none;
    }

    /* Hours Selector */
    .hours-selector {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 15px;
    }

    .hour-option {
      padding: 10px 20px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .hour-option:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
    }

    .hour-option.selected {
      background: rgba(255, 255, 255, 0.25);
      border-color: #fff;
      color: #fff;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .glass-container {
        padding: 30px 25px;
      }

      .tabs {
        gap: 30px;
      }

      .tab {
        font-size: 14px;
      }

      .buttons-row {
        flex-direction: column;
        gap: 20px;
      }

      .datetime-field {
        flex-direction: column;
        gap: 20px;
      }
    }
  </style>
</head>
<body>

  <div class="glass-container">
    <!-- Tabs -->
    <div class="tabs">
      <div class="tab active" id="tab-transfer" onclick="switchTab('transfer')">Private Transfer</div>
      <div class="tab" id="tab-hourly" onclick="switchTab('hourly')">Hourly</div>
    </div>

    <form id="bookingForm">
      <!-- Private Transfer Section -->
      <div class="transfer-section" id="transfer-section">
        <!-- FROM -->
        <div class="form-group">
          <label>From</label>
          <input type="text" id="pickup" name="pickup" placeholder="Enter a pickup location" autocomplete="off" required>
          <div id="pickup-suggestions" class="autocomplete-suggestions"></div>
        </div>

        <!-- TO -->
        <div class="form-group">
          <label>To</label>
          <input type="text" id="dropoff" name="dropoff" placeholder="Enter a dropoff location" autocomplete="off" required>
          <div id="dropoff-suggestions" class="autocomplete-suggestions"></div>
        </div>
      </div>

      <!-- Hourly Section (Hidden) -->
      <div class="hourly-section" id="hourly-section">
        <!-- FROM (Hourly) -->
        <div class="form-group">
          <label>Pickup Location</label>
          <input type="text" id="hourly-pickup" name="hourly-pickup" placeholder="Enter pickup location" autocomplete="off">
          <div id="hourly-pickup-suggestions" class="autocomplete-suggestions"></div>
        </div>

        <!-- Hours Selection -->
        <div class="form-group">
          <label>Select Hours</label>
          <div class="hours-selector">
            <div class="hour-option" data-hours="3" onclick="selectHours(3)">3 Hours</div>
            <div class="hour-option" data-hours="4" onclick="selectHours(4)">4 Hours</div>
            <div class="hour-option" data-hours="5" onclick="selectHours(5)">5 Hours</div>
            <div class="hour-option" data-hours="6" onclick="selectHours(6)">6 Hours</div>
            <div class="hour-option" data-hours="8" onclick="selectHours(8)">8 Hours</div>
            <div class="hour-option" data-hours="10" onclick="selectHours(10)">10 Hours</div>
            <div class="hour-option" data-hours="12" onclick="selectHours(12)">12 Hours</div>
            <div class="hour-option" data-hours="14" onclick="selectHours(14)">14 Hours</div>
          </div>
          <input type="hidden" id="selected-hours" name="hours" value="">
        </div>
      </div>

      <!-- Pickup Date & Time -->
      <div class="form-group">
        <label>Pickup Date & Time</label>
        <div class="datetime-field">
          <input type="date" id="pickup-date" name="pickup-date" required>
          <input type="time" id="pickup-time" name="pickup-time" required>
        </div>
      </div>

      <!-- Return Section (Hidden) -->
      <div class="return-section" id="return-section">
        <div class="form-group">
          <label>Return Date & Time</label>
          <div class="datetime-field">
            <input type="date" id="return-date" name="return-date">
            <input type="time" id="return-time" name="return-time">
          </div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="buttons-row">
        <button type="button" class="btn-link" id="add-return-btn" onclick="toggleReturn()">+ Add Return</button>
        <button type="button" class="btn-primary" onclick="checkFare()">Check Fare</button>
      </div>
    </form>
  </div>

  <!-- Footer -->
  <div class="footer-text">
    Hire a limousine in Dubai from just <span>AED 99</span>
  </div>

  <script>
    const API_BASE = '${apiBase}';
    const ALL_LOCATIONS = ${locationsJSON};

    // Current state
    let currentTab = 'transfer';
    let isReturnAdded = false;
    let selectedHours = 0;

    // Set default date/time to now
    const now = new Date();
    document.getElementById('pickup-date').value = now.toISOString().split('T')[0];
    document.getElementById('pickup-time').value = now.toTimeString().slice(0,5);

    // Switch tabs
    function switchTab(tab) {
      currentTab = tab;
      
      // Update tab styles
      document.getElementById('tab-transfer').classList.toggle('active', tab === 'transfer');
      document.getElementById('tab-hourly').classList.toggle('active', tab === 'hourly');
      
      // Show/hide sections
      document.getElementById('transfer-section').classList.toggle('hidden', tab !== 'transfer');
      document.getElementById('hourly-section').classList.toggle('active', tab === 'hourly');
      
      // Hide return for hourly
      if (tab === 'hourly') {
        document.getElementById('return-section').classList.remove('active');
        document.getElementById('add-return-btn').style.display = 'none';
      } else {
        document.getElementById('add-return-btn').style.display = 'block';
      }
    }

    // Toggle return section
    function toggleReturn() {
      isReturnAdded = !isReturnAdded;
      document.getElementById('return-section').classList.toggle('active', isReturnAdded);
      document.getElementById('add-return-btn').textContent = isReturnAdded ? '- Remove Return' : '+ Add Return';
    }

    // Select hours (hourly rental)
    function selectHours(hours) {
      selectedHours = hours;
      document.getElementById('selected-hours').value = hours;
      
      // Update UI
      document.querySelectorAll('.hour-option').forEach(el => {
        el.classList.toggle('selected', parseInt(el.dataset.hours) === hours);
      });
    }

    // Autocomplete
    function setupAutocomplete(inputId, suggestionsId) {
      const input = document.getElementById(inputId);
      const suggestionsBox = document.getElementById(suggestionsId);

      if (!input || !suggestionsBox) return;

      input.addEventListener('input', function() {
        const value = this.value.toLowerCase().trim();

        if (value.length < 1) {
          suggestionsBox.innerHTML = '';
          suggestionsBox.classList.remove('active');
          return;
        }

        const matches = ALL_LOCATIONS.filter(location =>
          location.toLowerCase().includes(value)
        );

        if (matches.length === 0) {
          suggestionsBox.innerHTML = '';
          suggestionsBox.classList.remove('active');
          return;
        }

        const suggestions = matches.slice(0, 8);
        suggestionsBox.innerHTML = suggestions
          .map(location => \`<div onclick="selectLocation('\${inputId}', '\${location}')">\${location}</div>\`)
          .join('');
        suggestionsBox.classList.add('active');
      });

      input.addEventListener('blur', function() {
        setTimeout(() => suggestionsBox.classList.remove('active'), 200);
      });
    }

    function selectLocation(inputId, location) {
      document.getElementById(inputId).value = location;
      document.getElementById(inputId + '-suggestions').classList.remove('active');
    }

    // Setup all autocomplete fields
    setupAutocomplete('pickup', 'pickup-suggestions');
    setupAutocomplete('dropoff', 'dropoff-suggestions');
    setupAutocomplete('hourly-pickup', 'hourly-pickup-suggestions');

    // Check Fare - Next screen
    function checkFare() {
      const pickupDate = document.getElementById('pickup-date').value;
      const pickupTime = document.getElementById('pickup-time').value;

      if (currentTab === 'transfer') {
        const pickup = document.getElementById('pickup').value;
        const dropoff = document.getElementById('dropoff').value;

        if (!pickup || !dropoff) {
          alert('Please enter pickup and dropoff locations');
          return;
        }

        // Store data for next screen
        const bookingData = {
          booking_type: isReturnAdded ? 'round_trip' : 'point_to_point',
          pickup_location: pickup,
          dropoff_location: dropoff,
          pickup_date: pickupDate,
          pickup_time: pickupTime,
          return_date: isReturnAdded ? document.getElementById('return-date').value : null,
          return_time: isReturnAdded ? document.getElementById('return-time').value : null
        };

        // For now, alert the data (next screen will handle this)
        console.log('Transfer booking data:', bookingData);
        alert('Screen 2 coming soon!\\n\\nBooking Type: ' + bookingData.booking_type + '\\nFrom: ' + pickup + '\\nTo: ' + dropoff);
        
      } else {
        const pickup = document.getElementById('hourly-pickup').value;

        if (!pickup) {
          alert('Please enter pickup location');
          return;
        }

        if (!selectedHours) {
          alert('Please select rental hours');
          return;
        }

        const bookingData = {
          booking_type: 'hourly_rental',
          pickup_location: pickup,
          hours: selectedHours,
          pickup_date: pickupDate,
          pickup_time: pickupTime
        };

        console.log('Hourly booking data:', bookingData);
        alert('Screen 2 coming soon!\\n\\nBooking Type: Hourly Rental\\nLocation: ' + pickup + '\\nHours: ' + selectedHours);
      }
    }
  </script>
</body>
</html>
      `;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.send(html);
    } catch (error) {
      console.error('Form generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate form',
        message: error.message
      });
    }
  }
};

module.exports = formController;
