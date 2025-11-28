# Overview

This project is a production-ready Node.js backend application for a comprehensive taxi/ride booking service. It features an admin dashboard, vendor portal, and driver portal, enabling end-to-end management of ride operations. Key capabilities include sophisticated fare calculation for various booking types (point-to-point, hourly rentals) and vehicle categories (sedan, SUV, luxury, van, bus, mini bus). The system provides RESTful APIs for managing bookings, drivers, and vehicles, alongside JWT authentication, an advanced analytics dashboard, robust reporting features, and email integration. The business vision is to provide a stable, scalable, and feature-rich platform for ride-hailing services, ready for market deployment and expansion.

# User Preferences

Preferred communication style: Simple, everyday language. All features delivered production-ready.
**Stability First**: System must remain stable as features expand. No compromise on reliability.

# System Architecture

The application is built on a complete MVC (Model-View-Controller) architecture using Express.js (v5.1.0). It runs on port 8000 and uses JWT-based authentication with Role-Based Access Control (RBAC) for admin, operator, vendor, and driver roles.

## UI/UX Decisions
- Admin Dashboard: Features real-time statistics, booking management, driver/vehicle oversight, and KPI tracking. Includes view/edit modals and CSV export functionality.
- Vendor Portal: Provides vendor-specific login, signup, and a dashboard to track earnings.
- Driver Portal: Offers driver-specific login, signup, and a dashboard for managing their activities and stats.
- Design: Professional 2-column layouts, clear labels, solid white dropdowns with proper contrast, and responsive design with dark mode toggle.
- Error Display: User-friendly error messages are displayed directly on the UI for failed API calls.

## Technical Implementations
- **Core Logic**: Fare calculation based on distance, time, and vehicle type.
- **Booking Assignment**: Automatic driver-vehicle tagging and assignment based on `assigned_vehicle_id` and vehicle's `driver_id`. Manual override for vehicle selection in admin.
- **Notification System**: Checkboxes for customer (WhatsApp, Email) and driver (WhatsApp, Email) notifications, with selections collected for future integration.
- **Location Management**: Integrated 400+ UAE locations across all 7 emirates, supporting inter-emirate bookings.
- **Database Stability**: Enhanced connection pool (20 connections), increased connection timeout (10000ms), and idle timeout (45000ms) to ensure robustness.
- **API Standardization**: All API endpoints return consistent `{"success":true,"data":...}` format.
- **Caching**: Cache-busting implemented for all API calls to prevent stale data.
- **Error Handling**: Comprehensive error handling with logging and user-friendly messages.
- **Validation**: Passenger/luggage validation is mandatory for booking creation.

## Feature Specifications
- **Admin Dashboard**:
    - Real stats display (bookings, revenue, etc.).
    - Comprehensive bookings, drivers, and vehicles tabs.
    - KPI & Profits tab with real calculations.
    - Export bookings as CSV.
- **Vendor & Driver Portal**: Dedicated dashboards for vendors and drivers.
- **Booking Management**: Create, view, edit bookings; calculate fares. Edit access for bookings is status-based (locked for `in_progress` and `completed`).
- **Vehicle Management**: Capacity logic for vehicles, filtering based on passengers and luggage.
- **Statistics**: Dashboard stats persist after refresh, with customizable date ranges.

## System Design Choices
- **Database Schema**: Optimized `bookings`, `vehicles`, `drivers`, and `vendors` tables with relevant fields for efficient data management and queries.
- **Modular Structure**: Organized into `/config`, `/controllers`, `/models`, `/routes`, `/services`, `/middleware`, and `/utils` directories for clear separation of concerns.
- **Scalability**: Principles for stability include robust database connections, consistent API response formats, efficient caching, and thorough error handling.

# External Dependencies

- **Database**: PostgreSQL via Replit managed `DATABASE_URL`.
- **Backend Framework**: Express.js (v5.1.0).
- **Authentication**: JSON Web Tokens (JWT).
- **Email Service**: Resend (for email integration).
- **Messaging (Planned)**: WhatsApp API (requires `WHATSAPP_API_TOKEN` and `WHATSAPP_PHONE_ID` for full functionality).