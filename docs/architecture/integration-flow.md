# Architecture: Integration Flow

This document details the communication flow between the React Frontend, Express Backend, and MongoDB Database for critical workflows.

---

## 1. Authentication Flow

This flow illustrates credentials submission, verification, and token attachment for subsequent queries.

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Client
    participant FE as React Frontend
    participant BE as Express Backend
    participant DB as MongoDB (users)

    User->>FE: Inputs credentials (email, password)
    FE->>BE: POST /api/auth/login
    BE->>DB: Query user by email/username
    DB-->>BE: Returns User Document (with passwordHash)
    BE->>BE: Bcrypt verify password
    BE->>BE: Generate JWT token (role, userId)
    BE-->>FE: HTTP 200 (Success envelope + Token + User info)
    FE->>FE: Save Token to localStorage
    FE->>User: Renders Dashboard (based on User Role)
```

---

## 2. Resource Booking Overlap Check

How the system checks and books resources, ensuring that double bookings do not occur.

```mermaid
sequenceDiagram
    autonumber
    actor Employee as Employee
    participant FE as React Frontend
    participant BE as Express Backend
    participant DB as MongoDB (bookings)

    Employee->>FE: Selects bookable asset, start & end times
    FE->>BE: POST /api/bookings (resourceId, startTime, endTime)
    BE->>BE: Verify token & check bookable: true
    BE->>DB: Check for overlaps (status: UPCOMING/ONGOING, time range intersect)
    alt Overlap Found
        DB-->>BE: Returns overlapping booking(s)
        BE-->>FE: HTTP 409 Conflict (Overlap error)
        FE->>Employee: Display "Time slot unavailable" message
    else No Overlap
        DB-->>BE: Returns empty (no overlap)
        BE->>DB: Save new Booking (status: UPCOMING)
        DB-->>BE: Save confirmation
        BE-->>FE: HTTP 201 Created (Success envelope)
        FE->>Employee: Display "Booking Confirmed"
    end
```

---

## 3. Audit Damaged Asset Cascade

When an auditor flags an asset as damaged, triggering status locks and maintenance work orders.

```mermaid
sequenceDiagram
    autonumber
    actor Manager as Asset Manager / Admin
    participant FE as React Frontend
    participant BE as Express Backend
    participant DB as MongoDB

    Manager->>FE: Flags asset as DAMAGED in Active Audit
    FE->>BE: PATCH /api/audits/:id/damaged (assetId, damageDescription)
    BE->>DB: 1. Push asset to audit.damagedAssets array
    BE->>DB: 2. Update asset status to UNDER_MAINTENANCE in assets collection
    BE->>DB: 3. Create new Maintenance document (status: PENDING, assetId, reporter)
    BE->>DB: 4. Create Notification document (receiver: technician/managers)
    DB-->>BE: Save confirmations
    BE-->>FE: HTTP 200 OK (Success envelope)
    FE->>Manager: Displays updated audit lists & status
```
