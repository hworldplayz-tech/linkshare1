// Fake WhatsApp Screenshot Tool
// Author: Agent Mode

(function () {
  const el = (id) => document.getElementById(id);

  // Inputs
  const contactNameInput = el('contactName');
  const contactStatusInput = el('contactStatus');
  const profilePicInput = el('profilePic');
  const batteryLevelInput = el('batteryLevel');
  const timeDisplayInput = el('timeDisplay');
  const carrierSignals1Input = el('carrierSignals1');
  const carrierSignals2Input = el('carrierSignals2');
  const wifiEnabledInput = el('wifiEnabled');
  const headerIconSizeInput = el('headerIconSize');

  const messageTypeInput = el('messageType');
  const messageTextInput = el('messageText');
  const messageTimeInput = el('messageTime');
  const messageStatusInput = el('messageStatus');
  const addMessageBtn = el('addMessage');
  const clearMessagesBtn = el('clearMessages');
  const generateBtn = el('generateScreenshot');

  // Preview elements
  const displayContactName = el('displayContactName');
  const displayContactStatus = el('displayContactStatus');
  const contactAvatar = el('contactAvatar');
  const messagesContainer = el('messagesContainer');
  const displayTime = el('displayTime');
  const batteryPercent = el('batteryPercent');
  const batteryFill = el('batteryFill');
  const batteryDisplay = el('batteryDisplay');
  const carrierSignalsDisplay = el('carrierSignalsDisplay');
  const wifiIconDisplay = el('wifiIconDisplay');
  const phoneScreen = el('phoneScreen');
  const chatHeaderRight = document.querySelector('.chat-header-right');
  const backArrow = document.querySelector('.back-arrow');

  // Helpers
  function createMessageBubble(type, text, time, status = 'seen') {
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${type}`;

    const content = document.createElement('div');
    content.className = 'message-content-bubble';
    content.textContent = text || '';

    const metaEl = document.createElement('div');
    metaEl.className = 'message-meta';
    
    // Format time as 12-hour format
    const formattedTime = formatTime(time);
    
    // Add ticks for sent messages
    if (type === 'sent') {
      const ticksSpan = document.createElement('span');
      ticksSpan.className = 'ticks';
      
      switch (status) {
        case 'sent':
          ticksSpan.innerHTML = '✓';
          ticksSpan.style.color = '#667781';
          break;
        case 'delivered':
          ticksSpan.innerHTML = '✓✓';
          ticksSpan.style.color = '#667781';
          break;
        case 'seen':
          ticksSpan.innerHTML = '✓✓';
          ticksSpan.style.color = '#53bdeb';
          break;
        default:
          ticksSpan.innerHTML = '';
      }
      
      metaEl.innerHTML = `${formattedTime} `;
      metaEl.appendChild(ticksSpan);
    } else {
      metaEl.textContent = formattedTime;
    }

    bubble.appendChild(content);
    bubble.appendChild(metaEl);

    return bubble;
  }

  function formatTime(timeStr) {
    if (!timeStr) return '';
    
    // Handle both HH:MM and H:MM formats
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  function addMessageToList(type, text, time, status = 'seen') {
    const list = document.getElementById('messagesList');
    const item = document.createElement('div');
    item.className = `message-item ${type}`;

    const content = document.createElement('div');
    content.className = 'message-content';

    const textEl = document.createElement('div');
    textEl.className = 'message-text';
    textEl.textContent = text;

    const timeEl = document.createElement('div');
    timeEl.className = 'message-time';
    timeEl.textContent = time;

    content.appendChild(textEl);
    content.appendChild(timeEl);

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-message';
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.title = 'Edit message';

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-message';
    delBtn.innerHTML = '<i class="fas fa-trash"></i>';
    delBtn.title = 'Delete message';

    // Edit form with time editing
    const editForm = document.createElement('div');
    editForm.className = 'message-edit-form';
    editForm.innerHTML = `
      <div class="edit-inputs">
        <input type="text" value="${text}" class="edit-text" placeholder="Message text">
        <input type="time" value="${time.replace(/\s?(AM|PM)/i, '')}" class="edit-time" title="Message time">
      </div>
      <div class="edit-buttons">
        <button type="button" class="save">Save</button>
        <button type="button" class="cancel">Cancel</button>
      </div>
    `;

    editBtn.addEventListener('click', () => {
      editForm.classList.add('active');
      editForm.querySelector('.edit-text').focus();
    });

    editForm.querySelector('.cancel').addEventListener('click', () => {
      editForm.classList.remove('active');
    });

    editForm.querySelector('.save').addEventListener('click', () => {
      const newText = editForm.querySelector('.edit-text').value.trim();
      const newTime = editForm.querySelector('.edit-time').value;
      
      if (newText) {
        textEl.textContent = newText;
        const formattedTime = formatTime(newTime);
        timeEl.textContent = formattedTime;
        
        // Update preview bubble
        const idx = Array.from(list.children).indexOf(item);
        const bubbles = messagesContainer.querySelectorAll('.message-bubble');
        if (bubbles[idx]) {
          const bubbleContent = bubbles[idx].querySelector('.message-content-bubble');
          const bubbleTime = bubbles[idx].querySelector('.message-meta');
          if (bubbleContent) bubbleContent.textContent = newText;
          if (bubbleTime) bubbleTime.innerHTML = bubbleTime.innerHTML.replace(/\d{1,2}:\d{2}\s?(AM|PM)/i, formattedTime);
        }
        
        editForm.classList.remove('active');
        saveToLocalStorage(); // Save changes
      }
    });

    delBtn.addEventListener('click', () => {
      // remove from preview as well
      const idx = Array.from(list.children).indexOf(item);
      const bubbles = messagesContainer.querySelectorAll('.message-bubble');
      if (bubbles[idx]) bubbles[idx].remove();
      item.remove();
      saveToLocalStorage(); // Save after deletion
    });

    const buttonGroup = document.createElement('div');
    buttonGroup.style.display = 'flex';
    buttonGroup.style.gap = '5px';
    buttonGroup.appendChild(editBtn);
    buttonGroup.appendChild(delBtn);

    item.appendChild(content);
    item.appendChild(buttonGroup);
    item.appendChild(editForm);

    list.appendChild(item);
  }

  function syncHeader() {
    displayContactName.textContent = contactNameInput.value || 'John Doe';

    const statusMap = {
      'online': 'Online',
      'last-seen': 'Last seen recently',
      'typing': 'typing…'
    };
    displayContactStatus.textContent = statusMap[contactStatusInput.value] || 'Online';

    const url = profilePicInput.value.trim();
    contactAvatar.innerHTML = '';
    if (url) {
      const img = document.createElement('img');
      img.src = url;
      img.alt = 'avatar';
      img.onerror = () => {
        contactAvatar.innerHTML = '<i class="fas fa-user"></i>';
      };
      contactAvatar.appendChild(img);
    } else {
      contactAvatar.innerHTML = '<i class="fas fa-user"></i>';
    }
  }

  function syncStatusBar() {
    const time = timeDisplayInput.value || '19:30';
    const formattedTime = formatTime(time);
    displayTime.textContent = formattedTime;

    let level = parseInt(batteryLevelInput.value, 10);
    if (isNaN(level) || level < 0) level = 0;
    if (level > 100) level = 100;
    
    // Update battery percentage text
    batteryPercent.textContent = level + '%';
    
    // Update battery fill bar based on percentage
    if (batteryFill) {
      const fillWidth = Math.max(2, (level / 100) * 20); // Min 2px, max 20px (full width)
      batteryFill.style.width = fillWidth + 'px';
    }
    
    // Add low-battery class if ≤20%
    if (batteryDisplay) {
      if (level <= 20) {
        batteryDisplay.classList.add('low-battery');
      } else {
        batteryDisplay.classList.remove('low-battery');
      }
    }
  }

  function syncCarrierSignals() {
    const isOneCarrier = carrierSignals1Input.checked;
    if (carrierSignalsDisplay) {
      if (isOneCarrier) {
        carrierSignalsDisplay.classList.add('single-carrier');
      } else {
        carrierSignalsDisplay.classList.remove('single-carrier');
      }
    }
  }

  function syncWifiIcon() {
    const isWifiEnabled = wifiEnabledInput.checked;
    if (wifiIconDisplay) {
      if (isWifiEnabled) {
        wifiIconDisplay.classList.remove('hidden');
      } else {
        wifiIconDisplay.classList.add('hidden');
      }
    }
  }

  function syncHeaderIconSize() {
    const scale = headerIconSizeInput.value || 1.0;
    const rangeValue = document.querySelector('.range-value');
    if (rangeValue) rangeValue.textContent = scale + 'x';
    
    if (chatHeaderRight) {
      chatHeaderRight.style.fontSize = (0.9 * scale) + 'rem';
    }
    if (backArrow) {
      backArrow.style.fontSize = (1.0 * scale) + 'rem';
    }
    
    const contactAvatar = document.getElementById('contactAvatar');
    if (contactAvatar) {
      const size = Math.round(36 * scale);
      contactAvatar.style.width = size + 'px';
      contactAvatar.style.height = size + 'px';
      contactAvatar.style.fontSize = (1.0 * scale) + 'rem';
    }
  }

  function addMessage() {
    const type = messageTypeInput.value;
    const text = messageTextInput.value.trim();
    const time = messageTimeInput.value || '';
    const status = type === 'sent' ? messageStatusInput.value : 'none';

    if (!text) {
      messageTextInput.focus();
      return;
    }

    // Add to preview
    const bubble = createMessageBubble(type, text, time, status);
    messagesContainer.appendChild(bubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Add to list (editor)
    addMessageToList(type, text, time, status);

    // reset input
    messageTextInput.value = '';
  }

  function clearAll() {
    messagesContainer.innerHTML = '<div class="date-divider"><span>Today</span></div>';
    document.getElementById('messagesList').innerHTML = '';
  }

  async function generateScreenshot() {
    generateBtn.disabled = true;
    const originalText = generateBtn.innerHTML;
    generateBtn.innerHTML = '<span class="loading"></span> Generating...';
    
    try {
      // Clone phone screen content to hidden screenshot container
      const screenshotContainer = document.getElementById('screenshotContainer');
      const phoneScreenClone = phoneScreen.cloneNode(true);
      
      // Remove any IDs to avoid conflicts
      phoneScreenClone.removeAttribute('id');
      const allElements = phoneScreenClone.querySelectorAll('[id]');
      allElements.forEach(el => el.removeAttribute('id'));
      
      // Clear and append clone
      screenshotContainer.innerHTML = '';
      screenshotContainer.appendChild(phoneScreenClone);

      // Match container width
      const rect = phoneScreen.getBoundingClientRect();
      const width = Math.round(rect.width);
      
      // Temporarily make visible for accurate measurements
      screenshotContainer.style.visibility = 'visible';
      screenshotContainer.style.position = 'fixed';
      screenshotContainer.style.top = '0';
      screenshotContainer.style.left = '0';
      screenshotContainer.style.zIndex = '-1';
      screenshotContainer.style.width = width + 'px';
      
      // Get component references
      const statusBar = phoneScreenClone.querySelector('.status-bar');
      const chatHeader = phoneScreenClone.querySelector('.chat-header');
      const messageInput = phoneScreenClone.querySelector('.message-input');
      const messagesContainer = phoneScreenClone.querySelector('.messages-container');
      
      let contentHeight = Math.round(rect.height);
      
      // Calculate dimensions FIRST with mobile detection
      const originalHeight = Math.round(rect.height);
      const isMobile = window.innerWidth <= 768; // Mobile breakpoint from CSS
      const mobileInputHeight = isMobile ? 55 : 60; // Mobile input is 55px, desktop is 60px
      const inputHeight = messageInput ? messageInput.offsetHeight || mobileInputHeight : mobileInputHeight;
      
      console.log('Device type:', isMobile ? 'Mobile' : 'Desktop');
      console.log('Expected input height:', mobileInputHeight);
      
      if (messagesContainer) {
        // Get original scroll position BEFORE any modifications
        const originalMessagesContainer = phoneScreen.querySelector('.messages-container');
        const currentScrollTop = originalMessagesContainer.scrollTop;
        
        // Simple approach: Ensure input is visible and positioned correctly
        if (messageInput) {
          console.log('Found message input, applying styles...');
          
          // Simple, clean approach - same as working desktop
          messageInput.style.position = 'static';
          messageInput.style.display = 'flex';
          messageInput.style.visibility = 'visible';
          messageInput.style.opacity = '1';
          messageInput.style.width = '100%';
          messageInput.style.height = inputHeight + 'px';
          messageInput.style.minHeight = inputHeight + 'px';
          messageInput.style.background = '#f0f2f6';
          messageInput.style.padding = isMobile ? '6px 10px' : '8px 12px';
          messageInput.style.borderTop = 'none';
          messageInput.style.flexShrink = '0';
          messageInput.style.alignItems = 'center';
          messageInput.style.justifyContent = 'space-between';
          
          console.log('Input styled for', isMobile ? 'mobile' : 'desktop');
        }
        
        // DIFFERENT HEIGHT CALCULATION FOR MOBILE vs DESKTOP
        if (isMobile) {
          // MOBILE: Add input height + small buffer to ensure complete input is visible
          contentHeight = originalHeight + inputHeight + 20; // Input + 20px buffer for complete visibility
          console.log('Mobile: Using larger height for capture:', contentHeight);
        } else {
          // DESKTOP: Use original height (working fine)
          contentHeight = originalHeight;
          console.log('Desktop: Using original height:', contentHeight);
        }
        
        // Adjust messages container to make room for input (precise calculation)
        const statusBarHeight = statusBar?.offsetHeight || 0;
        const headerHeight = chatHeader?.offsetHeight || 0;
        const availableMessagesHeight = contentHeight - statusBarHeight - headerHeight - inputHeight;
        
        console.log('Height breakdown:', {
          total: contentHeight,
          statusBar: statusBarHeight,
          header: headerHeight,
          input: inputHeight,
          messages: availableMessagesHeight
        });
        messagesContainer.style.height = availableMessagesHeight + 'px';
        messagesContainer.style.maxHeight = availableMessagesHeight + 'px';
        messagesContainer.style.overflow = 'hidden';
        messagesContainer.style.paddingTop = '15px';
        messagesContainer.style.paddingRight = '15px';
        messagesContainer.style.paddingLeft = '15px';
        messagesContainer.style.paddingBottom = '15px';
        messagesContainer.style.boxSizing = 'border-box';
        
        // Force reflow and wait for rendering
        phoneScreenClone.offsetHeight;
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Apply the EXACT scroll position from original AFTER everything is set up
        console.log('Original scroll position:', currentScrollTop);
        messagesContainer.scrollTop = currentScrollTop;
        console.log('Applied scroll position:', messagesContainer.scrollTop);
        
        // Force another reflow after scroll
        messagesContainer.offsetHeight;
        
        console.log('Original height:', originalHeight);
        console.log('Input height:', inputHeight);
        console.log('Messages height adjusted to:', availableMessagesHeight);
        console.log('Final content height:', contentHeight);
      }
        
      
      // Set container dimensions with mobile consideration
      screenshotContainer.style.height = contentHeight + 'px';
      phoneScreenClone.style.height = contentHeight + 'px';
      phoneScreenClone.style.minHeight = contentHeight + 'px';
      phoneScreenClone.style.display = 'flex';
      phoneScreenClone.style.flexDirection = 'column';
      phoneScreenClone.style.position = 'relative';
      phoneScreenClone.style.overflow = 'visible'; // Allow overflow for mobile
      
      console.log('Container height set to:', contentHeight);
      

      // Final reflow
      screenshotContainer.offsetHeight;
      phoneScreenClone.offsetHeight;

      // Wait a moment for final layout
      await new Promise(resolve => setTimeout(resolve, 120));
      
      // DON'T override scroll position - keep the user's current scroll position
      
      const deviceScale = Math.min(4, Math.max(2, (window.devicePixelRatio || 2) * 2));
      
      // Ensure capture area includes the input div end
      const inputInContainer = screenshotContainer.querySelector('.message-input');
      if (!inputInContainer) {
        console.warn('Input not found in container before capture.');
      }
      
      console.log('Capturing with dimensions:', width, 'x', contentHeight);
      
      const canvas = await html2canvas(screenshotContainer, {
        backgroundColor: '#ffffff',
        scale: deviceScale,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: width,
        height: contentHeight, // Exact height - no extra buffer
        scrollX: 0,
        scrollY: 0,
        windowWidth: width,
        windowHeight: contentHeight,
        imageTimeout: 5000,
        removeContainer: false,
        onclone: function(clonedDoc, element) {
          // Simple onclone - just ensure input visibility
          const clonedInput = element.querySelector('.message-input');
          if (clonedInput) {
            clonedInput.style.display = 'flex';
            clonedInput.style.visibility = 'visible';
            clonedInput.style.position = 'static';
            clonedInput.style.opacity = '1';
            console.log('Input ensured visible in clone');
          }
        }
      });
      
      // Hide container again
      screenshotContainer.style.visibility = 'hidden';
      screenshotContainer.style.position = 'absolute';
      screenshotContainer.style.top = '-9999px';
      screenshotContainer.style.left = '-9999px';
      screenshotContainer.style.zIndex = 'auto';
      
      const dataURL = canvas.toDataURL('image/png', 1.0); // Maximum quality

      // Save to history
      saveScreenshotHistory(dataURL);
      
      // Download
      const link = document.createElement('a');
      link.href = dataURL;
      const safeName = (displayContactName.textContent || 'whatsapp').replace(/[^a-z0-9-_]+/gi, '_');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      link.download = `whatsapp_${safeName}_${timestamp}.png`;
      link.click();
      
      // Show success message
      showSuccessMessage('Borderless screenshot generated!');
      
    } catch (e) {
      alert('Failed to generate screenshot. Please try again.');
      console.error('Screenshot error:', e);
    } finally {
      generateBtn.disabled = false;
      generateBtn.innerHTML = originalText;
    }
  }
  
  function showSuccessMessage(text) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = text;
    successDiv.style.display = 'block';
    
    const actionButtons = document.querySelector('.action-buttons');
    actionButtons.appendChild(successDiv);
    
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.parentNode.removeChild(successDiv);
      }
    }, 3000);
  }

  // Event bindings with auto-save
  contactNameInput.addEventListener('input', () => { syncHeader(); saveToLocalStorage(); });
  contactStatusInput.addEventListener('change', () => { syncHeader(); saveToLocalStorage(); });
  profilePicInput.addEventListener('input', () => { syncHeader(); saveToLocalStorage(); });

  batteryLevelInput.addEventListener('input', () => { syncStatusBar(); saveToLocalStorage(); });
  timeDisplayInput.addEventListener('input', () => { syncStatusBar(); saveToLocalStorage(); });
  headerIconSizeInput.addEventListener('input', () => { syncHeaderIconSize(); saveToLocalStorage(); });
  carrierSignals1Input.addEventListener('change', () => { syncCarrierSignals(); saveToLocalStorage(); });
  carrierSignals2Input.addEventListener('change', () => { syncCarrierSignals(); saveToLocalStorage(); });
  wifiEnabledInput.addEventListener('change', () => { syncWifiIcon(); saveToLocalStorage(); });

  addMessageBtn.addEventListener('click', () => { addMessage(); saveToLocalStorage(); });
  messageTextInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { 
      addMessage(); 
      saveToLocalStorage(); 
    }
  });

  clearMessagesBtn.addEventListener('click', () => { 
    clearAll(); 
    saveToLocalStorage(); 
  });
  generateBtn.addEventListener('click', generateScreenshot);

  // Local Storage Functions
  function saveToLocalStorage() {
    const messages = [];
    const messageItems = document.querySelectorAll('.message-item');
    
    messageItems.forEach(item => {
      const type = item.classList.contains('sent') ? 'sent' : 'received';
      const text = item.querySelector('.message-text').textContent;
      const time = item.querySelector('.message-time').textContent;
      // Get status from the actual message (if sent)
      const status = type === 'sent' ? 'seen' : 'none'; // Default for now
      messages.push({ type, text, time, status });
    });
    
    const chatData = {
      messages,
      contactName: contactNameInput.value,
      contactStatus: contactStatusInput.value,
      profilePic: profilePicInput.value,
      batteryLevel: batteryLevelInput.value,
      timeDisplay: timeDisplayInput.value,
      carrierSignals: carrierSignals1Input.checked ? '1' : '2',
      wifiEnabled: wifiEnabledInput.checked,
      headerIconSize: headerIconSizeInput.value
    };
    
    localStorage.setItem('whatsappChatData', JSON.stringify(chatData));
  }
  
  function loadFromLocalStorage() {
    const savedData = localStorage.getItem('whatsappChatData');
    if (savedData) {
      const chatData = JSON.parse(savedData);
      
      // Load form data
      contactNameInput.value = chatData.contactName || 'John Doe';
      contactStatusInput.value = chatData.contactStatus || 'online';
      profilePicInput.value = chatData.profilePic || '';
      batteryLevelInput.value = chatData.batteryLevel || 85;
      timeDisplayInput.value = chatData.timeDisplay || '19:30';
      
      // Load carrier signals (default to 2 carriers)
      const carrierSignalCount = chatData.carrierSignals || '2';
      if (carrierSignalCount === '1') {
        carrierSignals1Input.checked = true;
      } else {
        carrierSignals2Input.checked = true;
      }
      
      // Load WiFi setting (default to enabled)
      wifiEnabledInput.checked = chatData.wifiEnabled !== undefined ? chatData.wifiEnabled : true;
      
      headerIconSizeInput.value = chatData.headerIconSize || 1.0;
      
      // Load messages
      chatData.messages.forEach(m => {
        const b = createMessageBubble(m.type, m.text, m.time, m.status || 'seen');
        messagesContainer.appendChild(b);
        addMessageToList(m.type, m.text, m.time, m.status || 'seen');
      });
      
      // Sync UI
      syncHeader();
      syncStatusBar();
      syncCarrierSignals();
      syncWifiIcon();
      syncHeaderIconSize();
    }
  }
  
  function saveScreenshotHistory(dataURL) {
    const screenshots = JSON.parse(localStorage.getItem('whatsappScreenshots') || '[]');
    const screenshot = {
      id: Date.now(),
      dataURL,
      contactName: displayContactName.textContent,
      timestamp: new Date().toISOString(),
      messageCount: messagesContainer.querySelectorAll('.message-bubble').length
    };
    
    screenshots.unshift(screenshot); // Add to beginning
    if (screenshots.length > 10) screenshots.pop(); // Keep only 10 recent
    
    localStorage.setItem('whatsappScreenshots', JSON.stringify(screenshots));
  }

  // Initialize with saved data or sample conversation
  function init() {
    syncHeader();
    syncStatusBar();
    syncCarrierSignals();
    syncWifiIcon();
    syncHeaderIconSize();
    
    // Try to load saved data first
    loadFromLocalStorage();
    
    // If no saved data, load sample
    if (messagesContainer.querySelectorAll('.message-bubble').length === 1) { // Only date divider
      const samples = [
        { type: 'sent', text: 'Hello, how are you doing today', time: '14:29', status: 'seen' }
      ];
      samples.forEach(m => {
        const b = createMessageBubble(m.type, m.text, m.time, m.status || 'seen');
        messagesContainer.appendChild(b);
        addMessageToList(m.type, m.text, m.time, m.status || 'seen');
      });
    }
  }

  init();
})();

