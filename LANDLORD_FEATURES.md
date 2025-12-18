# Landlord Features - Implementation Guide

## 🎉 Newly Implemented Features

### 1. Landlord Profile Management
Landlords can now:
- View their complete profile information
- Edit profile details (name, phone, gender, occupation, bio)
- View dashboard statistics
- Access all property management features

### 2. Property Listing & Management
Landlords can:
- **Create new properties** with detailed information:
  - Title and description
  - Property type (room/flat/apartment)
  - Complete address with city, state, zip code
  - Google Maps coordinates (latitude & longitude)
  - Rent and security deposit
  - Total rooms and available rooms
  - Amenities (comma-separated)
  - Multiple images (URLs)
  - Available from date

- **Update existing properties**:
  - Edit all property details
  - Update rent and images
  - Modify room availability

- **Delete properties**:
  - Remove listings that are no longer needed

### 3. Current Tenant Management
Landlords can:
- **Add current tenants** to properties:
  - Tenant name
  - Gender
  - Occupation
- **Display tenant profiles** publicly for potential renters
- **Remove tenants** when they move out
- Automatic room availability calculation based on tenant count

### 4. Google Maps Integration
- Properties can display their location on Google Maps
- Landlords enter latitude and longitude when creating/editing properties
- Property details page shows an embedded Google Map
- Link to open location in Google Maps app

### 5. Dashboard Statistics
Landlords can view:
- Total properties listed
- Number of published properties
- Pending approval count
- Total views across all properties

## 📁 Files Created/Modified

### Backend Files Created:
1. `backend/src/middleware/authMiddleware.js` - JWT authentication & role-based authorization
2. `backend/src/controllers/landlordController.js` - Landlord profile management
3. `backend/src/controllers/propertyController.js` - Property CRUD operations
4. `backend/src/routes/landlordRoutes.js` - Landlord API routes
5. `backend/src/routes/propertyRoutes.js` - Property API routes
6. `backend/.env.example` - Environment variables template

### Backend Files Modified:
1. `backend/src/server.js` - Added landlord and property routes

### Frontend Files Created:
1. `frontend/src/api/landlordApi.js` - API helper functions for landlord operations
2. `frontend/src/pages/PropertyDetails.jsx` - Property details page with Google Maps

### Frontend Files Modified:
1. `frontend/src/pages/LandlordProfilePage.jsx` - Complete overhaul with full functionality

## 🚀 API Endpoints

### Landlord Routes (Protected - Landlord Only)
```
GET    /api/landlord/profile        - Get landlord profile
PUT    /api/landlord/profile        - Update landlord profile
GET    /api/landlord/properties     - Get all landlord's properties
GET    /api/landlord/stats          - Get dashboard statistics
```

### Property Routes
```
GET    /api/property                - Get all properties (public, with filters)
GET    /api/property/:id            - Get single property details
POST   /api/property                - Create property (landlord only)
PUT    /api/property/:id            - Update property (landlord only)
DELETE /api/property/:id            - Delete property (landlord only)
POST   /api/property/:id/tenants    - Add current tenant (landlord only)
DELETE /api/property/:id/tenants/:tenantId - Remove tenant (landlord only)
```

## 🔐 Authentication

All landlord-specific routes are protected with:
- JWT token verification
- Role-based access control (landlord role required)
- User session validation

## 📝 How to Use

### For Landlords:

1. **Login as Landlord**
   - Use your landlord credentials to log in

2. **Access Profile**
   - Navigate to your profile from the navbar
   - View dashboard statistics

3. **Manage Profile**
   - Click "My Profile" tab
   - Edit your information
   - Click "Update Profile" to save

4. **Add Property**
   - Click "Add Property" tab
   - Fill in all required fields (marked with *)
   - For Google Maps:
     - Get coordinates from Google Maps by right-clicking location
     - Enter latitude and longitude
   - Add amenities (comma-separated): WiFi, Parking, AC, etc.
   - Add image URLs (comma-separated)
   - Click "Create Property"

5. **Manage Properties**
   - Click "My Properties" tab
   - View all your listed properties
   - Edit: Click "Edit" button on any property
   - Delete: Click "Delete" button (with confirmation)

6. **Manage Tenants**
   - In "My Properties" tab, click "Add Tenant" on any property
   - Fill tenant information (name, gender, occupation)
   - Available rooms automatically update
   - Remove tenants with "Remove" button

### For Tenants/Public Users:

1. **View Property Details**
   - Browse properties on the home page
   - Click on any property to view full details

2. **See Current Tenants**
   - View profiles of existing tenants
   - See their name, gender, and occupation

3. **Check Location**
   - View embedded Google Map on property page
   - Click "Open in Google Maps" to navigate

## 🛠️ Setup Instructions

### Backend Setup:

1. **Install Dependencies** (if not already done):
   ```bash
   cd backend
   npm install
   ```

2. **Create .env File**:
   ```bash
   cp .env.example .env
   ```
   
3. **Configure Environment Variables**:
   Edit `.env` and set:
   - `MONGO_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A secure random string
   - `PORT` - Server port (default: 5001)

4. **Start Backend Server**:
   ```bash
   npm start
   ```

### Frontend Setup:

1. **Install Dependencies** (if not already done):
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

## 📊 Property Schema

Properties include:
- Basic info (title, description, type)
- Address (street, city, state, zip, country)
- Coordinates for Google Maps [longitude, latitude]
- Pricing (rent, security deposit)
- Room details (total rooms, available rooms)
- Amenities array
- Images array (URLs)
- Current tenants array (name, gender, occupation)
- Availability status
- Verification status (pending/approved/rejected)
- View count
- Reviews & ratings

## 🌟 Features Highlights

### Google Maps Integration
- Enter latitude and longitude when creating properties
- To get coordinates:
  1. Go to Google Maps
  2. Right-click on the location
  3. Click on the coordinates to copy them
  4. Paste into the property form

### Tenant Management
- Shows number of occupied vs available rooms
- Public tenant profiles help renters know living arrangements
- Automatic availability calculation
- Easy add/remove functionality

### Property Verification
- All properties start with "pending" status
- Admins can approve/reject properties
- Only approved properties show to tenants
- Landlords can see verification status

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Protected routes for landlord operations
- User validation on all requests
- Suspended account checking

## 📱 UI Features

- Responsive design (mobile-friendly)
- Tab-based navigation
- Real-time form validation
- Loading states
- Success/error alerts
- Modal dialogs for tenant management
- Confirmation dialogs for delete actions

## 🐛 Troubleshooting

### Backend Issues:

1. **Server won't start**:
   - Check if MongoDB is running
   - Verify .env configuration
   - Check port availability

2. **Authentication errors**:
   - Verify JWT_SECRET is set
   - Check token in localStorage
   - Ensure role is "landlord"

### Frontend Issues:

1. **API calls failing**:
   - Check backend server is running
   - Verify API base URL in axios config
   - Check browser console for errors

2. **Maps not showing**:
   - Verify coordinates are entered correctly
   - Check format: [longitude, latitude]
   - Ensure coordinates are not [0, 0]

## 📚 Next Steps

Future enhancements could include:
- Image upload functionality (currently uses URLs)
- Property search and filters for landlords
- Booking management
- Review system for properties
- Chat system between landlords and tenants
- Property analytics and insights
- Bulk operations for properties
