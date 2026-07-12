# Types: Common

## Purpose
Defines reusable data shapes and field patterns shared across multiple modules in AssetFlow. These types appear as embedded sub-documents in the MongoDB schemas and as recurring data structures in API requests and responses.

---

## ObjectId Reference

All cross-collection references use MongoDB `ObjectId` values, serialized as 24-character hex strings in JSON responses.

```json
"departmentId": "64b0f3e8c1e2f7b8a5d4e001"
```

---

## Location Object

Used as an embedded sub-document in the `assets` collection.

### Shape
```json
{
  "building": "HQ West",
  "floor": 3,
  "room": "Room 304"
}
```

### Fields
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `building` | `string` | Yes | Building name or identifier |
| `floor` | `number` | No | Floor number (integer) |
| `room` | `string` | Yes | Room name or number |

---

## Purchase Info Object

Used as an optional embedded sub-document in the `assets` collection.

### Shape
```json
{
  "purchaseDate": "2026-06-01T00:00:00.000Z",
  "purchaseCost": 2499.00,
  "vendor": "Apple Inc.",
  "warrantyExpiration": "2027-06-01T00:00:00.000Z"
}
```

### Fields
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `purchaseDate` | `Date` | No | ISO 8601 date of purchase |
| `purchaseCost` | `number` | No | Non-negative acquisition cost |
| `vendor` | `string` | No | Supplier name |
| `warrantyExpiration` | `Date` | No | ISO 8601 warranty expiry date |

---

## Asset History Entry

Used as elements in the `assets.history` array to track lifecycle events on an asset.

### Shape
```json
{
  "date": "2026-07-12T04:10:00.000Z",
  "action": "ALLOCATED",
  "performedById": "64b0f3e8c1e2f7b8a5d4e103",
  "details": "Allocated to David Miller (Engineering)"
}
```

### Fields
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `date` | `Date` | Yes | UTC timestamp of the event |
| `action` | `string` | Yes | Enum: `REGISTERED`, `ALLOCATED`, `RETURNED`, `TRANSFERRED`, `MAINTENANCE_REQUESTED`, `MAINTENANCE_COMPLETED`, `LOST_REPORTED`, `STATUS_CHANGED` |
| `performedById` | `ObjectId` | Yes | References `users._id` |
| `details` | `string` | No | Optional free-text description of the event |

---

## Custom Field Definition

Used within `categories.customFields[]` to define dynamic specification schemas for asset categories.

### Shape
```json
{
  "fieldName": "ramSize",
  "label": "RAM (GB)",
  "fieldType": "NUMBER",
  "required": true,
  "description": "e.g., 16, 32, 64"
}
```

### Fields
| Field | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `fieldName` | `string` | Yes | camelCase identifier, unique within the category |
| `label` | `string` | Yes | User-facing display label |
| `fieldType` | `string` | Yes | Enum: `STRING`, `NUMBER`, `BOOLEAN`, `DATE` |
| `required` | `boolean` | Yes | Whether this spec is mandatory for assets in this category |
| `description` | `string` | No | Helper text shown in registration forms |

---

## Timestamp Fields

All primary collections include these two standard fields managed automatically.

| Field | Type | Description |
| :--- | :--- | :--- |
| `createdAt` | `Date` | UTC timestamp when the document was first inserted |
| `updatedAt` | `Date` | UTC timestamp of the most recent modification |

### Mongoose Setup
```js
// All schemas should include:
const schema = new mongoose.Schema({ ... }, { timestamps: true });
// This automatically manages createdAt and updatedAt.
```

---

## User Reference Summary

When referencing a user in response payloads, populate with the minimal user object:

```json
{
  "_id": "64b0f3e8c1e2f7b8a5d4e104",
  "firstName": "David",
  "lastName": "Miller",
  "email": "david.miller@assetflow.com",
  "role": "EMPLOYEE"
}
```

Never return `passwordHash` in any API response.

---

## Notification Related Entity

When a notification references another document, it uses a polymorphic pair of fields:

| Field | Type | Allowed Values |
| :--- | :--- | :--- |
| `relatedEntityId` | `ObjectId` | The `_id` of the related document |
| `relatedEntityType` | `string` | `Asset`, `Allocation`, `Booking`, `Maintenance`, `Audit` |
