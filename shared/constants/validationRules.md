# Constants: Validation Rules

## Purpose
Defines all field-level validation rules for AssetFlow. These rules are the single source of truth for both backend Mongoose schema validators and frontend React Hook Form validators. Keeping them in sync ensures consistent error messages across the application.

---

## Authentication

### Email
- **Format**: Must match RFC 5322 pattern — `user@domain.tld`
- **Case**: Stored in lowercase; validation is case-insensitive
- **Required**: Yes
- **Unique**: Yes (enforced by DB index)

```js
// Regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

### Password
- **Min length**: 8 characters
- **Max length**: 72 characters (bcrypt limit)
- **Required**: Yes (at registration)
- **Not returned**: Never included in API responses

### Username
- **Pattern**: Alphanumeric, underscores allowed (`a-z`, `0-9`, `_`)
- **Min length**: 3 characters
- **Max length**: 30 characters
- **Required**: Yes
- **Unique**: Yes

```js
const USERNAME_REGEX = /^[a-z0-9_]{3,30}$/;
```

---

## User

| Field | Rule |
| :--- | :--- |
| `firstName` | Required, 1–50 characters, trimmed |
| `lastName` | Required, 1–50 characters, trimmed |
| `role` | Required, one of: `ADMIN`, `ASSET_MANAGER`, `DEPARTMENT_HEAD`, `EMPLOYEE` |
| `contactNumber` | Optional, must match phone pattern `^\+?[0-9\s\-]{7,15}$` |
| `departmentId` | Required for `DEPARTMENT_HEAD` and `EMPLOYEE` roles |

---

## Department

| Field | Rule |
| :--- | :--- |
| `name` | Required, 2–100 characters, trimmed, unique |
| `code` | Required, 2–10 characters, uppercase, alphanumeric, unique |
| `parentDepartmentId` | Optional, must not equal its own `_id` (no circular reference) |

---

## Category

| Field | Rule |
| :--- | :--- |
| `name` | Required, 2–50 characters, trimmed, unique |
| `code` | Required, 2–5 characters, uppercase, alphanumeric, unique |
| `customFields[].fieldName` | Required, camelCase, unique within the array |
| `customFields[].fieldType` | Required, one of: `STRING`, `NUMBER`, `BOOLEAN`, `DATE` |

---

## Asset

| Field | Rule |
| :--- | :--- |
| `assetTag` | Required, unique, pattern: `AST-[A-Z]+-\d{4}` (e.g. `AST-LAP-0001`) |
| `serialNumber` | Required, unique, 3–100 characters, trimmed |
| `name` | Required, 2–100 characters, trimmed |
| `categoryId` | Required, valid ObjectId referencing `categories` |
| `condition` | Required, one of: `NEW`, `GOOD`, `FAIR`, `POOR`, `DAMAGED` |
| `location.building` | Required, trimmed |
| `location.room` | Required, trimmed |
| `location.floor` | Optional, integer |
| `specs` | Must conform to parent category's `customFields` definitions |
| `purchaseInfo.purchaseCost` | Optional, non-negative number |
| `purchaseInfo.warrantyExpiration` | Optional, must be a future or present date |

---

## Allocation

| Field | Rule |
| :--- | :--- |
| `assetId` | Required, must reference an `AVAILABLE` asset |
| `employeeId` | Required, must reference an `ACTIVE` user |
| `expectedReturnDate` | Optional, must be in the future if provided |
| **No double allocation** | An asset may only have one `ACTIVE` allocation at a time |

---

## Booking

| Field | Rule |
| :--- | :--- |
| `resourceId` | Required, must reference an asset with `bookable: true` |
| `startTime` | Required, must be in the future at time of creation |
| `endTime` | Required, must be strictly greater than `startTime` |
| `purpose` | Required, 5–200 characters |
| **Duration limit** | Maximum booking duration is 24 hours |
| **Overlap** | No two `UPCOMING` or `ONGOING` bookings for the same resource can share any overlapping time |

```js
// Overlap check query
{
  resourceId: bookingResourceId,
  status:     { $in: ['UPCOMING', 'ONGOING'] },
  startTime:  { $lt: newEndTime },
  endTime:    { $gt: newStartTime },
}
```

---

## Maintenance

| Field | Rule |
| :--- | :--- |
| `assetId` | Required, valid ObjectId |
| `issueDescription` | Required, 10–500 characters |
| `priority` | Required, one of: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `cost` | Required on resolve, must be `>= 0` |
| `resolutionDetails` | Required when setting status to `RESOLVED` |
| `technicianId` | Required when status is `TECHNICIAN_ASSIGNED` |
| **Approval required** | Must be `APPROVED` before `TECHNICIAN_ASSIGNED` or `IN_PROGRESS` |

---

## Audit

| Field | Rule |
| :--- | :--- |
| `auditCycleName` | Required, 3–100 characters, trimmed |
| `startDate` | Required, valid date |
| `endDate` | Optional, must be on or after `startDate` |
| `auditorId` | Required, must reference a user with role `ADMIN` or `ASSET_MANAGER` |

---

## Frontend Usage (React Hook Form Example)

```jsx
const { register, formState: { errors } } = useForm();

<input
  {...register('email', {
    required: 'Email is required',
    pattern:  { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
  })}
/>

<input
  {...register('password', {
    required:  'Password is required',
    minLength: { value: 8, message: 'Password must be at least 8 characters' },
    maxLength: { value: 72, message: 'Password is too long' },
  })}
/>
```

---

## Backend Usage (Mongoose Validator Example)

```js
email: {
  type:      String,
  required:  [true, 'Email is required'],
  unique:    true,
  lowercase: true,
  trim:      true,
  match:     [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
}
```
