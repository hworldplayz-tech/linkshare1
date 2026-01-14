// Global variables
const POSTS_PER_PAGE = 18;
let lastDoc = null;
let isLastPage = false;
const groupContainer = document.querySelector(".groups-grid");
const loadMoreBtn = document.querySelector("#loadMoreBtn");
const searchInput = document.querySelector("#searchGroups");
let currentTopic = "all";
let currentCountry = "all";

// Function to create a group card with lazy loading
function createGroupCard(group) {
    const card = document.createElement("div");
    card.className = "group-card";
    card.setAttribute("data-group-id", group.id);
    // Let CSS handle all styling including responsive heights
    card.style.width = "100%";
    card.style.maxWidth = "100%";
    card.style.boxSizing = "border-box";

    // Handle timestamp display safely
    let timeDisplay = "Recently added";
    try {
        if (group.timestamp) {
            if (typeof group.timestamp === "object" && group.timestamp.toDate) {
                timeDisplay = timeAgo(group.timestamp.toDate());
            } else if (group.timestamp instanceof Date) {
                timeDisplay = timeAgo(group.timestamp);
            } else if (typeof group.timestamp === "number") {
                timeDisplay = timeAgo(new Date(group.timestamp));
            }
        }
    } catch (error) {
        console.error("Error formatting timestamp:", error);
    }

    // Check if the image URL is likely to cause CORS issues
    let imageUrl = "/favicon-96x96.png"; // Default fallback

    // If we have an image, check if it's a problematic source
    if (group.image) {
        // Check for common problematic domains that might cause 403 errors
        const problematicDomains = [
            "whatsapp.net",
            "fbcdn.net",
            "facebook.com",
            "cdninstagram.com",
            "fbsbx.com",
        ];

        const hasProblematicDomain = problematicDomains.some((domain) =>
            group.image.includes(domain),
        );

        if (hasProblematicDomain) {
            // Use reliable WhatsApp logo instead
            imageUrl =
                "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png";
        } else if (
            group.image.includes("wikipedia.org") ||
            group.image.includes("wikimedia.org")
        ) {
            // Trusted sources - use directly
            imageUrl = group.image;
        } else if (group.image.includes("chat.whatsapp.com")) {
            // Direct WhatsApp link - use logo
            imageUrl =
                "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png";
        } else {
            // For other sources, use but with good fallback
            imageUrl = group.image;
        }
    }

    // Create card with reliable image loading pattern
    card.innerHTML = `
        <div class="card-image">
            <img src="${imageUrl}" alt="${group.title || "Group"}" loading="lazy" 
                 onerror="this.onerror=null; this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png';">
        </div>
        <div class="group-badges">
            <span class="category-badge">${group.category || "Uncategorized"}</span>
            <span class="country-badge">${group.country || "Global"}</span>
        </div>
        <h3>${group.title || "Untitled Group"}</h3>
        <p>${group.description || "No description available"}</p>
        <div class="card-actions">
            <a href="${group.link}" target="_blank" rel="noopener noreferrer" class="join-btn" onclick="updateGroupViews('${group.id}')">
                <i class="fab fa-whatsapp"></i> Join Group
            </a>
        </div>
        <div class="card-footer">
            <div class="views-count">
                <i class="fas fa-eye"></i>
                <span>${group.views || 0}</span> views
            </div>
            <div class="date-added">
                ${timeDisplay}
            </div>
        </div>
    `;

    return card;
}

// Function to update load more button visibility
function updateLoadMoreButton(totalGroups) {
    if (loadMoreBtn) {
        if (isLastPage || totalGroups < POSTS_PER_PAGE) {
            loadMoreBtn.style.display = "none";
        } else {
            loadMoreBtn.style.display = "block";
        }
    }
}

