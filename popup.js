// Popup script for managing blocked sites and time slots

let currentEditingSiteIndex = null;
let currentEditingSlotIndex = null;

// Initialize popup
async function init() {
  loadSites();
  loadSlots();
  setupEventListeners();
  console.log('Popup init complete: listeners attached');
}

// Load and display blocked sites
async function loadSites() {
  const data = await chrome.storage.sync.get(['blockedSites']);
  const sites = data.blockedSites || [];
  const sitesList = document.getElementById('sites-list');

  if (sites.length === 0) {
    sitesList.innerHTML = '<div class="empty-state"><p>No blocked sites yet. Add one to get started!</p></div>';
    return;
  }

  sitesList.innerHTML = sites.map((site, index) => `
    <div class="site-item">
      <div class="site-info">
        <div class="site-url">${escapeHtml(site.url)}</div>
        <div class="site-status">${site.enabled ? 'Blocked during active time slots' : 'Disabled'}</div>
      </div>
      <div class="item-actions">
        <label class="toggle-switch">
          <input type="checkbox" ${site.enabled ? 'checked' : ''} 
                 class="site-toggle" data-site-index="${index}">
          <span class="toggle-slider"></span>
        </label>
        <button class="btn btn-danger delete-site-btn" data-site-index="${index}">Delete</button>
      </div>
    </div>
  `).join('');

  // Attach direct click handlers to all delete buttons
  document.querySelectorAll('.delete-site-btn').forEach(btn => {
    const index = parseInt(btn.getAttribute('data-site-index'));
    console.log('Attaching direct handler to delete site button, index:', index);
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('[DIRECT HANDLER] Delete site button clicked! Index:', index);
      if (isNaN(index)) {
        console.error('[DIRECT HANDLER] Invalid site index:', btn.getAttribute('data-site-index'));
        return;
      }
      deleteSite(index).catch(err => {
        console.error('[DIRECT HANDLER] Error in deleteSite:', err);
        if (typeof alert === 'function') alert('Error deleting site: ' + err.message);
      });
    });
  });
}

// Load and display time slots
async function loadSlots() {
  const data = await chrome.storage.sync.get(['timeSlots']);
  const slots = data.timeSlots || [];
  const slotsList = document.getElementById('slots-list');

  if (slots.length === 0) {
    slotsList.innerHTML = '<div class="empty-state"><p>No time slots yet. Add one to schedule blocking!</p></div>';
    return;
  }

  slotsList.innerHTML = slots.map((slot, index) => {
    const daysText = slot.days.length === 0
      ? 'All days'
      : slot.days.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ');

    return `
      <div class="slot-item">
        <div class="slot-info">
          <div class="slot-name">${slot.name || `Slot ${index + 1}`}</div>
          <div class="slot-time">${slot.startTime} - ${slot.endTime} • ${daysText}</div>
        </div>
        <div class="item-actions">
          <label class="toggle-switch">
            <input type="checkbox" ${slot.enabled ? 'checked' : ''} 
                   class="slot-toggle" data-slot-index="${index}">
            <span class="toggle-slider"></span>
          </label>
          <button type="button" class="btn btn-secondary edit-slot-btn" data-slot-index="${index}">Edit</button>
          <button type="button" class="btn btn-danger delete-slot-btn" data-slot-index="${index}">Delete</button>
        </div>
      </div>
    `;
  }).join('');

  // Verify buttons were created correctly
  console.log('Slots loaded. Delete buttons found:', document.querySelectorAll('.delete-slot-btn').length);

  // Attach direct click handlers to all delete buttons
  document.querySelectorAll('.delete-slot-btn').forEach(btn => {
    const index = parseInt(btn.getAttribute('data-slot-index'));
    console.log('Attaching direct handler to delete button, index:', index);
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('[DIRECT HANDLER] Delete slot button clicked! Index:', index);
      if (isNaN(index)) {
        console.error('[DIRECT HANDLER] Invalid index:', btn.getAttribute('data-slot-index'));
        return;
      }
      deleteSlot(index).catch(err => {
        console.error('[DIRECT HANDLER] Error in deleteSlot:', err);
        if (typeof alert === 'function') alert('Error deleting slot: ' + err.message);
      });
    });
  });

  // Attach direct click handlers to edit buttons
  document.querySelectorAll('.edit-slot-btn').forEach(btn => {
    const index = parseInt(btn.getAttribute('data-slot-index'));
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('[DIRECT HANDLER] Edit slot button clicked! Index:', index);
      editSlot(index);
    });
  });
}

