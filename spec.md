# Nikah Naama

## Current State

The app has a full Masjid Registration form with fields: masjidName, address, city, state, contactPerson, phone, email, registrationNumber, capacity, facilities, and upiId (Masjid's own donation UPI). On submit, a static success card is shown — no unique ID, no redirect, no WhatsApp message.

The Admin Panel has 8 tabs: Pending Nikah, All Nikah, Matrimony, Jobs, Masjid Applications, Zakat Profiles, Zakat Settings, and Admin Management. There is no tab or section to configure a registration UPI ID or registration fee amount.

The backend MasjidProfile type has no committee fields (president/secretary/treasurer) and no UTR number or registration fee fields. There are no stable variables for a global registration UPI ID or registration fee amount.

## Requested Changes (Diff)

### Add
- **Backend:** `stable var registrationUpiId: Text = ""` and `stable var registrationFeeAmount: Nat = 0`
- **Backend:** Public admin-only functions `setRegistrationSettings(upiId, fee)` and `getRegistrationSettings() : async (Text, Nat)` (public query)
- **Backend:** Committee fields to `MasjidProfile` type: `presidentName`, `presidentPhone`, `secretaryName`, `secretaryPhone`, `treasurerName`, `treasurerPhone` (all Text)
- **Backend:** `utrNumber: Text` field to `MasjidProfile` type for payment verification
- **Backend:** `masjidRegistrationId: Text` generated on submit (e.g. `"MASJID-2026-0001"`) returned from `submitMasjidRegistration`
- **Admin Panel:** New "Registration Settings" section (or sub-section within Masjid Applications tab) with two fields: UPI ID for Registration Payment and Registration Fee Amount (₹); Save button calls `setRegistrationSettings`
- **Masjid Register Form:** Committee details section with 6 fields: President Name, President Phone, Secretary Name, Secretary Phone, Treasurer Name, Treasurer Phone
- **Masjid Register Form:** Payment instruction block that fetches admin-set UPI and fee — shows: "Please pay ₹[fee] to UPI: [upiId]" with a prominent display
- **Masjid Register Form:** Mandatory UTR number input field
- **Masjid Register Form:** On submit success — show unique Masjid Registration ID (e.g. `MASJID-2026-0001`), then redirect to home page `/` after 3 seconds
- **Masjid Register Form:** On redirect, open WhatsApp with pre-filled message: "Registration successfully submitted. Your login credentials will be shared after verification and approval. Registration ID: [ID]"

### Modify
- `MasjidProfile` type in backend to include new committee and UTR fields
- `submitMasjidRegistration` backend function to accept and store new fields
- `MasjidRegisterPage.tsx` to add all new form sections (committee, payment block, UTR), update submit handler, and change success flow
- `AdminPage.tsx` to add Registration Settings section in the Masjid Applications tab (or as a dedicated settings sub-section)
- `backend.d.ts` and IDL declarations to reflect new types and functions

### Remove
- Static success card on Masjid Register page (replace with ID display + auto-redirect)

## Implementation Plan

1. Update `MasjidProfile` type in `main.mo` to add committee + UTR fields; add stable vars for registrationUpiId and registrationFeeAmount; add setter/getter functions; add migration for old MasjidProfile V2 to V3
2. Regenerate `backend.d.ts` and IDL declarations with new types and functions
3. Update `MasjidRegisterPage.tsx`: add committee section, payment block (fetch + display UPI/fee), UTR input, update submit handler, new success flow with ID + redirect + WhatsApp
4. Update `AdminPage.tsx`: add Registration Settings section under Masjid Applications tab with UPI and fee inputs + save button
