# CBN TECH LICENSE CONTROLLER API

Enterprise-grade **Node.js & Express** License Controller API with **MySQL** database persistence, **AES-256-GCM** payload encryption, **HMAC-SHA256** digital signatures, device activation locking, and an interactive **Cyber Dark-Mode Web Management Dashboard**.

---

## 🌟 Key Features

1. **Cryptographic Key Generation (`CryptoService`)**:
   - Generates formatted keys: `CBN-XXXX-XXXX-XXXX-XXXX`
   - Signed with **HMAC-SHA256** checksums to prevent forging.
   - Metadata payload encrypted via **AES-256-GCM** (Authenticated Encryption with 12-byte IV + 16-byte Auth Tag).
   - Indexed constant-time database lookups using **SHA-256 Key Hashing**.

2. **Client Verification Endpoint (100% Compatible with CBN TECH WPF Client)**:
   - `POST /api/verify-license`
   - Validates key, checks expiration date, checks status (`active`, `expired`, `revoked`, `suspended`), and registers device binding.
   - Enforces max device activation quota (e.g. 1 device, 5 devices, or unlimited).

3. **MySQL Database with Auto-Migration**:
   - Connection pooling using `mysql2/promise`.
   - Automatically initializes the database schema, tables (`licenses`, `license_activations`, `verification_logs`), and indexes on boot.
   - Includes in-memory fallback for instant zero-dependency testing if MySQL is temporarily offline.

4. **Web Admin Dashboard**:
   - Served on `http://localhost:3000/`
   - Real-time license generation modal with 1-click clipboard copy.
   - Live telemetry counters (Active, Expired, Revoked, Activations, Verification Volume).
   - Live audit terminal stream showing client pings.
   - Batch generator for bulk license issuing.
   - Instant remote revocation (Kill-Switch) and expiration extension (+30d, +1y).

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18.0 or higher (v24.x tested)
- **MySQL**: v8.0+ or MariaDB 10.5+ (Optional: fallback mode available if MySQL is not running)

### 2. Installation & Configuration
```bash
cd license_server
npm install
```

Copy `.env.example` to `.env` (already created):
```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=dpms_licenses
ENCRYPTION_SECRET=d9f4e2a8b3c10759f6e8123456789abcdef0123456789abcdef0123456789abcdef
HMAC_SIGNATURE_KEY=dpms_enterprise_hmac_master_signature_key_2026
ADMIN_API_KEY=DPMS-ADMIN-SECRET-KEY-9988
```

### 3. Run the Server
```bash
npm start
```
* The server will boot on `http://localhost:3000`
* Open `http://localhost:3000/` in your browser to access the Admin Management Dashboard.

---

## 📡 API Reference

### 1. Client License Verification
Used by the WPF Kiosk Client during boot and operator session startup.

* **Endpoint**: `POST /api/verify-license` (or `POST /api/license/verify`)
* **Content-Type**: `application/json`

**Request Body**:
```json
{
  "key": "DPMS-8F92-4C7E-902B-1E5A",
  "client_version": "1.0",
  "machine_name": "DESKTOP-TERMINAL-01"
}
```

**Response (Success)**:
```json
{
  "valid": true,
  "message": "License verified successfully",
  "expiry": "2027-08-17T17:00:00.000Z",
  "tier": "Enterprise",
  "customer": "Darling Dry Port Ltd.",
  "activations": "1/5",
  "features": [
    "kiosk_hardening",
    "tls_encryption",
    "terminal_desk",
    "operator_multi_user"
  ]
}
```

**Response (Expired or Invalid)**:
```json
{
  "valid": false,
  "message": "License expired on 2026-08-15",
  "expiry": "2026-08-15T00:00:00.000Z"
}
```

---

### 2. Admin License Management API

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/admin/licenses/generate` | Generate a new encrypted license key |
| `POST` | `/api/admin/licenses/batch-generate` | Generate batch of license keys |
| `GET` | `/api/admin/licenses` | List all licenses with search/filter |
| `GET` | `/api/admin/licenses/:id` | Get license details & device activations |
| `PUT` | `/api/admin/licenses/:id/revoke` | Revoke license (Kill-Switch) |
| `PUT` | `/api/admin/licenses/:id/extend` | Extend expiration date (+N days) |
| `DELETE` | `/api/admin/licenses/:id` | Delete license record |
| `GET` | `/api/admin/telemetry` | System audit counters & live logs |

---

## 🔗 Connecting WPF Client to this License Server

1. Start the license server (`npm start`).
2. Open the WPF Client Developer Console (`Ctrl + Shift + Alt + D`).
3. Set **LICENSE SERVER URL** to:
   `http://localhost:3000/api/verify-license`
4. Click **Save & Apply**.
5. Paste any license generated from `http://localhost:3000/` into the WPF client to activate!
