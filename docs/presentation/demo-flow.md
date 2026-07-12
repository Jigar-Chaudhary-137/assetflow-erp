# Presentation: Demo Flow Script

A step-by-step walkthrough sequence to present during the hackathon evaluation.

---

## Part 1: Admin Configuration & Registration (1.5 Minutes)
1. **Login as Admin**:
   - Access: `admin@assetflow.com` / `Password123`.
   - Show: Dashboard with quick counters (total assets, active allocations, pending repairs).
2. **Dynamic Category Creation**:
   - Action: Go to **Categories** → Create Category named "Mobile Testing Device" (Code: `MOB`).
   - Setup: Add custom fields `operatingSystem` (STRING, required) and `screenSize` (NUMBER, optional).
3. **Asset Registration**:
   - Action: Go to **Assets** → Register asset "iPhone 15 Pro" with tag `AST-MOB-0001` under "Mobile Testing Device".
   - Setup: Fill specifications (`operatingSystem: iOS 17`, `screenSize: 6.1`). Mark it as `bookable: true`.

---

## Part 2: Booking and Conflict Resolution (1.5 Minutes)
1. **Login as Employee**:
   - Action: Log out Admin, login as Employee `david_emp` (`david.miller@assetflow.com`).
2. **Resource Booking**:
   - Action: Go to **Bookings** → Book "iPhone 15 Pro" for tomorrow from `10:00 AM` to `11:00 AM` for "iOS Compatibility Testing".
   - Show: Successful reservation (Asset status updates to `RESERVED` for that block).
3. **Overlap Conflict Demonstration**:
   - Action: Log out Employee, login as another employee. Try booking the same "iPhone 15 Pro" for tomorrow from `10:30 AM` to `11:30 AM`.
   - Show: The system blocks the request and displays a validation alert: "Conflict detected: Resource already booked for this timeframe."

---

## Part 3: Audit, Maintenance & Auto-Cascade (2 Minutes)
1. **Login as Asset Manager**:
   - Action: Login as Manager `manager_aud` (`manager@assetflow.com`).
2. **Create and Start Audit Cycle**:
   - Action: Go to **Audits** → Create "Q3 Mobile Device Verification" targeting Category "Mobile Testing Device". Set status to `ACTIVE`.
3. **Simulate Asset Damage Cascade**:
   - Action: Locate `AST-MOB-0001` in the audit listing → Click **Report Damaged**.
   - Input: "Glass back screen shattered, touch responsiveness degraded."
   - Show:
     - The asset is pushed into the `damagedAssets` array in the audit.
     - The asset's registry status automatically updates to `UNDER_MAINTENANCE` (preventing any bookings or allocations).
     - A Mongoose hook automatically generates a `PENDING` work order in **Maintenance** and dispatches a notification alert to the technician.
4. **Maintenance Resolution**:
   - Action: Go to **Maintenance** → Open the auto-generated ticket. Assign a technician and schedule the repair.
   - Action: Resolve ticket → Input `cost: 120.00` and `resolutionDetails: Replaced screen module and back glass.`
   - Show: Asset status reverts to `AVAILABLE` in the inventory, verified and ready for bookings.
