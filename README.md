# Website Blocker - Time Slots Chrome Extension

A Chrome extension that allows you to block websites during specified time slots. Perfect for productivity and focus during work hours or study time.

## Features

- ✅ Block unlimited websites
- ✅ Schedule blocking during specific time slots
- ✅ Choose which days of the week blocking is active
- ✅ Enable/disable sites and time slots individually
- ✅ Modern, user-friendly interface
- ✅ Works with all websites

## Installation

1. **Download or clone this repository** to your computer
   ```bash
   cd website-blocker-extension
   ```

2. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - Or go to Menu (three dots) → Extensions → Manage extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked" button
   - Select the `website-blocker-extension` folder
   - The extension should now appear in your extensions list

5. **Set Up Icons** (Optional)
   - The extension needs icon files. You can create simple PNG icons at:
     - `icons/icon16.png` (16x16 pixels)
     - `icons/icon48.png` (48x48 pixels)
     - `icons/icon128.png` (128x128 pixels)
   - Or download placeholder icons from any icon generator website
   - The extension will still work without icons, but Chrome may show a default icon

## How to Use

1. **Click the extension icon** in your Chrome toolbar

2. **Add Blocked Websites**
   - Go to the "Blocked Sites" tab
   - Click "+ Add Site"
   - Enter the website domain (e.g., `facebook.com`, `twitter.com`)
   - Click "Save"

3. **Create Time Slots**
   - Go to the "Time Slots" tab
   - Click "+ Add Time Slot"
   - Set start and end times
   - Select which days of the week this slot is active (or leave empty for all days)
   - Optionally give it a name (e.g., "Work Hours", "Study Time")
   - Click "Save"

4. **Enable/Disable**
   - Use the toggle switches next to each site or time slot to enable/disable them
   - Websites are only blocked when:
     - The website is enabled
     - At least one time slot is enabled
     - Current time falls within an active time slot
     - Current day matches the time slot's selected days

## Examples

### Block Social Media During Work Hours
- Add sites: `facebook.com`, `twitter.com`, `instagram.com`
- Create time slot: Monday-Friday, 9:00 AM - 5:00 PM

### Block Distractions During Study Time
- Add sites: `reddit.com`, `youtube.com`, `netflix.com`
- Create time slot: All days, 7:00 PM - 10:00 PM

### Overnight Blocking
- Add sites: any distracting sites
- Create time slot: All days, 10:00 PM - 6:00 AM (spans midnight)

## Technical Details

- **Manifest Version**: 3 (Chrome Extension Manifest V3)
- **Blocking Method**: Uses Chrome's `webRequest` API to cancel requests
- **Storage**: Uses Chrome's `sync` storage API (syncs across your Chrome instances)
- **Permissions**: 
  - `webRequest` and `webRequestBlocking`: To intercept and block requests
  - `storage`: To save your settings
  - `<all_urls>`: To block any website

## Notes

- The extension blocks websites by canceling network requests during active time slots
- If you need to access a blocked site urgently, you can disable the extension or turn off the specific time slot
- Settings sync across all Chrome instances if you're signed into Chrome
- The extension checks time slots in real-time, so changes take effect immediately

## Troubleshooting

- **Extension not blocking sites**: 
  - Make sure both the site and time slot are enabled
  - Verify the current time is within the time slot
  - Check that the current day matches the time slot's selected days
  
- **Can't load extension**:
  - Make sure Developer mode is enabled
  - Verify all files are in the correct folder
  - Check the browser console for errors (right-click extension icon → Inspect popup)

## Privacy

- This extension does not collect or transmit any data
- All settings are stored locally in Chrome's sync storage
- No external servers or APIs are used
- The extension only blocks websites; it doesn't track or monitor your browsing

## License

Free to use and modify as needed.

# work-productivity-extension-dia