// Setup event listeners
function setupEventListeners() {
  // Tab switching
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });

  // Add site modal
  document.getElementById('add-site-btn').addEventListener('click', () => {
    openSiteModal();
  });

  document.getElementById('close-site-modal').addEventListener('click', closeSiteModal);
  document.getElementById('cancel-site-btn').addEventListener('click', closeSiteModal);
  document.getElementById('save-site-btn').addEventListener('click', saveSite);

  // Add slot modal
  document.getElementById('add-slot-btn').addEventListener('click', () => {
    openSlotModal();
  });

  document.getElementById('close-slot-modal').addEventListener('click', closeSlotModal);
  document.getElementById('cancel-slot-btn').addEventListener('click', closeSlotModal);
  document.getElementById('save-slot-btn').addEventListener('click', saveSlot);

  // Close modals on background click
  document.getElementById('site-modal').addEventListener('click', (e) => {
    if (e.target.id === 'site-modal') closeSiteModal();
  });

  document.getElementById('slot-modal').addEventListener('click', (e) => {
    if (e.target.id === 'slot-modal') closeSlotModal();
  });

  // Use event delegation for dynamically created buttons
  document.addEventListener('click', (e) => {
    console.log('Click detected on:', e.target, 'Classes:', e.target.className);

    // Handle edit slot button (use closest in case click is on button text)
    const editBtn = e.target.closest('.edit-slot-btn');
    if (editBtn) {
      e.preventDefault();
      e.stopPropagation();
      const index = parseInt(editBtn.getAttribute('data-slot-index'));
      console.log('Edit button clicked for slot index:', index);
      editSlot(index);
      return;
    }

    // Handle delete slot button (use closest in case click is on button text)
    const deleteBtn = e.target.closest('.delete-slot-btn');
    if (deleteBtn) {
      e.preventDefault();
      e.stopPropagation();
      const index = parseInt(deleteBtn.getAttribute('data-slot-index'));
      console.log('Delete button clicked! Slot index:', index, 'Button:', deleteBtn);
      if (isNaN(index)) {
        console.error('Invalid index:', deleteBtn.getAttribute('data-slot-index'));
        alert('Invalid slot index. Please refresh the extension.');
        return;
      }
      console.log('Calling deleteSlot with index:', index);
      deleteSlot(index).catch(err => {
        console.error('Error in deleteSlot:', err);
        alert('Error deleting slot: ' + err.message);
      });
      return;
    }

    // Handle delete site button (use closest in case click is on button text)
    const deleteSiteBtn = e.target.closest('.delete-site-btn');
    if (deleteSiteBtn) {
      e.preventDefault();
      e.stopPropagation();
      const index = parseInt(deleteSiteBtn.getAttribute('data-site-index'));
      console.log('Delete site button clicked! Site index:', index, 'Button:', deleteSiteBtn);
      if (isNaN(index)) {
        console.error('Invalid site index:', deleteSiteBtn.getAttribute('data-site-index'));
        if (typeof alert === 'function') alert('Invalid site index. Please refresh the extension.');
        return;
      }
      deleteSite(index).catch(err => {
        console.error('Error in deleteSite:', err);
        if (typeof alert === 'function') alert('Error deleting site: ' + err.message);
      });
      return;
    }

    // Handle toggle slot
    if (e.target.classList.contains('slot-toggle')) {
      const index = parseInt(e.target.getAttribute('data-slot-index'));
      toggleSlot(index, e.target.checked);
    }

    // Handle toggle site
    if (e.target.classList.contains('site-toggle')) {
      const index = parseInt(e.target.getAttribute('data-site-index'));
      toggleSite(index, e.target.checked);
    }
  }, true); // Use capture phase to catch events earlier

  // Additional delegation scoped to lists to ensure reliability in popup context
  const slotsList = document.getElementById('slots-list');
  if (slotsList) {
    slotsList.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.delete-slot-btn');
      if (deleteBtn) {
        e.preventDefault();
        e.stopPropagation();
        const index = parseInt(deleteBtn.getAttribute('data-slot-index'));
        console.log('[slots-list] Delete slot clicked index:', index);
        if (isNaN(index)) {
          console.error('[slots-list] Invalid slot index attr:', deleteBtn.getAttribute('data-slot-index'));
          if (typeof alert === 'function') alert('Invalid slot index. Please refresh the extension.');
          return;
        }
        deleteSlot(index).catch(err => {
          console.error('[slots-list] Error in deleteSlot:', err);
          if (typeof alert === 'function') alert('Error deleting slot: ' + err.message);
        });
        return;
      }

      const editBtn = e.target.closest('.edit-slot-btn');
      if (editBtn) {
        e.preventDefault();
        e.stopPropagation();
        const index = parseInt(editBtn.getAttribute('data-slot-index'));
        console.log('[slots-list] Edit slot clicked index:', index);
        editSlot(index);
        return;
      }

      const toggle = e.target.closest('.slot-toggle');
      if (toggle) {
        const index = parseInt(toggle.getAttribute('data-slot-index'));
        console.log('[slots-list] Toggle slot clicked index:', index, 'checked:', toggle.checked);
        toggleSlot(index, toggle.checked);
      }
    });
  } else {
    console.warn('#slots-list not found at setup time');
  }

  const sitesList = document.getElementById('sites-list');
  if (sitesList) {
    sitesList.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.delete-site-btn');
      if (deleteBtn) {
        e.preventDefault();
        e.stopPropagation();
        const index = parseInt(deleteBtn.getAttribute('data-site-index'));
        console.log('[sites-list] Delete site clicked index:', index);
        if (isNaN(index)) {
          console.error('[sites-list] Invalid site index attr:', deleteBtn.getAttribute('data-site-index'));
          if (typeof alert === 'function') alert('Invalid site index. Please refresh the extension.');
          return;
        }
        deleteSite(index).catch(err => {
          console.error('[sites-list] Error in deleteSite:', err);
          if (typeof alert === 'function') alert('Error deleting site: ' + err.message);
        });
        return;
      }

      const toggle = e.target.closest('.site-toggle');
      if (toggle) {
        const index = parseInt(toggle.getAttribute('data-site-index'));
        console.log('[sites-list] Toggle site clicked index:', index, 'checked:', toggle.checked);
        toggleSite(index, toggle.checked);
      }
    });
  } else {
    console.warn('#sites-list not found at setup time');
  }
}