// Function to load groups
function loadGroups(
    filterTopic = "all",
    filterCountry = "all",
    loadMore = false,
) {
    if (!groupContainer) return;

    // Check if Firebase is initialized
    if (!window.db) {
        console.log("Firebase not initialized yet. Waiting...");
        // Try again in 500ms - reduced delay
        setTimeout(() => {
            loadGroups(filterTopic, filterCountry, loadMore);
        }, 500);
        return;
    }

    try {
        console.log("Loading groups with filters:", {
            filterTopic,
            filterCountry,
        });

        if (!loadMore) {
            // Show beautiful skeleton loading only if container is empty
            if (groupContainer.children.length === 0) {
                groupContainer.innerHTML = generateSkeletonLoader();
            }
            lastDoc = null;
            isLastPage = false;
        }

        // Create base query
        let baseQuery = window.db.collection("groups");

        // For queries with filters, we'll use a different approach to avoid index issues
        const hasTopicFilter = filterTopic && filterTopic !== "all";
        const hasCountryFilter = filterCountry && filterCountry !== "all";

        // First get all groups and apply filter in memory if using advanced filtering
        if (
            (hasTopicFilter && hasCountryFilter) ||
            (hasTopicFilter && !hasCountryFilter) ||
            (!hasTopicFilter && hasCountryFilter)
        ) {
            // Fetch all groups with a limit and apply filters in memory
            baseQuery = baseQuery.orderBy("timestamp", "desc");

            if (lastDoc && loadMore) {
                baseQuery = baseQuery
                    .startAfter(lastDoc)
                    .limit(POSTS_PER_PAGE * 3); // Get more to ensure we have enough after filtering
            } else {
                baseQuery = baseQuery.limit(POSTS_PER_PAGE * 3); // Get more to ensure we have enough after filtering
            }
        } else {
            // No filters, just apply ordering and pagination
            baseQuery = baseQuery.orderBy("timestamp", "desc");

            if (lastDoc && loadMore) {
                baseQuery = baseQuery.startAfter(lastDoc).limit(POSTS_PER_PAGE);
            } else {
                baseQuery = baseQuery.limit(POSTS_PER_PAGE);
            }
        }

        // FORCE FRESH DATA - Always get latest groups
        const queryOptions = {
            source: 'server' // CRITICAL: Always get fresh data from server, no cache
        };
        
        console.log('🔄 [main.js] Using server source for fresh data');

        // Remove the __name__ orderBy as it's not needed and requires an index
        // Just use the timestamp for ordering which should already be indexed
        
        // Execute the query
        baseQuery
            .get(queryOptions)
            .then((querySnapshot) => {
                // Only clear container if it has loading message or error, not existing groups
                if (!loadMore) {
                    const hasLoadingOrError = groupContainer.querySelector('.simple-loading, .skeleton-card, .beautiful-loading, .error-state, .no-groups, .loading');
                    if (hasLoadingOrError) {
                        groupContainer.innerHTML = "";
                    }
                }

                // Create array of groups
                let groups = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    groups.push({
                        id: doc.id,
                        ...data,
                    });
                });

                // Apply filters in memory since we've already fetched the data
                const hasTopicFilter = filterTopic && filterTopic !== "all";
                const hasCountryFilter =
                    filterCountry && filterCountry !== "all";

                // Apply category filter if needed
                if (hasTopicFilter) {
                    groups = groups.filter(
                        (group) => group.category === filterTopic,
                    );
                }

                // Apply country filter if needed
                if (hasCountryFilter) {
                    groups = groups.filter(
                        (group) => group.country === filterCountry,
                    );
                }

                // Limit the results to POSTS_PER_PAGE
                const limitedGroups = groups.slice(0, POSTS_PER_PAGE);

                // Show no results message if needed
                if (limitedGroups.length === 0) {
                    if (!loadMore) {
                        groupContainer.innerHTML =
                            '<div class="no-groups">No groups found matching your criteria.<br><a href="https://www.whatsuplink.online/?submit-form=true" style="color: #25D366; text-decoration: none; font-weight: bold;">Add a new group!</a></div>';
                    }
                    isLastPage = true;
                    updateLoadMoreButton(0);
                    return;
                }

                // Store the last document for pagination
                if (querySnapshot.docs.length > 0) {
                    lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
                }

                // Check if this is the last page but always show the button initially
                isLastPage = groups.length < POSTS_PER_PAGE; // More accurate last page check

                // Apply search filter if needed
                const searchTerm = searchInput?.value.toLowerCase();
                if (searchTerm) {
                    groups = limitedGroups.filter(
                        (group) =>
                            (group.title || "")
                                .toLowerCase()
                                .includes(searchTerm) ||
                            (group.description || "")
                                .toLowerCase()
                                .includes(searchTerm),
                    );
                } else {
                    groups = limitedGroups;
                }

                // Render groups efficiently
                const fragment = document.createDocumentFragment();
                groups.forEach((group) => {
                    const card = createGroupCard(group);
                    fragment.appendChild(card);
                });
                groupContainer.appendChild(fragment);

                // Update load more button visibility
                updateLoadMoreButton(groups.length);

                console.log(`Rendered ${groups.length} groups`);
            })
            .catch((error) => {
                console.error("Error loading groups:", error);
                
                // Only show error if this is not the first load or if we actually tried to load
                if (groupContainer.children.length === 0) {
                    // For first load errors, show a gentle retry message
                    groupContainer.innerHTML = generateBeautifulLoading('Unable to load groups', 'Please check your connection and try again');
                    
                    // Auto-retry after 3 seconds
                    setTimeout(() => {
                        if (groupContainer.innerHTML.includes('Unable to load groups')) {
                            loadGroups(filterTopic, filterCountry, loadMore);
                        }
                    }, 3000);
                } else {
                    // If we have existing groups, just update load more button
                    console.warn('Failed to load more groups:', error.message);
                }
                
                updateLoadMoreButton(0);
            });
    } catch (error) {
        console.error("Error loading groups:", error);
        
        // Only show error if container is empty
        if (groupContainer.children.length === 0) {
            groupContainer.innerHTML = generateBeautifulLoading('Connection Issue', 'Retrying automatically in a moment...');
            
            // Auto-retry after 2 seconds
            setTimeout(() => {
                if (groupContainer.innerHTML.includes('Connection Issue')) {
                    loadGroups(currentTopic, currentCountry, false);
                }
            }, 2000);
        }
        
        updateLoadMoreButton(0);
    }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    // Initialize Firebase event listeners with retry mechanism
    const checkFirebaseAndInitialize = () => {
        if (window.firebaseInitialized) {
            console.log(
                "Firebase is initialized, proceeding with app initialization",
            );
            initializeApp();
        } else {
            console.log("Firebase not initialized yet, waiting...");
            setTimeout(checkFirebaseAndInitialize, 100);
        }
    };

    // Check if database has priority - but still initialize app
    if (window.databasePriority || window.databaseGroupsLoaded) {
        console.log('[MAIN] Database has priority, but initializing app for fallback');
        initializeApp();
        // Don't return - let Firebase initialize as fallback
    }
    
    // Start initialization process immediately
    checkFirebaseAndInitialize();

    // Main app initialization
    function initializeApp() {
        console.log('✅ Main app initialized');

        // Initial load will be triggered by firebase-config.js when ready

        // Load More button click handler with enhanced animation
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener("click", (e) => {
                // Add loading class for animation
                loadMoreBtn.classList.add("loading");
                loadMoreBtn.innerHTML =
                    '<i class="fas fa-sync"></i> Loading...';

                // Add a click animation
                loadMoreBtn.style.transform = "scale(0.95)";

                // Load content with minimal delay
                setTimeout(() => {
                    loadGroups(currentTopic, currentCountry, true);

                    // Reset button after loading
                    setTimeout(() => {
                        loadMoreBtn.style.transform = "scale(1)";
                        loadMoreBtn.classList.remove("loading");
                        loadMoreBtn.innerHTML =
                            '<i class="fas fa-sync"></i> Load More';
                    }, 300);
                }, 300);
            });
        }

        // Category buttons (top section)
        document.querySelectorAll(".category-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const category = btn.dataset.category;
                console.log("Category button clicked:", category);

                // Update UI
                document
                    .querySelectorAll(".category-btn")
                    .forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");

                // Update state and load groups with optimized loader
                currentTopic = category;
                window.currentTopic = category; // Store globally for Firebase config
                
                // Use optimized loader if available, fallback to original
                if (window.loadGroupsOptimized) {
                    const searchTerm = document.querySelector('#searchGroups')?.value || '';
                    window.loadGroupsOptimized(category, currentCountry, searchTerm);
                } else {
                    loadGroups(category, currentCountry);
                }

                // Update dropdown to match selected category
                const dropdownBtn = document
                    .querySelector("#topicFilters")
                    ?.closest(".dropdown")
                    ?.querySelector(".dropdown-btn");
                if (dropdownBtn) {
                    dropdownBtn.innerHTML = `${btn.textContent.trim()} <i class="fas fa-chevron-down"></i>`;
                    // Also update the dropdown menu selection
                    const dropdownItem = document.querySelector(
                        `#topicFilters .filter-btn[data-category="${category}"]`,
                    );
                    if (dropdownItem) {
                        document
                            .querySelectorAll("#topicFilters .filter-btn")
                            .forEach((b) => b.classList.remove("active"));
                        dropdownItem.classList.add("active");
                    }
                }
            });
        });

        // Topic filter dropdown
        const topicFilters = document.querySelector("#topicFilters");
        if (topicFilters) {
            topicFilters.querySelectorAll(".filter-btn").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const category = btn.dataset.category;
                    console.log("Topic filter clicked:", category);

                    // Update UI
                    topicFilters
                        .querySelectorAll(".filter-btn")
                        .forEach((b) => b.classList.remove("active"));
                    btn.classList.add("active");

                    // Update dropdown button text
                    const dropdownBtn = btn
                        .closest(".dropdown")
                        ?.querySelector(".dropdown-btn");
                    if (dropdownBtn) {
                        dropdownBtn.innerHTML = `${btn.textContent} <i class="fas fa-chevron-down"></i>`;
                    }

                    // Update state and load groups with optimized loader
                    currentTopic = category;
                    window.currentTopic = category; // Store globally for Firebase config
                    
                    // Use optimized loader if available, fallback to original
                    if (window.loadGroupsOptimized) {
                        const searchTerm = document.querySelector('#searchGroups')?.value || '';
                        window.loadGroupsOptimized(category, currentCountry, searchTerm);
                    } else {
                        loadGroups(category, currentCountry);
                    }

                    // Close dropdown
                    btn.closest(".dropdown")?.classList.remove("active");

                    // Update category buttons to match
                    const categoryBtn = document.querySelector(
                        `.category-btn[data-category="${category}"]`,
                    );
                    if (categoryBtn) {
                        document
                            .querySelectorAll(".category-btn")
                            .forEach((b) => b.classList.remove("active"));
                        categoryBtn.classList.add("active");
                    }
                });
            });
        }

        // Country filter dropdown
        const countryFilters = document.querySelector("#countryFilters");
        if (countryFilters) {
            countryFilters.querySelectorAll(".filter-btn").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const country = btn.dataset.country;
                    console.log("Country filter clicked:", country);

                    // Update UI
                    countryFilters
                        .querySelectorAll(".filter-btn")
                        .forEach((b) => b.classList.remove("active"));
                    btn.classList.add("active");

                    // Update dropdown button text
                    const dropdownBtn = btn
                        .closest(".dropdown")
                        ?.querySelector(".dropdown-btn");
                    if (dropdownBtn) {
                        dropdownBtn.innerHTML = `${btn.textContent} <i class="fas fa-chevron-down"></i>`;
                    }

                    // Update state and load groups with optimized loader
                    currentCountry = country;
                    window.currentCountry = country; // Store globally for Firebase config
                    
                    // Use optimized loader if available, fallback to original
                    if (window.loadGroupsOptimized) {
                        const searchTerm = document.querySelector('#searchGroups')?.value || '';
                        window.loadGroupsOptimized(currentTopic, country, searchTerm);
                    } else {
                        loadGroups(currentTopic, country);
                    }

                    // Close dropdown
                    btn.closest(".dropdown")?.classList.remove("active");
                });
            });
        }

        // Enhanced dropdown toggle functionality with mobile support
        document.querySelectorAll(".dropdown").forEach((dropdown) => {
            const btn = dropdown.querySelector(".dropdown-btn");
            if (!btn) return;

            // Remove any existing listeners to prevent conflicts
            btn.replaceWith(btn.cloneNode(true));
            const newBtn = dropdown.querySelector(".dropdown-btn");

            // Toggle dropdown
            newBtn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔽 Dropdown clicked:', dropdown);
                
                const wasActive = dropdown.classList.contains("active");
                console.log('📊 Dropdown was active:', wasActive);

                // Close all dropdowns first
                document.querySelectorAll(".dropdown").forEach((d) => {
                    d.classList.remove("active");
                    console.log('🔒 Closed dropdown:', d);
                });

                // Toggle this dropdown if it wasn't active
                if (!wasActive) {
                    dropdown.classList.add("active");
                    console.log('🔓 Opened dropdown:', dropdown);
                }
            });
            
            // Handle touch events for mobile
            newBtn.addEventListener("touchstart", (e) => {
                e.stopPropagation();
            }, { passive: true });
        });

        // Enhanced click outside handler
       /* document.addEventListener("click", (e) => {
            const clickedInsideDropdown = e.target.closest(".dropdown");
            if (!clickedInsideDropdown) {
                document.querySelectorAll(".dropdown").forEach((d) => {
                    d.classList.remove("active");
                });
            }
        });*/
        
        // Additional touch handler for mobile
        document.addEventListener("touchstart", (e) => {
            const clickedInsideDropdown = e.target.closest(".dropdown");
            if (!clickedInsideDropdown) {
                document.querySelectorAll(".dropdown").forEach((d) => {
                    d.classList.remove("active");
                });
            }
        }, { passive: true });

        // Search input listener
        if (searchInput) {
            searchInput.addEventListener(
                "input",
                debounce(() => {
                    // Use optimized loader if available, fallback to original
                    if (window.loadGroupsOptimized) {
                        const searchTerm = searchInput.value || '';
                        window.loadGroupsOptimized(currentTopic, currentCountry, searchTerm);
                    } else {
                        loadGroups(currentTopic, currentCountry);
                    }
                }, 300),
            );
        }

        // Setup lazy loading
        setupLazyLoading();
    }
});

