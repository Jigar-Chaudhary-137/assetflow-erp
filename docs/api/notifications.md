# API: Notifications

## 1. Get Own Notifications

* **Endpoint**: `/api/notifications`
* **Method**: `GET`
* **Authentication**: Required (Any authenticated user)

### Request
* **Body**: None

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Notifications retrieved successfully",
    "data": [
      {
        "_id": "64b0f3e8c1e2f7b8a5d4e009",
        "receiverId": "64b0f3e8c1e2f7b8a5d4e104",
        "type": "ALLOCATION",
        "title": "New Asset Assigned",
        "message": "You have been allocated the asset 'AST-LAP-0001' (Macbook Pro). Please review and accept the transfer.",
        "readStatus": false,
        "relatedEntityId": "64b0f3e8c1e2f7b8a5d4e004",
        "relatedEntityType": "Allocation",
        "createdAt": "2026-07-12T04:10:00.000Z"
      }
    ]
  }
  ```

### Status Codes
* `200 OK`: Notifications retrieved successfully.
* `401 Unauthorized`: Token is missing.

---

## 2. Mark Notification as Read

* **Endpoint**: `/api/notifications/:id/read`
* **Method**: `PATCH`
* **Authentication**: Required (Receiver of the notification only)

### Request
* **Body**: None

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Notification marked as read",
    "data": {
      "_id": "64b0f3e8c1e2f7b8a5d4e009",
      "readStatus": true
    }
  }
  ```

### Validation
* URL ID parameter must be a valid MongoDB ObjectId.
* User must be the `receiverId` of the target notification document.

### Status Codes
* `200 OK`: Notification status updated.
* `401 Unauthorized`: Token missing or invalid.
* `403 Forbidden`: Authenticated user is not the receiver of this notification.
* `404 Not Found`: Notification not found.

---

## 3. Mark All Notifications as Read

* **Endpoint**: `/api/notifications/read-all`
* **Method**: `PATCH`
* **Authentication**: Required (Any authenticated user)

### Request
* **Body**: None

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "All notifications marked as read",
    "data": null
  }
  ```

### Status Codes
* `200 OK`: All unread notifications for the user updated to `readStatus: true`.
* `401 Unauthorized`: Token missing.
