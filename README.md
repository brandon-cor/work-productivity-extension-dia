# Website Blocker — Time Slots

Stay focused by automatically redirecting distracting sites during the times you choose.

## What you can do ✅

- Add any number of websites to block (e.g., `youtube.com`, `reddit.com`)
- Create time slots with start/end times
- Choose the days each slot applies to (leave empty = all days)
- Toggle sites and slots on/off individually
- Works across all tabs and windows
- Clean, simple popup UI

## Known issues / things still being adjusted ⌛️

- Delete buttons in the popup may not act for some users in some Chrome versions. If clicking Delete doesn’t remove an item and you see no popup‑console logs, close and reopen the popup and try again.
- Other content blockers (e.g., uBlock) can flood the console with network errors unrelated to this extension. Use the popup’s DevTools console for extension logs (right‑click inside the popup → Inspect).
- Timezone uses your system time. If you frequently change timezones, recheck slot hours.

## Install (Chrome/Chromium-based browsers)

1. Download or clone this repo
   ```bash
   git clone https://github.com/yourname/website-blocker-extension.git
   cd website-blocker-extension
   ```
2. Open Chrome and go to `chrome://extensions/`
3. Enable “Developer mode” (top-right)
4. Click “Load unpacked” and select this `website-blocker-extension` folder
5. Pin the extension if you want quick access from the toolbar

## Using the popup

1. Click the extension icon to open the popup
2. Blocked Sites tab
   - Click “+ Add Site”, enter a domain like `facebook.com`, Save
   - Toggle a site on/off anytime
3. Time Slots tab
   - Click “+ Add Time Slot”, set start/end times, choose days (or leave empty for all), Save
   - Toggle a slot on/off anytime

Notes:
- A site is only blocked when there is at least one enabled time slot that is currently active.
- Slots that span midnight are supported (e.g., 22:00 → 06:00).

## What happens when a site is blocked?

When you navigate to a blocked site during an active slot, you’ll be redirected to the built‑in `blocked.html` page with a message and a link back to what you were doing.
