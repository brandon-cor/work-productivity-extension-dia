// Background service worker for blocking websites during time slots

// Initialize default storage
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.sync.get(['blockedSites', 'timeSlots']);
  if (!data.blockedSites) {
    await chrome.storage.sync.set({ blockedSites: [] });
  }
  if (!data.timeSlots) {
    await chrome.storage.sync.set({ timeSlots: [] });
  }
});

// Get active time slot info
function getActiveTimeSlot(timeSlots) {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
  const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight

  for (const slot of timeSlots) {
    // Check if slot is enabled
    if (!slot.enabled) continue;

    // Check if current day is in the slot's days array
    const dayMatch = slot.days.length === 0 || slot.days.includes(currentDay);

    // Parse start and end times
    const [startHour, startMin] = slot.startTime.split(':').map(Number);
    const [endHour, endMin] = slot.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Handle time slots that span midnight
    let timeMatch;
    if (endMinutes < startMinutes) {
      // Slot spans midnight (e.g., 22:00 - 06:00)
      timeMatch = currentTime >= startMinutes || currentTime < endMinutes;
    } else {
      // Normal slot (e.g., 09:00 - 17:00)
      timeMatch = currentTime >= startMinutes && currentTime < endMinutes;
    }

    if (dayMatch && timeMatch) {
      return slot;
    }
  }

  return null;
}

// Check if current time is within any active time slot
function isWithinTimeSlot(timeSlots) {
  return getActiveTimeSlot(timeSlots) !== null;
}

// Check if URL matches any blocked site
function matchesBlockedSite(url, blockedSites) {
  if (!blockedSites || blockedSites.length === 0) return false;

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace(/^www\./, '');

    return blockedSites.some(site => {
      if (!site.enabled) return false;

      const sitePattern = site.url.replace(/^www\./, '').toLowerCase();
      const urlHostname = hostname.toLowerCase();

      // Exact match or domain match
      return urlHostname === sitePattern ||
        urlHostname.endsWith('.' + sitePattern) ||
        urlHostname.includes(sitePattern);
    });
  } catch (e) {
    return false;
  }
}

// Check and block a single tab if needed
async function checkAndBlockTab(tab) {
  // Skip if tab URL is invalid or is extension/internal page
  if (!tab.url ||
    tab.url.startsWith('chrome://') ||
    tab.url.startsWith('chrome-extension://') ||
    tab.url.startsWith('edge://') ||
    tab.url.startsWith('about:') ||
    tab.url.startsWith('data:')) {
    return;
  }

  // If on blocked page, check if we should still be blocked
  // If not blocked anymore, we can't redirect back automatically,
  // but this will prevent re-blocking if they navigate
  if (tab.url.includes('blocked.html')) {
    return;
  }

  const data = await chrome.storage.sync.get(['blockedSites', 'timeSlots']);
  const blockedSites = data.blockedSites || [];
  const timeSlots = data.timeSlots || [];

  // Check if we're in an active time slot
  const activeSlot = getActiveTimeSlot(timeSlots);

  // Only block if we have an active slot AND the site is blocked
  // This ensures disabled slots don't block anything
  if (activeSlot && matchesBlockedSite(tab.url, blockedSites)) {
    console.log(`Blocking ${tab.url} during time slot: ${activeSlot.name || activeSlot.startTime}`);

    // Redirect to blocked page immediately
    const blockedPageUrl = chrome.runtime.getURL('blocked.html') +
      `?url=${encodeURIComponent(tab.url)}&slot=${encodeURIComponent(activeSlot.name || `${activeSlot.startTime} - ${activeSlot.endTime}`)}`;

    try {
      await chrome.tabs.update(tab.id, { url: blockedPageUrl });
      console.log(`Redirected tab ${tab.id} to blocked page`);
    } catch (error) {
      console.error('Error redirecting tab to blocked page:', error);
    }
  } else if (!activeSlot) {
    // No active slot - sites should not be blocked
    console.log(`No active time slot - ${tab.url} is allowed`);
  }
}

// Check all open tabs and block them if needed
async function checkAllTabs() {
  try {
    const tabs = await chrome.tabs.query({});
    const checkPromises = tabs.map(tab => checkAndBlockTab(tab));
    await Promise.all(checkPromises);
  } catch (error) {
    console.error('Error checking tabs:', error);
  }
}

// Intercept navigation BEFORE it happens and redirect to blocked page
// This works in Manifest V3 without needing webRequest blocking permissions
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only handle main frame navigation
  if (details.frameId !== 0) return;

  // Skip extension pages and Chrome internal pages
  if (details.url.startsWith('chrome://') ||
    details.url.startsWith('chrome-extension://') ||
    details.url.startsWith('edge://') ||
    details.url.includes('blocked.html')) {
    return;
  }

  const data = await chrome.storage.sync.get(['blockedSites', 'timeSlots']);
  const blockedSites = data.blockedSites || [];
  const timeSlots = data.timeSlots || [];

  // Check if we're in an active time slot
  const activeSlot = getActiveTimeSlot(timeSlots);

  // Only block if there's an active slot - disabled slots won't block
  if (activeSlot && matchesBlockedSite(details.url, blockedSites)) {
    console.log(`Blocking ${details.url} during time slot: ${activeSlot.name || activeSlot.startTime}`);

    // Redirect to blocked page immediately
    const blockedPageUrl = chrome.runtime.getURL('blocked.html') +
      `?url=${encodeURIComponent(details.url)}&slot=${encodeURIComponent(activeSlot.name || `${activeSlot.startTime} - ${activeSlot.endTime}`)}`;

    try {
      await chrome.tabs.update(details.tabId, { url: blockedPageUrl });
      console.log(`Redirected to blocked page: ${blockedPageUrl}`);
    } catch (error) {
      console.error('Error redirecting to blocked page:', error);
    }
  } else {
    console.log(`No active slot - allowing navigation to ${details.url}`);
  }
});

// Listen for storage changes and re-check all tabs when settings change
chrome.storage.onChanged.addListener(async (changes, areaName) => {
  // Only react to sync storage changes (user's settings)
  if (areaName === 'sync' && (changes.blockedSites || changes.timeSlots)) {
    console.log('Settings changed, re-checking all tabs...');
    // Small delay to ensure storage is fully updated
    setTimeout(() => {
      checkAllTabs();
    }, 100);
  }
});

// Check all tabs periodically to ensure they stay blocked
// This handles edge cases like time slots ending/starting or settings changing
setInterval(() => {
  checkAllTabs();
}, 30000); // Check every 30 seconds

// Also check when a tab is updated (e.g., page finishes loading, user navigates)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only check when navigation completes and URL is available
  if (changeInfo.status === 'complete' && tab.url) {
    // If on blocked page, check if we should unblock
    if (tab.url.includes('blocked.html')) {
      const data = await chrome.storage.sync.get(['blockedSites', 'timeSlots']);
      const blockedSites = data.blockedSites || [];
      const timeSlots = data.timeSlots || [];
      const activeSlot = getActiveTimeSlot(timeSlots);

      // If no active slot, allow navigation away (user can manually navigate)
      // Don't force redirect here as user might want to stay on blocked page
      // The webNavigation listener will handle blocking new navigation
      return;
    }
    await checkAndBlockTab(tab);
  }
});

// Check all tabs when extension starts/restarts
checkAllTabs();

// Debug logging
console.log('Website Blocker extension loaded and ready - monitoring all tabs');

