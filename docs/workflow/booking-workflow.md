# Workflow: Booking Workflow

Manages short-term reservations for shared resources (e.g. conference rooms, projectors, test benches).

## Booking State Transition

```mermaid
stateDiagram-v2
    [*] --> UPCOMING : Creation (POST /bookings)
    UPCOMING --> ONGOING : Start Time Reached (Cron / Hook)
    ONGOING --> COMPLETED : End Time Reached
    UPCOMING --> CANCELLED : Cancel (PATCH /bookings/:id/cancel)
    ONGOING --> CANCELLED : Cancel (Emergency release)
    COMPLETED --> [*]
    CANCELLED --> [*]
```

---

## Step-by-Step Flow

```mermaid
flowchart TD
    A[Employee requests Booking] --> B{Asset bookable: true?}
    B -->|No| C[Reject: Not bookable]
    B -->|Yes| D{Duration <= 24 hours & Start in future?}
    D -->|No| E[Reject: Invalid timeframe]
    D -->|Yes| F{Overlap Check query returns results?}
    F -->|Yes| G[Reject: Slot conflict 409]
    F -->|No| H[Save Booking as UPCOMING]
    H --> I[Change Asset Status to RESERVED]
    I --> J[Send Booking Confirmation Notification]
```

---

## Detailed Rules

1. **Overlap Definition**: A conflict is detected if there is an existing booking for the same resource with status `UPCOMING` or `ONGOING` that overlaps with the requested range `[newStart, newEnd]`. The backend verifies this using:
   $$\text{existingStart} < \text{newEnd} \quad \text{AND} \quad \text{existingEnd} > \text{newStart}$$
2. **Asset Locking**: When the asset is `RESERVED` for a booking, it cannot be allocated to any user or booked by another slot.
3. **Cancellation**: When cancelled, the reservation is released immediately, setting asset status to `AVAILABLE` so it is immediately bookable by others.