// Helper Functions - skeleton loading removed for simplicity

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Setup lazy loading for images
function setupLazyLoading() {
    const lazyImages = document.querySelectorAll(".lazy-image");

    if ("IntersectionObserver" in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove("lazy-image");
                    observer.unobserve(img);
                }
            });
        });

        lazyImages.forEach((img) => imageObserver.observe(img));
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        lazyImages.forEach((img) => {
            img.src = img.dataset.src;
            img.classList.remove("lazy-image");
        });
    }
}

// Global variable to store the current preview data and image URL
window.previewImageUrl = null;

// Enhanced function to fetch link preview using our Flask backend with multiple extraction methods
async function fetchLinkPreview(url, previewContainer) {
    // Reset the hidden input field for the image URL
    const imageUrlInput = document.getElementById("groupImageUrl");
    if (imageUrlInput) {
        imageUrlInput.value = "";
    }

    if (!url || !url.includes("chat.whatsapp.com/")) {
        previewContainer.innerHTML =
            '<p class="preview-tip">Enter a valid WhatsApp group link starting with https://chat.whatsapp.com/</p>';
        return null;
    }

    try {
        // Show loading indicator with improved styling
        previewContainer.innerHTML = `
            <div class="loading-preview">
                <div class="loading-spinner"></div>
                <p>Extracting group image and details...</p>
            </div>
        `;
        console.log("[FETCH] Starting enhanced preview fetch for:", url);

        // Call our Flask backend API for enhanced image extraction
        const response = await fetch('/api/extract-group-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url })
        });

        const result = await response.json();
        console.log("[FETCH] Backend API response:", result);

        let imageUrl, title, description;

        if (result.success) {
            imageUrl = result.image;
            title = result.title || "WhatsApp Group";
            description = result.description || "Join this WhatsApp group";
            console.log("[FETCH] Successfully extracted data via backend:", { imageUrl, title, description });
        } else {
            // If backend fails, fallback to Microlink API
            console.warn("[FETCH] Backend extraction failed, trying Microlink fallback:", result.error);
            
            const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}`;
            const microlinkResponse = await fetch(microlinkUrl);
            const microlinkJson = await microlinkResponse.json();

            if (microlinkJson.status === "success") {
                const data = microlinkJson.data;
                title = data.title || "WhatsApp Group";
                description = data.description || "Join this WhatsApp group";
                
                // Find the best image to use in order of preference
                if (data.image && data.image.url) {
                    imageUrl = data.image.url;
                } else if (data.logo && data.logo.url) {
                    imageUrl = data.logo.url;
                } else if (data.screenshot && data.screenshot.url) {
                    imageUrl = data.screenshot.url;
                } else {
                    imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png";
                }
                
                console.log("[FETCH] Microlink fallback successful:", { imageUrl, title, description });
            } else {
                throw new Error("Both backend and Microlink APIs failed");
            }
        }

        // CRITICALLY IMPORTANT: Set the hidden input field value
        if (imageUrlInput) {
            imageUrlInput.value = imageUrl;
            console.log("[FETCH] Set hidden input field value to:", imageUrl);
        } else {
            console.error("[FETCH] Could not find the groupImageUrl hidden input field!");
        }

        // Create a visually appealing preview card with enhanced styling
        previewContainer.innerHTML = `
            <div class="link-preview enhanced">
                <div class="preview-image">
                    <img src="${imageUrl}" alt="${title}" onerror="this.src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png'" />
                    <div class="image-overlay">
                        <i class="fab fa-whatsapp"></i>
                    </div>
                </div>
                <div class="preview-content">
                    <h3>${title}</h3>
                    <p>${description}</p>
                    <div class="preview-url">
                        <i class="fas fa-link"></i>
                        <span>${url.substring(0, 35)}${url.length > 35 ? "..." : ""}</span>
                    </div>
                    <div class="preview-status success">
                        <i class="fas fa-check-circle"></i>
                        <span>Group image extracted successfully</span>
                    </div>
                </div>
            </div>
        `;

        // Add enhanced responsive styles
        const previewElement = previewContainer.querySelector(".link-preview");
        if (previewElement) {
            Object.assign(previewElement.style, {
                display: "flex",
                flexDirection: "column",
                border: "1px solid #25D366",
                borderRadius: "12px",
                overflow: "hidden",
                maxWidth: "100%",
                backgroundColor: "#fff",
                boxShadow: "0 4px 16px rgba(37, 211, 102, 0.15)",
                transition: "all 0.3s ease"
            });
        }

        const imageContainer = previewContainer.querySelector(".preview-image");
        if (imageContainer) {
            Object.assign(imageContainer.style, {
                width: "100%",
                height: "200px",
                overflow: "hidden",
                backgroundColor: "#f5f5f5",
                position: "relative"
            });
        }

        const imageElement = previewContainer.querySelector(".preview-image img");
        if (imageElement) {
            Object.assign(imageElement.style, {
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.3s ease"
            });
        }

        const overlay = previewContainer.querySelector(".image-overlay");
        if (overlay) {
            Object.assign(overlay.style, {
                position: "absolute",
                top: "10px",
                right: "10px",
                backgroundColor: "rgba(37, 211, 102, 0.9)",
                color: "white",
                padding: "8px",
                borderRadius: "50%",
                fontSize: "14px"
            });
        }

        const contentElement = previewContainer.querySelector(".preview-content");
        if (contentElement) {
            Object.assign(contentElement.style, {
                padding: "16px"
            });
        }

        const statusElement = previewContainer.querySelector(".preview-status");
        if (statusElement) {
            Object.assign(statusElement.style, {
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#26a269",
                fontWeight: "500",
                fontSize: "14px",
                marginTop: "8px"
            });
        }

        return { title, description, imageUrl };
        
    } catch (error) {
        console.error("[FETCH] Error fetching link preview:", error);

        // Clear hidden input field on error
        if (imageUrlInput) {
            imageUrlInput.value = "";
        }

        // Show enhanced error preview
        previewContainer.innerHTML = `
            <div class="link-preview error">
                <div class="preview-image">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png" alt="WhatsApp" />
                    <div class="image-overlay error">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                </div>
                <div class="preview-content">
                    <h3>WhatsApp Group</h3>
                    <p>Join this WhatsApp group</p>
                    <div class="preview-url">
                        <i class="fas fa-link"></i>
                        <span>${url.substring(0, 35)}${url.length > 35 ? "..." : ""}</span>
                    </div>
                    <div class="preview-status error">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Could not extract group image - using default</span>
                    </div>
                </div>
            </div>
        `;

        // Apply error-specific styles
        const previewElement = previewContainer.querySelector(".link-preview");
        if (previewElement) {
            Object.assign(previewElement.style, {
                border: "1px solid #dc3545",
                boxShadow: "0 4px 16px rgba(220, 53, 69, 0.15)"
            });
        }

        return null;
    }
}

// Form Submission handler that uses the hidden input field for the image URL
const form = document.getElementById("groupForm");
if (form) {
    // Clone the form to remove any existing listeners
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    // Get necessary elements from the new form
    const newSubmitBtn = newForm.querySelector(".submit-btn");
    const newBtnText = newSubmitBtn?.querySelector(".btn-text");
    const newSpinner = newSubmitBtn?.querySelector(".loading-spinner");
    const newLinkInput = newForm.querySelector("#groupLink");

    // Re-attach the link preview handler to the new input
    if (newLinkInput) {
        // Debounce function to avoid too many API calls
        function debounce(func, wait) {
            let timeout;
            return function (...args) {
                const context = this;
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(context, args), wait);
            };
        }

        const handleNewLinkInput = debounce(async function () {
            const url = this.value ? this.value.trim() : "";
            const previewDiv = document.getElementById("preview");

            if (!previewDiv) return;

            if (!url) {
                previewDiv.innerHTML =
                    '<p class="preview-tip">Paste a WhatsApp group link to see a preview</p>';
                // Also clear the hidden image URL field
                const imageUrlInput = document.getElementById("groupImageUrl");
                if (imageUrlInput) {
                    imageUrlInput.value = "";
                }
                return;
            }

            if (url.includes("chat.whatsapp.com/")) {
                await fetchLinkPreview(url, previewDiv);
            } else {
                previewDiv.innerHTML =
                    '<p class="preview-tip">Enter a valid WhatsApp group link starting with https://chat.whatsapp.com/</p>';
                // Also clear the hidden image URL field
                const imageUrlInput = document.getElementById("groupImageUrl");
                if (imageUrlInput) {
                    imageUrlInput.value = "";
                }
            }
        }, 500);

        newLinkInput.addEventListener("input", handleNewLinkInput);
        newLinkInput.addEventListener("paste", () => {
            setTimeout(() => {
                handleNewLinkInput.call(newLinkInput);
            }, 100);
        });

        // Initial check if there's already a value
        if (newLinkInput.value) {
            setTimeout(() => {
                handleNewLinkInput.call(newLinkInput);
            }, 500);
        }
    }

    // Track if form submission is in progress
    let isSubmitting = false;

    // Form submission handler
    newForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        // Prevent double submissions
        if (isSubmitting) {
            console.log(
                "[SUBMIT] Submission already in progress, ignoring duplicate",
            );
            return;
        }

        console.log("[SUBMIT] Form submission started");
        isSubmitting = true;

        try {
            // Check if Firebase is initialized
            if (!window.db || !window.firebaseInitialized) {
                throw new Error(
                    "Database connection not ready. Please refresh the page and try again.",
                );
            }

            // Update UI to show loading
            if (newBtnText && newSpinner) {
                newBtnText.style.display = "none";
                newSpinner.style.display = "inline-block";
            }

            if (newSubmitBtn) {
                newSubmitBtn.disabled = true;
            }

            // Get form values
            const titleInput = newForm.querySelector("#groupTitle");
            const linkInput = newForm.querySelector("#groupLink");
            const categoryInput = newForm.querySelector("#groupCategory");
            const countryInput = newForm.querySelector("#groupCountry");
            const descriptionInput = newForm.querySelector("#groupDescription");
            const imageUrlInput = newForm.querySelector("#groupImageUrl");

            const link = linkInput?.value?.trim() || "";
            const title = titleInput?.value?.trim() || "WhatsApp Group";
            const category = categoryInput?.value || "";
            const country = countryInput?.value || "";
            const description =
                descriptionInput?.value?.trim() || "Join this WhatsApp group";

            console.log("[SUBMIT] Form data collected:", {
                title,
                link,
                category,
                country,
                imageUrl: imageUrlInput?.value,
            });

            // Validate the link
            if (!isValidWhatsAppLink(link)) {
                throw new Error(
                    "Please enter a valid WhatsApp group link starting with https://chat.whatsapp.com/",
                );
            }

            // Get the image URL from the hidden input field
            let imageUrl = imageUrlInput?.value || "";

            // If we don't have an image URL yet, try to fetch a preview first
            if (!imageUrl) {
                console.log(
                    "[SUBMIT] No image URL found, trying to fetch preview...",
                );
                const previewDiv = document.getElementById("preview");
                if (previewDiv) {
                    await fetchLinkPreview(link, previewDiv);
                    // Try to get the image URL from the hidden input again
                    imageUrl = imageUrlInput?.value || "";
                }
            }

            // If still no image URL, use default WhatsApp logo
            if (!imageUrl) {
                console.warn(
                    "[SUBMIT] Still no image URL, using default WhatsApp logo",
                );
                imageUrl =
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png";
            }

            console.log("[SUBMIT] Final image URL for submission:", imageUrl);

            // Prepare data for Firebase
            const groupData = {
                title: title,
                link: link,
                category: category,
                country: country,
                description: description,
                image: imageUrl, // Use the image URL from the hidden input
                timestamp: window.serverTimestamp(),
                views: 0,
            };

            console.log("[SUBMIT] Saving group data to Firebase:", groupData);

            // Add to Firebase
            const docRef = await window.db.collection("groups").add(groupData);
            console.log("[SUBMIT] Document written with ID:", docRef.id);

            // Show success message
            showNotification("Group added successfully!", "success");

            // Reset form and preview
            newForm.reset();

            const previewElement = document.getElementById("preview");
            if (previewElement) {
                previewElement.innerHTML =
                    '<p class="preview-tip">Paste a WhatsApp group link to see a preview</p>';
            }

            // Also clear the hidden image URL field
            if (imageUrlInput) {
                imageUrlInput.value = "";
            }
        } catch (error) {
            console.error("[SUBMIT] Form submission error:", error);
            showNotification(error.message, "error");
        } finally {
            // Reset UI
            if (newBtnText && newSpinner) {
                newBtnText.style.display = "block";
                newSpinner.style.display = "none";
            }
            if (newSubmitBtn) {
                newSubmitBtn.disabled = false;
            }
            isSubmitting = false;
        }
    });
}

// Add error handling function
function showErrorState(message) {
    if (groupContainer) {
        groupContainer.innerHTML = `
        <div class="error-state" role="alert">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
            <button onclick="loadGroups(currentTopic, currentCountry)" class="retry-btn">
                <i class="fas fa-redo"></i> Try Again
            </button>
        </div>
        `;
    }
}

// Utility Functions
function isValidWhatsAppLink(link) {
    return link && link.includes("chat.whatsapp.com/");
}

function showNotification(message, type) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Helper function for time formatting - FIXED
function timeAgo(date) {
    try {
        const now = new Date();
        const targetDate = new Date(date);
        const seconds = Math.floor((now - targetDate) / 1000);
        
        console.log('🕰️ [main.js] Time calculation:', { now, targetDate, seconds });
        
        if (seconds < 30) return "Just now";
        if (seconds < 60) return Math.floor(seconds) + " seconds ago";
        
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return minutes === 1 ? "1 minute ago" : minutes + " minutes ago";
        
        const hours = Math.floor(seconds / 3600);
        if (hours < 24) return hours === 1 ? "1 hour ago" : hours + " hours ago";
        
        const days = Math.floor(seconds / 86400);
        if (days < 30) return days === 1 ? "1 day ago" : days + " days ago";
        
        const months = Math.floor(seconds / 2592000);
        if (months < 12) return months === 1 ? "1 month ago" : months + " months ago";
        
        const years = Math.floor(seconds / 31536000);
        return years === 1 ? "1 year ago" : years + " years ago";
        
    } catch (error) {
        console.error("Error calculating time ago:", error);
        return "Recently added";
    }
}

// Function to update group views
function updateGroupViews(groupId) {
    try {
        const groupRef = window.db.collection("groups").doc(groupId);
        groupRef.update({
            views: firebase.firestore.FieldValue.increment(1),
        });
        console.log("Group views updated");
    } catch (error) {
        console.error("Error updating group views:", error);
    }
}

// Make updateGroupViews available globally
window.updateGroupViews = updateGroupViews;

// BEAUTIFUL LOADING HELPER FUNCTIONS

// Generate skeleton loading animation (shows while groups are loading)
function generateSkeletonLoader(count) {
    // Smart count based on screen size
    if (!count) {
        const screenWidth = window.innerWidth || document.documentElement.clientWidth || 900;
        if (screenWidth <= 595) {
            count = 8; // 4 rows of 2 columns on mobile
        } else if (screenWidth <= 768) {
            count = 6; // 3 rows of 2 columns on tablets
        } else {
            count = 6; // Desktop default
        }
    }
    const skeletonCards = Array.from({length: count}, (_, index) => `
        <div class="skeleton-card" style="animation-delay: ${index * 100}ms;">
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
                <div class="skeleton-badges">
                    <div class="skeleton-badge"></div>
                    <div class="skeleton-badge"></div>
                </div>
                <div class="skeleton-title"></div>
                <div class="skeleton-description">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                </div>
                <div class="skeleton-button"></div>
                <div class="skeleton-footer">
                    <div class="skeleton-views"></div>
                    <div class="skeleton-date"></div>
                </div>
            </div>
        </div>
    `).join('');
    
    // Return skeleton cards directly - they'll be placed inside the existing groups-grid
    return skeletonCards;
}

// Generate beautiful loading message (for connection issues or retries)
function generateBeautifulLoading(title = 'Loading Groups', subtitle = 'Finding the best WhatsApp groups for you') {
    return `
        <div class="beautiful-loading">
            <div class="loading-icon">⚡</div>
            <div class="loading-text">${title}<span class="loading-dots">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </span></div>
            <div class="loading-subtext">${subtitle}</div>
        </div>
    `;
}

// Make helper functions globally available
window.generateSkeletonLoader = generateSkeletonLoader;
window.generateBeautifulLoading = generateBeautifulLoading;
