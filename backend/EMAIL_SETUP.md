# Email Notification Setup

\
## API Endpoints

### Get Notifications (User)
```
GET /api/notification
Headers: Authorization: Bearer <token>
```

### Mark as Read
```
PUT /api/notification/:id/read
Headers: Authorization: Bearer <token>
```

### Mark All as Read
```
PUT /api/notification/read-all
Headers: Authorization: Bearer <token>
```

### Delete Notification
```
DELETE /api/notification/:id
Headers: Authorization: Bearer <token>
```

## Testing

1. Create a tenant account
2. Add a property to wishlist
3. Login as landlord (property owner)
4. Update the property rent price
5. Check tenant's email and notifications


## Files Modified

- `backend/src/utils/mailer.js` - Email sending logic
- `backend/src/models/Notification.js` - Notification schema
- `backend/src/controllers/notificationController.js` - Notification CRUD
- `backend/src/controllers/propertyController.js` - Price change detection
- `backend/src/routes/notificationRoutes.js` - API routes
- `backend/src/server.js` - Route registration
- `frontend/src/api/notificationApi,js` - Frontend API calls

## Notes

- Email sending is non-blocking (won't stop property update if email fails)
- Notifications are stored in database even if email fails
- Only users with property in wishlist receive notifications
- Price must actually change to trigger notification