// Switch tabs
function switchTab(tabName) {
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `${tabName}-tab`);
  });
}

// Site modal functions
function openSiteModal(site = null, index = null) {
  currentEditingSiteIndex = index;
  const modal = document.getElementById('site-modal');
  const urlInput = document.getElementById('site-url');
  const enabledInput = document.getElementById('site-enabled');

  if (site) {
    urlInput.value = site.url;
    enabledInput.checked = site.enabled;
  } else {
    urlInput.value = '';
    enabledInput.checked = true;
  }

  modal.classList.add('active');
  urlInput.focus();
}

function closeSiteModal() {
  document.getElementById('site-modal').classList.remove('active');
  currentEditingSiteIndex = null;
}

async function saveSite() {
  const url = document.getElementById('site-url').value.trim();
  const enabled = document.getElementById('site-enabled').checked;

  if (!url) {
    alert('Please enter a website URL');
    return;
  }

  // Clean up URL (remove http://, https://, www.)
  let cleanUrl = url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .toLowerCase();

  if (!cleanUrl || !cleanUrl.includes('.')) {
    alert('Please enter a valid website URL (e.g., example.com)');
    return;
  }

  const data = await chrome.storage.sync.get(['blockedSites']);
  const sites = data.blockedSites || [];

  if (currentEditingSiteIndex !== null) {
    sites[currentEditingSiteIndex] = { url: cleanUrl, enabled };
  } else {
    // Check for duplicates
    if (sites.some(s => s.url === cleanUrl)) {
      alert('This website is already in your blocked list');
      return;
    }
    sites.push({ url: cleanUrl, enabled });
  }

  await chrome.storage.sync.set({ blockedSites: sites });
  await loadSites();
  closeSiteModal();
}

