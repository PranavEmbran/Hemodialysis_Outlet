# Multi-Booking Logic for Scheduling Page

## Requirements
- Allow multiple patients to book the same session slot (date+time), up to the number of available dialysis units.
- Prevent booking if the number of bookings for a session slot equals the number of units.
- Display booked/total units for each session slot in the UI.
- Disable selection of session slots that are at capacity.
- Update booking availability in real time or on save.

## Implementation Steps
1. Fetch `SL_No_of_units` from `scheduling_lookup` and store in a state variable.
2. For each session slot, count how many bookings exist in `Dialysis_Schedules` for that slot.
3. Show `booked/total units` in the schedule table.
4. Disable selection if `booked >= unitsCount`.
5. Prevent overbooking in the backend as well.
6. Update UI dynamically on changes.

## UI Changes
- Add a column for `Booked/Units` in the schedule table.
- Checkbox for selection is disabled if the slot is at capacity.
- Visual indicator for full slots (e.g., red row or icon).

## Notes
- This logic ensures that the scheduling system reflects the real-world capacity of dialysis units and prevents overbooking.
