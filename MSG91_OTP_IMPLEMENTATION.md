# MSG91 OTP Implementation

This document describes how MSG91 OTP is implemented in this codebase (frontend widget + backend token verification).

## Overview
- Frontend uses the MSG91 OTP widget to send and verify OTPs.
- Backend validates the vehicle + mobile inputs, then verifies the MSG91 widget access token server-side before logging in or creating a user.

## Key Files
- Frontend UI and widget integration: `src/pages/Auth.jsx`
- Frontend API calls: `src/services/authService.js`
- Backend OTP validation + verification: `backend/controllers/authController.js`
- Backend routes: `backend/routes/authRoutes.js`

## Environment Variables
Frontend:
- `VITE_MSG91_WIDGET_ID` (widget ID from MSG91 dashboard)
- `VITE_MSG91_AUTH_KEY` (OTP Widget token, NOT the main authkey)

Backend:
- `MSG91_AUTHKEY` (server-side authkey used to verify widget access token)

## Frontend Flow (Widget)
1. User enters vehicle number + mobile number and clicks **Send OTP**.
2. Frontend calls `POST /api/auth/validate-for-otp` via `authService.validateForMsg91(...)`.
3. If validation passes, it initializes the MSG91 widget using:
   - `window.initSendOTP(cfg)` with `widgetId`, `tokenAuth`, `authToken`, and `identifier`.
4. OTP is sent via `window.sendOtp(identifier, success, failure)`.
5. User enters the 4-digit OTP and the widget verifies it using `window.verifyOtp(...)`.
6. On success, the widget returns an access token which is sent to the backend via `authService.verifyMsg91Token(...)`.

## Backend Flow (Token Verification)
Endpoints:
- `POST /api/auth/validate-for-otp`
  - Validates that vehicle + mobile are present.
  - If intent is `login`: user must exist with matching vehicle + mobile.
  - If intent is `signup`: no existing user with that vehicle should exist.

- `POST /api/auth/verify-msg91-token`
  - Requires `vehicleNumber`, `mobileNumber`, and `accessToken`.
  - Calls MSG91 server API:
    - `https://control.msg91.com/api/v5/widget/verifyAccessToken`
    - Sends `{ authkey: MSG91_AUTHKEY, "access-token": accessToken }`.
  - If MSG91 verifies the token, backend logs in or creates user and returns a JWT.

## Notes and Gotchas
- `VITE_MSG91_AUTH_KEY` must be the **OTP Widget token**, not the main MSG91 authkey.
- The frontend shows a detailed fix guide for AuthenticationFailure errors in `src/pages/Auth.jsx`.
- If `MSG91_AUTHKEY` is missing on the server, verification fails with `MSG91 not configured on server`.

## End-to-End Sequence (Short)
1. `Auth.jsx` -> `validate-for-otp`
2. MSG91 widget sends OTP
3. User enters OTP
4. MSG91 widget returns access token
5. `Auth.jsx` -> `verify-msg91-token`
6. Backend verifies token with MSG91
7. User is logged in / created
