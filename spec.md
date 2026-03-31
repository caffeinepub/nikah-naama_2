# Nikah Naama

## Current State
Home screen with 5 cards. Masjid registration, Donations (static UPI), Zakat calculator, Admin panel. MasjidProfile lacks upiId. No needy-person Zakat profiles concept.

## Requested Changes (Diff)

### Add
- upiId field to MasjidProfile
- ZakatProfile type with fields: id, masjidId, personName, story, requiredAmount, collectedAmount, upiId, status (open/fulfilled), timestamp, createdBy
- Backend methods for ZakatProfile CRUD and fulfillment marking
- Donations page: list approved masjids, show selected masjid UPI for direct donation
- Zakat page: Needy Profiles section with progress bars and UPI donate button
- Masjid panel: tab to post and manage Zakat profiles for needy people in their area
- Admin: full CRUD on ZakatProfiles and all MasjidProfile fields including UPI

### Modify
- MasjidRegisterPage: add UPI ID field
- MasjidPage: add Zakat Profiles management tab
- DonationsPage: replace static UPI with dynamic masjid list
- ZakatPage: add profiles section below calculator
- AdminPage: add Zakat profiles tab, allow editing masjid details including UPI

### Remove
- Static donation UPI info from DonationsPage

## Implementation Plan
1. Regenerate Motoko backend with ZakatProfile and upiId on MasjidProfile
2. Update all affected frontend pages
