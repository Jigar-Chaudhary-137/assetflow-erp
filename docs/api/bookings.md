# API: Bookings

## 1. List All Bookings

* **Endpoint**: `/api/bookings`
* **Method**: `GET`
* **Authentication**: Required (`ADMIN` or `ASSET_MANAGER` only)

### Request
* **Query Parameters (Optional)**:
  * `page`: Integer (default `1`)
  * `limit`: Integer (default `10`)
  * `status`: Filter by status (`UPCOMING`, `ONGOING`, `COMPLETED`, `CANCELLED`)
  * `resourceId`: Filter by asset/resource ID

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Bookings retrieved successfully",
    "data": {
      "docs": [
        {
          "_id": "64b0f3e8c1e2f7b8a5d4e404",
          "resourceId": "64b0f3e8c1e2f7b8a5d4e305",
          "employeeId": "64b0f3e8c1e2f7b8a5d4e108",
          "startTime": "2026-07-13T10:00:00.000Z",
          "endTime": "2026-07-13T11:00:00.000Z",
          "status": "UPCOMING",
          "purpose": "HR Onboarding Prep",
          "createdAt": "2026-07-12T02:00:00.000Z",
          "updatedAt": "2026-07-12T02:00:00.000Z"
        }
      ],
      "totalDocs": 1,
      "limit": 10,
      "page": 1,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
  ```

### Status Codes
* `200 OK`: Bookings retrieved successfully.
* `401 Unauthorized`: Token is missing.
* `403 Forbidden`: Insufficient permissions.

---

## 2. Get Own Bookings

* **Endpoint**: `/api/bookings/my`
* **Method**: `GET`
* **Authentication**: Required (Any authenticated user)

### Request
* **Body**: None

### Response
* **Success (200 OK)**: Returns standard paginated envelope of bookings where `employeeId` equals the logged-in user.

### Status Codes
* `200 OK`: Bookings retrieved.
* `401 Unauthorized`: Token is missing.

---

## 3. Get Single Booking

* **Endpoint**: `/api/bookings/:id`
* **Method**: `GET`
* **Authentication**: Required (Any authenticated user)

### Request
* **Body**: None

### Response
* **Success (200 OK)**: Returns single booking details.

### Status Codes
* `200 OK`: Booking retrieved.
* `401 Unauthorized`: Token is missing.
* `404 Not Found`: Booking not found.

---

## 4. Create Booking

* **Endpoint**: `/api/bookings`
* **Method**: `POST`
* **Authentication**: Required (Any authenticated user)

### Request
* **Body**:
  ```json
  {
    "resourceId": "64b0f3e8c1e2f7b8a5d4e305",
    "startTime": "2026-07-13T10:00:00.000Z",
    "endTime": "2026-07-13T11:00:00.000Z",
    "purpose": "HR Onboarding Prep"
  }
  ```

### Response
* **Success (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Booking created successfully",
    "data": {
      "_id": "64b0f3e8c1e2f7b8a5d4e404",
      "resourceId": "64b0f3e8c1e2f7b8a5d4e305",
      "employeeId": "64b0f3e8c1e2f7b8a5d4e108",
      "startTime": "2026-07-13T10:00:00.000Z",
      "endTime": "2026-07-13T11:00:00.000Z",
      "status": "UPCOMING",
      "purpose": "HR Onboarding Prep",
      "createdAt": "2026-07-12T02:00:00.000Z"
    }
  }
  ```

### Validation
| Field | Type | Rules |
| :--- | :--- | :--- |
| `resourceId` | ObjectId | Required. Must reference an asset with `bookable: true` and status enabling booking (e.g. not `LOST`, `RETIRED`, `DISPOSED`, `UNDER_MAINTENANCE`). |
| `startTime` | Date | Required. Must be in the future at time of creation. |
| `endTime` | Date | Required. Must be strictly greater than `startTime`. |
| `purpose` | String | Required. 5–200 characters. |

* **Duration Limit**: Maximum booking duration must not exceed **24 hours**.
* **Overlap Check Validation**: No two bookings for the same `resourceId` with status `UPCOMING` or `ONGOING` can share overlapping time. The backend performs this check before saving:
  ```js
  {
    resourceId: bookingResourceId,
    status:     { $in: ['UPCOMING', 'ONGOING'] },
    startTime:  { $lt: newEndTime },
    endTime:    { $gt: newStartTime }
  }
  ```
  If this returns any documents, a `409 Conflict` is thrown.
* **Asset Status Cascade**: Approved upcoming booking sets the referenced asset's status to `RESERVED` during the active booking slot.

### Status Codes
* `201 Created`: Booking successfully created.
* `400 Bad Request`: Validation failure (duration > 24 hours, time in the past).
* `401 Unauthorized`: Token is missing or invalid.
* `409 Conflict`: Overlap found (the resource is already booked for this slot).

---

## 5. Cancel Booking

* **Endpoint**: `/api/bookings/:id/cancel`
* **Method**: `PATCH`
* **Authentication**: Required (Own booking, or `ADMIN`/`ASSET_MANAGER`)

### Request
* **Body**: None

### Response
* **Success (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Booking cancelled successfully",
    "data": {
      "_id": "64b0f3e8c1e2f7b8a5d4e404",
      "status": "CANCELLED"
    }
  }
  ```

* **Asset Status Cascade**: Cancelling a booking releases the asset, resetting its status to `AVAILABLE` (if not otherwise allocated).

### Status Codes
* `200 OK`: Booking successfully cancelled.
* `401 Unauthorized`: Token is missing.
* `403 Forbidden`: User is not the owner of the booking and does not have admin privileges.
* `404 Not Found`: Booking not found.
