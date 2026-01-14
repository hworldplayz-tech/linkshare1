/**
 * Enhanced Preview System - No External APIs Required
 * Direct WhatsApp metadata extraction using advanced web scraping
 */

// Enhanced function to fetch link preview using advanced direct extraction
async function fetchLinkPreview(url, previewContainer) {
    console.log("[ENHANCED] Starting advanced preview fetch for URL:", url);
    
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
        // Show enhanced loading indicator with animation steps
        previewContainer.innerHTML = `
            <div class="loading-preview">
                <div class="loading-spinner">
                    <i class="fas fa-spin fa-circle-notch"></i>
                </div>
                <p>Extracting metadata using advanced script (no APIs)...</p>
                <div class="loading-steps">
                    <div class="step active">🔍 Analyzing link</div>
                    <div class="step">📸 Extracting image</div>
                    <div class="step">📝 Getting details</div>
                </div>
            </div>
        `;
        
        console.log("[ENHANCED] Using advanced metadata extractor...");
        
        let imageUrl, title, description;
        let extractionSuccess = false;

        // Use our WhatsApp-specific extractor for maximum effectiveness
        if (window.whatsappExtractor) {
            // Animate loading steps
            const steps = previewContainer.querySelectorAll('.step');
            let currentStep = 0;
            
            const animateStep = () => {
                if (currentStep < steps.length) {
                    if (steps[currentStep]) {
                        steps[currentStep].classList.add('active');
                    }
                    currentStep++;
                    setTimeout(animateStep, 800);
                }
            };
            setTimeout(animateStep, 500);
            
            try {
                console.log("[ENHANCED] Using WhatsApp-specific extractor...");
                const metadata = await window.whatsappExtractor.extractGroupMetadata(url);
                console.log("[ENHANCED] WhatsApp extraction successful:", metadata);
                
                if (metadata && metadata.success !== false) {
                    imageUrl = metadata.image || 'https://static.whatsapp.net/rsrc.php/v4/yo/r/J5gK5AgJ_L5.png';
                    title = metadata.title || "WhatsApp Group";
                    description = metadata.description || "Join this WhatsApp group";
                    extractionSuccess = true;
                    
                    console.log(`🎯 Extraction method used: ${metadata.method || 'unknown'}`);
                }
            } catch (extractorError) {
                console.warn("[ENHANCED] WhatsApp extractor failed:", extractorError);
                
                // Fallback to basic metadata extractor
                if (window.metadataExtractor) {
                    try {
                        console.log("[ENHANCED] Falling back to basic extractor...");
                        const fallbackMetadata = await window.metadataExtractor.extractMetadata(url);
                        if (fallbackMetadata && fallbackMetadata.success !== false) {
                            imageUrl = fallbackMetadata.image || 'https://static.whatsapp.net/rsrc.php/v4/yo/r/J5gK5AgJ_L5.png';
                            title = fallbackMetadata.title || "WhatsApp Group";
                            description = fallbackMetadata.description || "Join this WhatsApp group";
                            extractionSuccess = true;
                        }
                    } catch (fallbackError) {
                        console.warn("[ENHANCED] Fallback extractor also failed:", fallbackError);
                    }
                }
            }
        }
        
        // Fallback to basic extraction if advanced fails
        if (!extractionSuccess) {
            console.log("[ENHANCED] Using secure fallback extraction...");
            imageUrl = 'https://static.whatsapp.net/rsrc.php/v4/yo/r/J5gK5AgJ_L5.png';
            title = "WhatsApp Group";
            description = "Join this WhatsApp group to connect with members";
        }

        // CRITICALLY IMPORTANT: Set the hidden input field value
        if (imageUrlInput) {
            imageUrlInput.value = imageUrl;
            console.log("[ENHANCED] Set hidden input field value to:", imageUrl);
        } else {
            console.error("[ENHANCED] Could not find the groupImageUrl hidden input field!");
        }

        // Create an enhanced preview card with modern styling
        previewContainer.innerHTML = `
            <div class="link-preview enhanced">
                <div class="preview-image">
                    <img src="${imageUrl}" 
                         alt="${title}" 
                         onerror="this.src='https://static.whatsapp.net/rsrc.php/v4/yo/r/J5gK5AgJ_L5.png'" />
                    <div class="image-overlay">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                </div>
                <div class="preview-content">
                    <h3>${title}</h3>
                    <p>${description}</p>
                    <div class="preview-url">
                        <i class="fab fa-whatsapp"></i>
                        <span>${url.substring(0, 40)}${url.length > 40 ? "..." : ""}</span>
                    </div>
                    <div class="preview-status success">
                        <i class="fas fa-robot"></i>
                        <span>Metadata extracted using advanced script (no external APIs)</span>
                    </div>
                </div>
            </div>
        `;

        // Apply enhanced styling with WhatsApp theme
        const previewElement = previewContainer.querySelector('.link-preview');
        if (previewElement) {
            Object.assign(previewElement.style, {
                display: "flex",
                flexDirection: "column",
                border: "2px solid #25D366",
                borderRadius: "12px",
                overflow: "hidden",
                maxWidth: "100%",
                backgroundColor: "#fff",
                boxShadow: "0 6px 25px rgba(37, 211, 102, 0.25)",
                transition: "all 0.4s ease",
                background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)"
            });
        }

        // Style the image container
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

        // Style the image element
        const imageElement = previewContainer.querySelector(".preview-image img");
        if (imageElement) {
            Object.assign(imageElement.style, {
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.3s ease"
            });
        }

        // Style the overlay
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
                fontSize: "14px",
                zIndex: "2"
            });
        }

        // Style the content area
        const contentElement = previewContainer.querySelector(".preview-content");
        if (contentElement) {
            Object.assign(contentElement.style, {
                padding: "16px"
            });
        }

        // Style the status indicator
        const statusElement = previewContainer.querySelector(".preview-status");
        if (statusElement) {
            Object.assign(statusElement.style, {
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#26a269",
                fontWeight: "500",
                fontSize: "14px",
                marginTop: "8px",
                padding: "8px 12px",
                borderRadius: "6px",
                background: "rgba(38, 162, 105, 0.1)"
            });
        }

        // Store the preview data globally for reference
        window.previewImageUrl = imageUrl;

        console.log("[ENHANCED] Advanced preview displayed successfully");
        return { title, description, imageUrl };
        
    } catch (error) {
        console.error("[ENHANCED] Error in advanced preview fetch:", error);

        // Clear hidden input field on error
        if (imageUrlInput) {
            imageUrlInput.value = "";
        }

        // Show fallback preview with WhatsApp official resources
        previewContainer.innerHTML = `
            <div class="link-preview fallback">
                <div class="preview-image">
                    <img src="https://static.whatsapp.net/rsrc.php/v4/yo/r/J5gK5AgJ_L5.png" alt="WhatsApp Group" />
                    <div class="image-overlay warning">
                        <i class="fas fa-info-circle"></i>
                    </div>
                </div>
                <div class="preview-content">
                    <h3>WhatsApp Group</h3>
                    <p>Join this WhatsApp group to connect with members</p>
                    <div class="preview-url">
                        <i class="fab fa-whatsapp"></i>
                        <span>${url.substring(0, 40)}${url.length > 40 ? "..." : ""}</span>
                    </div>
                    <div class="preview-status warning">
                        <i class="fas fa-shield-alt"></i>
                        <span>Using secure WhatsApp official image</span>
                    </div>
                </div>
            </div>
        `;

        // Apply fallback styles
        const previewElement = previewContainer.querySelector(".link-preview");
        if (previewElement) {
            Object.assign(previewElement.style, {
                display: "flex",
                flexDirection: "column",
                border: "2px solid #128C7E",
                borderRadius: "12px",
                overflow: "hidden",
                maxWidth: "100%",
                backgroundColor: "#fff",
                boxShadow: "0 4px 20px rgba(18, 140, 126, 0.2)",
                background: "linear-gradient(135deg, #ffffff 0%, #f0f8f8 100%)"
            });
        }

        return null;
    }
}

// Enhanced CSS for loading steps animation
const enhancedCSS = `
.loading-steps {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 16px;
    padding: 0 20px;
}

.loading-steps .step {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(37, 211, 102, 0.1);
    border-radius: 6px;
    font-size: 14px;
    color: #666;
    opacity: 0.5;
    transition: all 0.3s ease;
}

.loading-steps .step.active {
    background: rgba(37, 211, 102, 0.2);
    color: #25D366;
    opacity: 1;
    transform: translateX(4px);
}

.preview-status.warning {
    color: #856404;
    background: rgba(255, 193, 7, 0.1);
}

.image-overlay.warning {
    background: rgba(255, 193, 7, 0.9);
}
`;

// Inject enhanced CSS
const style = document.createElement('style');
style.textContent = enhancedCSS;
document.head.appendChild(style);

console.log('🎨 Enhanced Preview System loaded successfully');