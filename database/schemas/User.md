# Schema: User

## Collection Purpose
The `users` collection stores user credentials, roles, contact information, status, and department relationships. It is the primary collection for authentication and authorization in AssetFlow ERP.

---

## Fields & Data Types

| Field Name | Data Type | Required | Default Value | Validation Rules & Constraints |
| :--- | :--- | :---: | :--- | :--- |
| `_id` | ObjectId | Yes | Auto-generated | MongoDB standard unique identifier |
| `username` | String | Yes | None | Unique, trimmed, alphanumeric, 3 to 30 characters |
| `email` | String | Yes | None | Unique, trimmed, lowercase, must match RFC 5322 email regex |
| `passwordHash` | String | Yes | None | Hashed password string (bcrypt standard) |
| `firstName` | String | Yes | None | Trimmed, 1 to 50 characters |
| `lastName` | String | Yes | None | Trimmed, 1 to 50 characters |
| `role` | String | Yes | `EMPLOYEE` | Enum: `ADMIN`, `ASSET_MANAGER`, `DEPARTMENT_HEAD`, `EMPLOYEE` |
| `departmentId` | ObjectId | No | null | References `_id` in `departments` collection. Null for global admins/managers |
| `status` | String | Yes | `ACTIVE` | Enum: `ACTIVE`, `INACTIVE`, `SUSPENDED` |
| `contactNumber` | String | No | null | Trimmed, must match valid international/domestic phone format regex |
| `createdAt` | Date | Yes | `Date.now` | UTC timestamp when the user was created |
| `updatedAt` | Date | Yes | `Date.now` | UTC timestamp when the user was last updated |

---

## Relationships
- **departmentId**: Links to the `departments` collection (`_id`).
  - *Relationship Type*: One-to-Many (A department can have multiple users; a user can belong to only one department).
  - *Referential Integrity*: If the referenced department is deleted, this field must be set to `null` or the deletion must be blocked if active users exist.

---

## Indexes

| Index Name | Index Key(s) | Type | Unique | Purpose |
| :--- | :--- | :--- | :---: | :--- |
| `idx_users_username` | `{ username: 1 }` | B-tree | Yes | Quick lookup during login and registration |
| `idx_users_email` | `{ email: 1 }` | B-tree | Yes | Unique login check and password reset |
| `idx_users_departmentId` | `{ departmentId: 1 }` | B-tree | No | Filtering users by department |
| `idx_users_role` | `{ role: 1 }` | B-tree | No | Role-based search and access control filters |

---

## Business Rules
1. **Email Uniqueness & Case Sensitivity**: Emails must be saved in lowercase. Duplicate emails are strictly rejected.
2. **Department Assignment**: Users with roles `EMPLOYEE` or `DEPARTMENT_HEAD` must have a valid `departmentId` assigned. Users with roles `ADMIN` or `ASSET_MANAGER` may leave this field `null`.
3. **Authentication Check**: Only users with status `ACTIVE` are allowed to log into the application or be assigned active allocations/bookings.

---

## Example Document
```json
{
  "_id": { "$oid": "64b0f3e8c1e2f7b8a5d4e104" },
  "username": "david_emp",
  "email": "david.miller@assetflow.com",
  "passwordHash": "$2b$10$zP6k9L.W1jGZ1Vw7t1p.OuP3kQoYm/2L5fC1S0O5P/jM8c3B1tYyS",
  "firstName": "David",
  "lastName": "Miller",
  "role": "EMPLOYEE",
  "departmentId": { "$oid": "64b0f3e8c1e2f7b8a5d4e001" },
  "status": "ACTIVE",
  "contactNumber": "+15550103",
  "createdAt": { "$date": "2026-07-12T04:00:00.000Z" },
  "updatedAt": { "$date": "2026-07-12T04:00:00.000Z" }
}
```