// Slot modal functions
function openSlotModal(slot = null, index = null) {
  console.log('openSlotModal called with:', { slot, index });
  currentEditingSlotIndex = index;
  const modal = document.getElementById('slot-modal');
  if (!modal) {
    console.error('Slot modal not found!');
    return;
  }

  const modalHeader = modal.querySelector('.modal-header h2');
  const nameInput = document.getElementById('slot-name');
  const startInput = document.getElementById('slot-start');
  const endInput = document.getElementById('slot-end');
  const enabledInput = document.getElementById('slot-enabled');
  const dayCheckboxes = document.querySelectorAll('#slot-modal .day-checkbox input');

  if (slot) {
    // Editing existing slot
    console.log('Editing slot:', slot);
    modalHeader.textContent = 'Edit Time Slot';
    nameInput.value = slot.name || '';
    startInput.value = slot.startTime;
    endInput.value = slot.endTime;
    enabledInput.checked = slot.enabled;

    dayCheckboxes.forEach(cb => {
      cb.checked = slot.days.includes(Number(cb.value));
    });
  } else {
    // Adding new slot
    modalHeader.textContent = 'Add Time Slot';
    nameInput.value = '';
    startInput.value = '09:00';
    endInput.value = '17:00';
    enabledInput.checked = true;
    dayCheckboxes.forEach(cb => cb.checked = false);
  }

  modal.classList.add('active');
  console.log('Modal should now be visible, class:', modal.className);

  // Force visibility check
  setTimeout(() => {
    const isVisible = modal.classList.contains('active');
    console.log('Modal visibility check:', isVisible, 'Display style:', window.getComputedStyle(modal).display);
    if (!isVisible) {
      console.error('Modal did not become visible!');
      modal.style.display = 'flex';
    }
  }, 100);

  // Focus on name input for better UX
  setTimeout(() => nameInput.focus(), 150);
}

function closeSlotModal() {
  document.getElementById('slot-modal').classList.remove('active');
  currentEditingSlotIndex = null;
}

async function saveSlot() {
  const name = document.getElementById('slot-name').value.trim();
  const startTime = document.getElementById('slot-start').value;
  const endTime = document.getElementById('slot-end').value;
  const enabled = document.getElementById('slot-enabled').checked;

  const selectedDays = Array.from(document.querySelectorAll('#slot-modal .day-checkbox input:checked'))
    .map(cb => Number(cb.value));

  if (!startTime || !endTime) {
    alert('Please enter start and end times');
    return;
  }

  const data = await chrome.storage.sync.get(['timeSlots']);
  const slots = data.timeSlots || [];

  const slot = {
    name: name || undefined,
    startTime,
    endTime,
    days: selectedDays,
    enabled
  };

  if (currentEditingSlotIndex !== null) {
    slots[currentEditingSlotIndex] = slot;
  } else {
    slots.push(slot);
  }

  await chrome.storage.sync.set({ timeSlots: slots });
  await loadSlots();
  closeSlotModal();
}

// Toggle site enabled/disabled
async function toggleSite(index, enabled) {
  const data = await chrome.storage.sync.get(['blockedSites']);
  const sites = data.blockedSites || [];
  sites[index].enabled = enabled;
  await chrome.storage.sync.set({ blockedSites: sites });
  await loadSites();
}

// Toggle slot enabled/disabled
async function toggleSlot(index, enabled) {
  const data = await chrome.storage.sync.get(['timeSlots']);
  const slots = data.timeSlots || [];
  slots[index].enabled = enabled;
  await chrome.storage.sync.set({ timeSlots: slots });
  await loadSlots();
  // Force re-check of all tabs when slot is toggled
  // The storage listener will handle this, but we ensure it happens
}

