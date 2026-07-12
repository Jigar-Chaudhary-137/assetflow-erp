# Presentation: Future Scope & Roadmap

Scalability and expansion roadmap for the AssetFlow ERP system.

---

## 1. Automated Scanner Integrations
- **RFID / Barcode / QR Code Scanning**: Develop native iOS and Android companion apps with hardware scanner integration. This will allow auditors to scan barcode labels on physical hardware during audit cycles, immediately calling the `/api/audits/:id/verify` endpoint without manual text typing.

---

## 2. IoT and RTLS Integration
- **Real-Time Location Tracking (RTLS)**: Integrate Bluetooth Low Energy (BLE) beacons or Wi-Fi triangulation to track high-value physical assets. If an asset leaves its designated room/building, the system can automatically flag its condition, update status to `LOST`, and generate security notifications.

---

## 3. Advanced Notification & Messaging
- **Multi-Channel Dispatcher**: Extend the notification subsystem to dispatch real-time alerts via Email, Slack, Microsoft Teams, and Push notifications.
- **Scheduled Digests**: Implement a daily/weekly digest email sent to managers listing outstanding transfer approvals, upcoming bookings, and overdue maintenance tickets.

---

## 4. Intelligent Predictive Maintenance
- **Predictive AI Engine**: Implement Machine Learning regression models utilizing historical repair data (repair cost, repair frequency, brand/category, condition logs) to forecast when an asset is likely to fail, automatically scheduling preventive maintenance before breakdown occurs.
