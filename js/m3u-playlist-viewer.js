  // Store all channels for filtering
  let allChannels = [];
    
  // Create an index for faster searching
  let channelNameIndex = {};
  let channelGroupIndex = {};
  let channelCountryIndex = {};
  
  async function handlePlaylist() {
    const url = document.getElementById('m3uUrl').value;
    const file = document.getElementById('fileInput').files[0];

    if (!url && !file) {
      alert('Please enter a URL or upload a file');
      return;
    }
    
    document.getElementById('results').innerHTML = '<p class="loading">Loading playlist...</p>';
    
    try {
      let content;
      
      if (url) {
        // Fetch content from URL
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }
        content = await response.text();
      } else {
        // Read content from file
        content = await readFileContent(file);
      }
      
      // Process the M3U content
      processM3U(content);
      
      // Clear the input fields after successful processing
      document.getElementById('m3uUrl').value = '';
      document.getElementById('fileInput').value = '';
      
    } catch (error) {
      console.error('Error:', error);
      document.getElementById('results').innerHTML = `<p class="error">Error: ${error.message}</p>`;
    }
  }

  // Function to read file content
  function readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }

  function processM3U(content) {
    const lines = content.split(/\r?\n/);
    const results = document.getElementById('results');
    results.innerHTML = '';
    let count = 0;
    let allContent = "#EXTM3U\n";
    allChannels = []; // Reset channels array

    // Debug info
    console.log("Total lines:", lines.length);
    
    // Use a more efficient approach for large playlists
    // Process in chunks to avoid UI freezing
    const chunkSize = 100; // Process 100 lines at a time
    let currentLine = 0;
    
    function processChunk() {
      const startTime = performance.now();
      
      // Process a chunk of lines
      while (currentLine < lines.length && performance.now() - startTime < 50) {
        if (lines[currentLine].startsWith('#EXTINF')) {
          // Make sure we have a URL line after the #EXTINF line
          if (currentLine + 1 < lines.length && !lines[currentLine + 1].startsWith('#')) {
            const extinf = lines[currentLine];
            const url = lines[currentLine + 1];
            
            // Improved regex pattern to handle different M3U formats
            let name = 'Unknown';
            let logo = '';
            let group = '';
            let country = '';
            
            // Try to extract channel name, logo and group - use more efficient regex
            const tvgNameMatch = extinf.match(/tvg-name="([^"]*)"/);
            const tvgLogoMatch = extinf.match(/tvg-logo="([^"]*)"/);
            const groupMatch = extinf.match(/group-title="([^"]*)"/);
            const nameMatch = extinf.match(/,(.+)$/);
            const countryMatch = extinf.match(/tvg-country="([^"]*)"/);
            
            if (tvgNameMatch) {
              name = tvgNameMatch[1] || 'Unknown';
            }
            
            if (tvgLogoMatch) {
              logo = tvgLogoMatch[1] || '';
            }
            
            if (groupMatch) {
              group = groupMatch[1] || '';
            } else {
              // Try alternative format for group-title
              const altGroupMatch = extinf.match(/group-title=([^,]*),/);
              if (altGroupMatch && altGroupMatch[1]) {
                group = altGroupMatch[1].replace(/"/g, '').trim();
              }
            }
            
            if (countryMatch) {
              country = countryMatch[1] || '';
            }
            
            if (nameMatch && nameMatch[1].trim() && name === 'Unknown') {
              name = nameMatch[1].trim();
            }
            
            // Store channel for filtering - only store what we need
            allChannels.push({
              name,
              logo,
              group,
              country,
              extinf,
              url
            });
            
            count++;
            allContent += `${extinf}\n${url}\n`;
            
            // Skip the URL line
            currentLine++;
          }
        }
        currentLine++;
      }
      
      // Update progress
      const progress = Math.min(100, Math.round((currentLine / lines.length) * 100));
      results.innerHTML = `<p class="loading">Processing playlist... ${progress}%</p>`;
      
      // Continue processing or finish
      if (currentLine < lines.length) {
        setTimeout(processChunk, 0); // Allow UI to update
      } else {
        // Finished processing
        document.getElementById('channelCount').innerText = `Count/Total: ${count}`;
        window.allM3UContent = allContent;
        
        // Build search index for faster filtering
        buildSearchIndex();
        
        if (count === 0) {
          results.innerHTML = '<p class="no-results">No channels found. Please check if the file is a valid M3U/M3U8 playlist.</p>';
        } else {
          // For large playlists, only display the first 500 initially
          const initialDisplay = allChannels.length > 500 ? allChannels.slice(0, 500) : allChannels;
          displayChannels(initialDisplay);
          
          if (allChannels.length > 500) {
            results.insertAdjacentHTML('beforeend', 
              `<div class="load-more">
                <p>Showing 500 of ${allChannels.length} channels. Use search to find specific channels or</p>
                <button onclick="loadMoreChannels()">Load More Channels</button>
              </div>`
            );
          }
          
          // Populate country dropdown
          populateCountryDropdown();
          
          // Populate group dropdown
          populateGroupDropdown();
        }
      }
    }
    
    // Start processing
    processChunk();
  }
  
  function buildSearchIndex() {
    channelNameIndex = {};
    channelGroupIndex = {};
    channelCountryIndex = {};
    
    // Build index for faster searching
    allChannels.forEach((channel, index) => {
      // Index channel names (lowercase for case-insensitive search)
      const nameLower = channel.name.toLowerCase();
      for (let i = 0; i < nameLower.length - 2; i++) {
        const trigram = nameLower.substring(i, i + 3);
        if (!channelNameIndex[trigram]) {
          channelNameIndex[trigram] = [];
        }
        channelNameIndex[trigram].push(index);
      }
      
      // Index channel groups if they exist
      if (channel.group) {
        const groupLower = channel.group.toLowerCase();
        for (let i = 0; i < groupLower.length - 2; i++) {
          const trigram = groupLower.substring(i, i + 3);
          if (!channelGroupIndex[trigram]) {
            channelGroupIndex[trigram] = [];
          }
          channelGroupIndex[trigram].push(index);
        }
      }
      
      // Index channel countries if they exist
      if (channel.country) {
        const countryLower = channel.country.toLowerCase();
        for (let i = 0; i < countryLower.length - 2; i++) {
          const trigram = countryLower.substring(i, i + 3);
          if (!channelCountryIndex[trigram]) {
            channelCountryIndex[trigram] = [];
          }
          channelCountryIndex[trigram].push(index);
        }
      }
    });
    
    // Debug log for groups
    console.log("Groups found:", Array.from(new Set(allChannels.map(c => c.group))).filter(Boolean));
  }
  
  // Variable to track how many channels are currently displayed
  let displayedChannelsCount = 500;
  
  function loadMoreChannels() {
    const nextBatch = allChannels.slice(displayedChannelsCount, displayedChannelsCount + 500);
    const loadMoreButton = document.querySelector('.load-more');
    
    if (nextBatch.length > 0) {
      // Append channels to existing list
      appendChannels(nextBatch);
      displayedChannelsCount += nextBatch.length;
      
      // Update load more button
      if (displayedChannelsCount >= allChannels.length) {
        loadMoreButton.remove();
      } else {
        loadMoreButton.querySelector('p').textContent = 
          `Showing ${displayedChannelsCount} of ${allChannels.length} channels. Use search to find specific channels or`;
      }
    }
  }
  
  function displayChannels(channels) {
    const results = document.getElementById('results');
    results.innerHTML = '';
    displayedChannelsCount = channels.length;
    
    if (channels.length === 0) {
      results.innerHTML = '<p class="no-results">No channels match your search</p>';
      return;
    }
    
    // Create a document fragment for better performance
    const fragment = document.createDocumentFragment();
    
    channels.forEach(channel => {
      const channelElement = createChannelElement(channel);
      fragment.appendChild(channelElement);
    });
    
    results.appendChild(fragment);
  }
  
  function appendChannels(channels) {
    const results = document.getElementById('results');
    const loadMoreButton = document.querySelector('.load-more');
    
    // Create a document fragment for better performance
    const fragment = document.createDocumentFragment();
    
    channels.forEach(channel => {
      const channelElement = createChannelElement(channel);
      fragment.appendChild(channelElement);
    });
    
    // Insert before the load more button
    if (loadMoreButton) {
      results.insertBefore(fragment, loadMoreButton);
    } else {
      results.appendChild(fragment);
    }
  }
  
  function createChannelElement(channel) {
    // Escape special characters for HTML and JavaScript
    const safeExtinf = channel.extinf.replace(/"/g, '&quot;');
    const safeUrl = channel.url.replace(/"/g, '&quot;');
    
    const channelElement = document.createElement('div');
    channelElement.className = 'channel';
    
    // Add data attributes for filtering
    if (channel.group) channelElement.dataset.group = channel.group;
    if (channel.country) channelElement.dataset.country = channel.country;
    
    channelElement.innerHTML = `
      <div class="channel-header">
        <div class="channel-info">
          ${channel.logo ? `<img src="${channel.logo}" alt="logo" onerror="this.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAAA70lEQVRoge2ZMQ6CQBBFn8baA3gXj2Jn4UE8iqWVNQfwAHZWNJTG2D+bEIIF7OzOJvOSX0DC/vdmdpJNQAghhBBCCJFzAAbgDHSVuQEb4JUsvVJH4JnUz+kEbCvyH4BXpX5OB+BQkf8M9Cv1P2YHXAryb8Byov7XbIFzQf4TWEzUP8sKOGXyP8Byhn5RVkCfyf8Cq5n6H9kAp0z+G1jP2P+fDXDM5H+A7cz9f1kDh0z+F9gV9v9mCewz+T2wL+z/YQHsMvl3oCvs/2ZekP8Cjv+oX5RnQf5TZX5xHhX5T5X5hRBCCCGEEEIIIcQkvABVQTQLQeC98QAAAABJRU5ErkJggg==';" />` : ''}
          <div class="channel-title">
            <strong>${channel.name}</strong>
            ${channel.group ? `<span class="channel-group">${channel.group}</span>` : ''}
            ${channel.country ? `<span class="channel-country">${channel.country}</span>` : ''}
          </div>
        </div>
        <button class="small-btn copy-channel-btn" onclick="copyText('${safeExtinf}\\n${safeUrl}', this)" title="Copy Channel Info">
          <i class="copy-icon">📋</i> Copy Channel
        </button>
      </div>
      <div class="channel-url">
        <span class="url-text" title="${safeUrl}">${safeUrl}</span>
        <button class="small-btn copy-link-btn" onclick="copyText('${safeUrl}', this)" title="Copy URL">
          <i class="copy-icon">📋</i> Copy Link
        </button>
        <a href="${safeUrl}" target="_blank" class="small-btn test-btn" title="Test Stream">
          <i class="play-icon">▶️</i> Test
        </a>
      </div>
    `;
    
    return channelElement;
  }
  
  function filterChannels() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const sortOrder = document.getElementById('sortOrder').value;
    const countryFilter = document.getElementById('countryFilter').value;
    const groupFilter = document.getElementById('groupFilter').value;
    
    // Debug log for filtering
    console.log("Filtering with:", {
      searchTerm,
      sortOrder,
      countryFilter,
      groupFilter
    });
    
    // If search term is empty, show all channels
    if (searchTerm.trim() === '') {
      // For large playlists, only show first 500
      let filteredChannels = allChannels;
      
      // Apply country filter if selected
      if (countryFilter) {
        filteredChannels = filteredChannels.filter(channel => 
          channel.country && channel.country === countryFilter
        );
      }
      
      // Apply group filter if selected
      if (groupFilter) {
        filteredChannels = filteredChannels.filter(channel => 
          channel.group && channel.group === groupFilter
        );
        
        // Debug log
        console.log(`Filtered to ${filteredChannels.length} channels with group "${groupFilter}"`);
      }
      
      // Sort if needed
      if (sortOrder === 'nameAsc') {
        filteredChannels.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortOrder === 'nameDesc') {
        filteredChannels.sort((a, b) => b.name.localeCompare(a.name));
      }
      
      // Display channels (limited to 500 initially)
      const initialDisplay = filteredChannels.length > 500 ? filteredChannels.slice(0, 500) : filteredChannels;
      displayChannels(initialDisplay);
      
      // Add load more button if needed
      if (filteredChannels.length > 500) {
        document.getElementById('results').insertAdjacentHTML('beforeend', 
          `<div class="load-more">
            <p>Showing 500 of ${filteredChannels.length} channels. Use search to find specific channels or</p>
            <button onclick="loadMoreChannels()">Load More Channels</button>
          </div>`
        );
      }
      
      // Update count
      document.getElementById('channelCount').innerText = `Count/Total: ${filteredChannels.length}/${allChannels.length}`;
      return;
    }
    
    // For very short search terms (1-2 chars), use simple filtering
    if (searchTerm.length < 3) {
      performSimpleFiltering(searchTerm, sortOrder, countryFilter, groupFilter);
      return;
    }
    
    // For longer search terms, use the index for faster filtering
    performIndexedFiltering(searchTerm, sortOrder, countryFilter, groupFilter);
  }
  
  function performSimpleFiltering(searchTerm, sortOrder, countryFilter, groupFilter) {
    // Filter channels based on search term
    let filteredChannels = allChannels.filter(channel => 
      channel.name.toLowerCase().includes(searchTerm) || 
      (channel.group && channel.group.toLowerCase().includes(searchTerm)) ||
      (channel.country && channel.country.toLowerCase().includes(searchTerm))
    );
    
    // Apply country filter
    if (countryFilter) {
      filteredChannels = filteredChannels.filter(channel => 
        channel.country && channel.country === countryFilter
      );
    }
    
    // Apply group filter
    if (groupFilter) {
      filteredChannels = filteredChannels.filter(channel => 
        channel.group && channel.group === groupFilter
      );
      
      // Debug log for group filtering
      console.log(`Filtering by group: "${groupFilter}"`);
      console.log(`Channels found with this group: ${filteredChannels.length}`);
      if (filteredChannels.length === 0) {
        console.log("All groups available:", Array.from(new Set(allChannels.map(c => c.group))).filter(Boolean));
      }
    }
    
    finishFiltering(filteredChannels, sortOrder);
  }
  
  function performIndexedFiltering(searchTerm, sortOrder, countryFilter, groupFilter) {
    // Use the index for faster filtering
    const searchTermLower = searchTerm.toLowerCase();
    
    // Get trigrams from the search term
    const trigrams = [];
    for (let i = 0; i < searchTermLower.length - 2; i++) {
      trigrams.push(searchTermLower.substring(i, i + 3));
    }
    
    // Find channels that match any trigram in the name index
    const nameMatches = new Set();
    trigrams.forEach(trigram => {
      if (channelNameIndex[trigram]) {
        channelNameIndex[trigram].forEach(index => nameMatches.add(index));
      }
    });
    
    // Find channels that match any trigram in the group index
    const groupMatches = new Set();
    trigrams.forEach(trigram => {
      if (channelGroupIndex[trigram]) {
        channelGroupIndex[trigram].forEach(index => groupMatches.add(index));
      }
    });
    
    // Find channels that match any trigram in the country index
    const countryMatches = new Set();
    trigrams.forEach(trigram => {
      if (channelCountryIndex[trigram]) {
        channelCountryIndex[trigram].forEach(index => countryMatches.add(index));
      }
    });
    
    // Combine matches
    const potentialMatches = new Set([...nameMatches, ...groupMatches, ...countryMatches]);
    
    // Verify matches (to eliminate false positives)
    const filteredChannels = [];
    potentialMatches.forEach(index => {
      const channel = allChannels[index];
      if (channel.name.toLowerCase().includes(searchTermLower) || 
          (channel.group && channel.group.toLowerCase().includes(searchTermLower)) ||
          (channel.country && channel.country.toLowerCase().includes(searchTermLower))) {
        filteredChannels.push(channel);
      }
    });
    
    // Apply country filter
    let resultChannels = filteredChannels;
    if (countryFilter) {
      resultChannels = resultChannels.filter(channel => 
        channel.country && channel.country === countryFilter
      );
    }
    
    // Apply group filter
    if (groupFilter) {
      resultChannels = resultChannels.filter(channel => 
        channel.group && channel.group === groupFilter
      );
      
      // Debug log for group filtering
      console.log(`Filtering by group: "${groupFilter}"`);
      console.log(`Channels found with this group: ${resultChannels.length}`);
      if (resultChannels.length === 0) {
        console.log("All groups available:", Array.from(new Set(allChannels.map(c => c.group))).filter(Boolean));
      }
    }
    
    finishFiltering(resultChannels, sortOrder);
  }
  
  function finishFiltering(filteredChannels, sortOrder) {
    // Check if no channels found
    if (filteredChannels.length === 0) {
      document.getElementById('results').innerHTML = '<p class="no-results">No channels found matching your search. Try a different search term.</p>';
      document.getElementById('channelCount').innerText = `Count/Total: 0/${allChannels.length}`;
      return;
    }
    
    // Sort channels based on selected order
    if (sortOrder === 'nameAsc') {
      filteredChannels.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === 'nameDesc') {
      filteredChannels.sort((a, b) => b.name.localeCompare(a.name));
    }
    
    // For large result sets, only display the first 500
    const channelsToDisplay = filteredChannels.length > 500 ? filteredChannels.slice(0, 500) : filteredChannels;
    
    // Display filtered and sorted channels
    displayChannels(channelsToDisplay);
    
    // Add load more button if needed
    if (filteredChannels.length > 500) {
      document.getElementById('results').insertAdjacentHTML('beforeend', 
        `<div class="load-more">
          <p>Showing 500 of ${filteredChannels.length} channels. Use more specific search terms or</p>
          <button onclick="loadMoreChannels()">Load More Channels</button>
        </div>`
      );
    }
    
    // Update count
    document.getElementById('channelCount').innerText = `Count/Total: ${filteredChannels.length}/${allChannels.length}`;
  }
  
  function clearResults() {
    document.getElementById('results').innerHTML = '';
    document.getElementById('m3uUrl').value = '';
    document.getElementById('fileInput').value = '';
    document.getElementById('searchInput').value = '';
    document.getElementById('channelCount').innerText = 'Count/Total: 0';
    allChannels = [];
    window.allM3UContent = '';
  }

  function copyText(text, button) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          // Show "Copied" on the button that was clicked
          const originalText = button.innerHTML;
          button.innerHTML = '<i class="copy-icon">✓</i> Copied';
          
          // Restore original text after 2 seconds
          setTimeout(() => {
            button.innerHTML = originalText;
          }, 2000);
        })
        .catch(err => {
          fallbackCopyText(text, button);
        });
    } else {
      fallbackCopyText(text, button);
    }
  }
  
  function fallbackCopyText(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        // Show "Copied" on the button that was clicked
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="copy-icon">✓</i> Copied';
        
        // Restore original text after 2 seconds
        setTimeout(() => {
          button.innerHTML = originalText;
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
    
    document.body.removeChild(textArea);
  }
  
  function copyAll() {
    if (window.allM3UContent) {
      navigator.clipboard.writeText(window.allM3UContent)
        .then(() => {
          // Create a toast notification
          const toast = document.createElement('div');
          toast.className = 'copy-feedback';
          toast.textContent = 'Full playlist copied!';
          document.body.appendChild(toast);
          toast.classList.add('show');
          
          // Remove the toast after 2 seconds
          setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
              document.body.removeChild(toast);
            }, 300);
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          alert('Failed to copy. ' + err);
        });
    }
  }
  
  // Function to populate country dropdown
  function populateCountryDropdown() {
    const countryFilter = document.getElementById('countryFilter');
    
    // Clear existing options except the first one
    while (countryFilter.options.length > 1) {
      countryFilter.remove(1);
    }
    
    // Get unique countries from channels
    const countries = new Set();
    allChannels.forEach(channel => {
      if (channel.country && channel.country.trim() !== '') {
        countries.add(channel.country);
      }
    });
    
    // Convert to array and sort alphabetically
    const sortedCountries = Array.from(countries).sort();
    
    // Add top 20 countries at the top
    const topCountries = [
      'Pakistan', 'India', 'USA', 'UK', 'Canada', 'Australia', 
      'UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman',
      'Germany', 'France', 'Italy', 'Spain', 'Russia', 'China', 
      'Japan', 'South Korea', 'Turkey', 'Egypt', 'South Africa'
    ];
    
    // Track if we added any top countries
    let addedTopCountries = false;
    
    topCountries.forEach(country => {
      if (countries.has(country)) {
        addedTopCountries = true;
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
        countries.delete(country);
      }
    });
    
    // Add separator if we have top countries
    if (addedTopCountries) {
      const separator = document.createElement('option');
      separator.disabled = true;
      separator.textContent = '──────────';
      countryFilter.appendChild(separator);
    }
    
    // Add remaining countries
    sortedCountries.forEach(country => {
      const option = document.createElement('option');
      option.value = country;
      option.textContent = country;
      countryFilter.appendChild(option);
    });
  }
  
  // Function to populate group dropdown
  function populateGroupDropdown() {
    const groupFilter = document.getElementById('groupFilter');
    
    // Clear existing options except the first one
    while (groupFilter.options.length > 1) {
      groupFilter.remove(1);
    }
    
    // Get unique groups from channels
    const groups = new Set();
    allChannels.forEach(channel => {
      if (channel.group && channel.group.trim() !== '') {
        groups.add(channel.group);
      }
    });
    
    // Convert to array and sort alphabetically
    const sortedGroups = Array.from(groups).sort();
    
    // Log groups for debugging
    console.log("Populating group dropdown with groups:", sortedGroups);
    
    // Add groups
    sortedGroups.forEach(group => {
      const option = document.createElement('option');
      option.value = group;
      option.textContent = group;
      groupFilter.appendChild(option);
    });
  }