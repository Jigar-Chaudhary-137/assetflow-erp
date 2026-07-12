# Schema: Booking

## Collection Purpose
The `bookings` collection manages short-term reservations of shared organization resources (such as conference rooms, projectors, and shared mobile testing equipment). It tracks who booked the resource, the duration (start and end times), status, and validation conditions.

---

## Fields & Data Types

| Field Name | Data Type | Required | Default Value | Validation Rules & Constraints |
| :--- | :--- | :---: | :--- | :--- |
| `_id` | ObjectId | Yes | Auto-generated | MongoDB standard unique identifier |
| `resourceId` | ObjectId | Yes | None | References `_id` in `assets` collection. The asset must have `bookable: true` |
| `employeeId` | ObjectId | Yes | None | References `_id` in `users` collection |
| `startTime` | Date | Yes | None | Start time of booking. Must be in the future during creation |
| `endTime` | Date | Yes | None | End time of booking. Must be greater than `startTime` |
| `status` | String | Yes | `UPCOMING` | Enum: `UPCOMING`, `ONGOING`, `COMPLETED`, `CANCELLED` |
| `purpose` | String | Yes | None | Trimmed, 5 to 200 characters explaining the booking reason |
| `createdAt` | Date | Yes | `Date.now` | UTC timestamp when the booking was made |
| `updatedAt` | Date | Yes | `Date.now` | UTC timestamp of last record edit |

---

## Relationships
- **resourceId**: Links to the `assets` collection (`_id`).
- **employeeId**: Links to the `users` collection (`_id`).

---

## Indexes

| Index Name | Index Key(s) | Type | Unique | Purpose |
| :--- | :--- | :--- | :---: | :--- |
| `idx_bookings_resourceId` | `{ resourceId: 1 }` | B-tree | No | List bookings for a resource |
| `idx_bookings_employeeId` | `{ employeeId: 1 }` | B-tree | No | List bookings created by an employee |
| `idx_bookings_overlap_check` | `{ resourceId: 1, status: 1, startTime: 1, endTime: 1 }` | B-tree | No | Optimize query performance when checking slot overlaps |

---

## Business Rules
1. **Bookable Resource Validation**: Bookings are restricted to assets that have `bookable: true` and a status that allows bookings (e.g. not `LOST`, `RETIRED`, `DISPOSED`, or `UNDER_MAINTENANCE`).
2. **Overlap Validation Constraint**: No two bookings for the same `resourceId` with status `UPCOMING` or `ONGOING` can overlap in time. An overlap occurs when:
   $$\text{New Start Time} < \text{Existing End Time} \quad \text{AND} \quad \text{New End Time} > \text{Existing Start Time}$$
   This overlap check must be performed before saving or updating a booking.
3. **Time Constraint**: The booking duration must be valid (`endTime > startTime`), and the total duration must not exceed organization limits (e.g., max 24 hours per booking).
4. **Lifecycle State Impact**:
   - Creating an approved upcoming booking changes the asset's status to `RESERVED` during the scheduled booking slot.
   - When the booking reaches its `startTime`, status shifts to `ONGOING`, and the asset behaves as reserved/allocated.
   - Cancelling or completing the booking resets the asset's status back to `AVAILABLE`.

---

## Example Document
```json
{
  "_id": { "$oid": "64b0f3e8c1e2f7b8a5d4e404" },
  "resourceId": { "$oid": "64b0f3e8c1e2f7b8a5d4e305" },
  "employeeId": { "$oid": "64b0f3e8c1e2f7b8a5d4e108" },
  "startTime": { "$date": "2026-07-13T10:00:00.000Z" },
  "endTime": { "$date": "2026-07-13T11:00:00.000Z" },
  "status": "UPCOMING",
  "purpose": "HR Onboarding Prep",
  "createdAt": { "$date": "2026-07-12T02:00:00.000Z" },
  "updatedAt": { "$date": "2026-07-12T02:00:00.000Z" }
}
```