// Delete site
async function deleteSite(index) {
  console.log('deleteSite called with index:', index);

  if (index === undefined || index === null || isNaN(index)) {
    console.error('Invalid index provided to deleteSite:', index);
    if (typeof alert === 'function') alert('Error: Invalid site index');
    return;
  }

  let proceed = true;
  try {
    if (typeof confirm === 'function') {
      const res = confirm('Remove this website from the blocked list?');
      // Treat undefined (e.g., dialogs suppressed) as confirmation to avoid silent no-ops
      proceed = res !== false;
    }
  } catch (e) {
    proceed = true;
  }
  if (!proceed) {
    console.log('User cancelled site deletion');
    return;
  }

  try {
    const data = await chrome.storage.sync.get(['blockedSites']);
    const sites = data.blockedSites || [];
    if (index >= sites.length || index < 0) {
      console.error('Index out of bounds for deleteSite:', index, 'Sites length:', sites.length);
      if (typeof alert === 'function') alert('Error: Website not found');
      return;
    }
    sites.splice(index, 1);
    await chrome.storage.sync.set({ blockedSites: sites });
    await loadSites();
    console.log('Site deleted successfully');
  } catch (error) {
    console.error('Error deleting site:', error);
    if (typeof alert === 'function') alert('Error deleting website. Please try again.');
  }
}

// Edit slot
async function editSlot(index) {
  console.log('editSlot called with index:', index);
  try {
    const data = await chrome.storage.sync.get(['timeSlots']);
    const slots = data.timeSlots || [];
    console.log('Slots found:', slots.length, 'Looking for index:', index);

    if (slots[index] !== undefined) {
      console.log('Opening modal for slot:', slots[index]);
      // Create a copy of the slot to avoid reference issues
      const slotCopy = {
        name: slots[index].name || '',
        startTime: slots[index].startTime || '09:00',
        endTime: slots[index].endTime || '17:00',
        days: slots[index].days ? [...slots[index].days] : [],
        enabled: slots[index].enabled !== undefined ? slots[index].enabled : true
      };
      openSlotModal(slotCopy, index);
    } else {
      console.error('Slot not found at index:', index, 'Available slots:', slots);
      alert('Slot not found. Please refresh the extension.');
    }
  } catch (error) {
    console.error('Error in editSlot:', error);
    alert('Error loading slot. Please try again.');
  }
}

// Delete slot
async function deleteSlot(index) {
  console.log('deleteSlot called with index:', index);

  if (index === undefined || index === null || isNaN(index)) {
    console.error('Invalid index provided to deleteSlot:', index);
    alert('Error: Invalid slot index');
    return;
  }

  let proceed = true;
  try {
    if (typeof confirm === 'function') {
      const res = confirm('Are you sure you want to delete this time slot?');
      // Treat undefined (e.g., dialogs suppressed) as confirmation to avoid silent no-ops
      proceed = res !== false;
    }
  } catch (e) {
    proceed = true;
  }
  if (!proceed) {
    console.log('User cancelled deletion');
    return;
  }

  try {
    const data = await chrome.storage.sync.get(['timeSlots']);
    const slots = data.timeSlots || [];
    console.log('Current slots before delete:', slots.length);

    if (index >= slots.length || index < 0) {
      console.error('Index out of bounds:', index, 'Slots length:', slots.length);
      alert('Error: Slot not found');
      return;
    }

    slots.splice(index, 1);
    console.log('Slots after delete:', slots.length);

    await chrome.storage.sync.set({ timeSlots: slots });
    await loadSlots();
    console.log('Slot deleted successfully');
  } catch (error) {
    console.error('Error deleting slot:', error);
    alert('Error deleting slot. Please try again.');
  }
}

// Utility function
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Make functions globally accessible for inline event handlers
window.toggleSite = toggleSite;
window.toggleSlot = toggleSlot;
window.deleteSite = deleteSite;
window.deleteSlot = deleteSlot;
window.editSlot = editSlot;

// Initialize on load
document.addEventListener('DOMContentLoaded', init);

