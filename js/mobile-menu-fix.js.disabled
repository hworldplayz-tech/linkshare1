/**
 * Enhanced Mobile Menu Fix
 * Fixes menu bar and filter toggling issues on mobile
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Initializing mobile menu fix...');
    
    // Enhanced Mobile Navigation Toggle
    const navToggle = document.getElementById('navToggle') || document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    console.log('🔍 Found elements:', { navToggle, navLinks });
    
    if (navToggle && navLinks) {
        console.log('✅ Found nav elements, setting up mobile menu');
        
        // Remove any existing listeners to prevent conflicts
        const newNavToggle = navToggle.cloneNode(true);
        navToggle.parentNode.replaceChild(newNavToggle, navToggle);
        
        newNavToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            console.log('📱 Mobile menu toggle clicked!');
            
            const isActive = navLinks.classList.contains('active');
            console.log('📱 Menu currently active:', isActive);
            
            // Force toggle with visual feedback
            if (isActive) {
                navLinks.classList.remove('active');
                newNavToggle.innerHTML = '<i class="fas fa-bars"></i>';
                console.log('📱 Menu CLOSED');
            } else {
                navLinks.classList.add('active');
                newNavToggle.innerHTML = '<i class="fas fa-times"></i>';
                console.log('📱 Menu OPENED');
            }
            
            // Add visual feedback
            newNavToggle.style.transform = 'scale(1.1)';
            setTimeout(() => {
                newNavToggle.style.transform = 'scale(1)';
            }, 150);
        });
        
        // Also handle double-tap on mobile
        let tapCount = 0;
        newNavToggle.addEventListener('touchend', function(e) {
            tapCount++;
            if (tapCount === 1) {
                setTimeout(() => {
                    if (tapCount === 1) {
                        // Single tap - trigger click
                        console.log('📱 Single tap detected');
                        newNavToggle.click();
                    }
                    tapCount = 0;
                }, 200);
            }
            e.preventDefault();
        }, { passive: false });
        
        // Touch support for mobile
        newNavToggle.addEventListener('touchstart', function(e) {
            e.stopPropagation();
        }, { passive: true });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.navbar') && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                console.log('📱 Menu closed by outside click');
            }
        });
        
        // Close menu when clicking on nav links (mobile)
        const navLinkItems = navLinks.querySelectorAll('a');
        navLinkItems.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 868) {
                    navLinks.classList.remove('active');
                    console.log('📱 Menu closed after link click');
                }
            });
        });
        
        console.log('✅ Mobile navigation setup complete');
    } else {
        console.warn('⚠️ Nav elements not found:', { navToggle, navLinks });
    }
    
    // Enhanced Filter Dropdown Fix
    setupEnhancedFilterDropdowns();
});

function setupEnhancedFilterDropdowns() {
    console.log('🔽 Setting up enhanced filter dropdowns...');
    
    const dropdowns = document.querySelectorAll('.dropdown');
    console.log(`🔽 Found ${dropdowns.length} dropdowns`);
    
    dropdowns.forEach((dropdown, index) => {
        const btn = dropdown.querySelector('.dropdown-btn');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (!btn || !menu) {
            console.warn(`⚠️ Dropdown ${index} missing elements:`, { btn, menu });
            return;
        }
        
        console.log(`🔽 Setting up dropdown ${index}`);
        
        // Remove existing listeners by replacing the button
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        // Enhanced click handler
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log(`🔽 Dropdown ${index} button clicked`);
            
            const isActive = dropdown.classList.contains('active');
            
            // Close all other dropdowns first
            dropdowns.forEach((otherDropdown, otherIndex) => {
                if (otherIndex !== index) {
                    otherDropdown.classList.remove('active');
                    console.log(`🔽 Closed dropdown ${otherIndex}`);
                }
            });
            
            // Toggle current dropdown
            if (isActive) {
                dropdown.classList.remove('active');
                console.log(`🔽 Closed dropdown ${index}`);
            } else {
                dropdown.classList.add('active');
                console.log(`🔽 Opened dropdown ${index}`);
            }
        });
        
        // Touch support
        newBtn.addEventListener('touchstart', function(e) {
            e.stopPropagation();
        }, { passive: true });
        
        // Enhanced filter button handlers
        const filterBtns = menu.querySelectorAll('.filter-btn');
        filterBtns.forEach((filterBtn, filterIndex) => {
            const newFilterBtn = filterBtn.cloneNode(true);
            filterBtn.parentNode.replaceChild(newFilterBtn, filterBtn);
            
            newFilterBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log(`🔽 Filter button ${filterIndex} clicked in dropdown ${index}`);
                
                // Remove active class from all filter buttons in this dropdown
                menu.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Add active class to clicked button
                newFilterBtn.classList.add('active');
                
                // Update dropdown button text
                const buttonText = newFilterBtn.textContent.trim();
                const icon = newBtn.querySelector('i');
                newBtn.innerHTML = `${buttonText} <i class="fas fa-chevron-down"></i>`;
                
                // Close dropdown
                dropdown.classList.remove('active');
                
                console.log(`🔽 Filter applied: ${buttonText}`);
                
                // Trigger filter change if needed
                if (typeof loadGroupsRealtime === 'function') {
                    console.log('🔄 Triggering realtime group reload...');
                    setTimeout(() => loadGroupsRealtime(), 100);
                }
            });
        });
    });
    
    // Close all dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            dropdowns.forEach((dropdown, index) => {
                if (dropdown.classList.contains('active')) {
                    dropdown.classList.remove('active');
                    console.log(`🔽 Closed dropdown ${index} via outside click`);
                }
            });
        }
    });
    
    // Touch handler for mobile
    document.addEventListener('touchstart', function(e) {
        if (!e.target.closest('.dropdown')) {
            dropdowns.forEach((dropdown, index) => {
                if (dropdown.classList.contains('active')) {
                    dropdown.classList.remove('active');
                    console.log(`🔽 Closed dropdown ${index} via outside touch`);
                }
            });
        }
    }, { passive: true });
    
    console.log('✅ Enhanced filter dropdowns setup complete');
}

// Add mobile-friendly styles
const mobileStyles = document.createElement('style');
mobileStyles.textContent = `
/* Enhanced Mobile Menu Styles */
@media (max-width: 868px) {
    .nav-toggle {
        display: block !important;
        z-index: 1001;
        background: none;
        border: none;
        font-size: 1.8rem;
        color: var(--primary-color);
        cursor: pointer;
        padding: 0.5rem;
        transition: all 0.3s ease;
    }
    
    .nav-toggle:hover {
        transform: scale(1.1);
        color: var(--secondary-color);
    }
    
    .nav-links {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        flex-direction: column;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(245, 245, 245, 0.95));
        backdrop-filter: blur(15px);
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
        padding: 5rem 2rem 2rem 2rem;
        opacity: 0;
        visibility: hidden;
        transform: translateX(-100%);
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        z-index: 1000;
        overflow-y: auto;
    }
    
    .nav-links.active {
        display: flex !important;
        opacity: 1;
        visibility: visible;
        transform: translateX(0);
    }
    
    .nav-links li {
        margin: 0.8rem 0;
        width: 100%;
        animation: slideInFromLeft 0.3s ease-out forwards;
    }
    
    .nav-links a {
        display: block;
        padding: 1.2rem 2rem;
        font-size: 1.1rem;
        text-align: center;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.6);
        transition: all 0.3s ease;
        border: 1px solid rgba(37, 211, 102, 0.2);
    }
    
    .nav-links a:hover {
        background: var(--primary-color);
        color: white;
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 5px 15px rgba(37, 211, 102, 0.3);
    }
}

/* Enhanced Filter Dropdown Mobile Styles */
@media (max-width: 768px) {
    .dropdown-btn {
        min-width: 140px !important;
        padding: 12px 16px !important;
        font-size: 14px !important;
        touch-action: manipulation;
    }
    
    .dropdown-menu {
        min-width: 160px !important;
        max-height: 250px !important;
        overflow-y: auto;
        border-radius: 12px !important;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2) !important;
    }
    
    .filter-btn {
        padding: 12px 16px !important;
        font-size: 14px !important;
        touch-action: manipulation;
        min-height: 44px; /* iOS recommended touch target */
    }
}

@keyframes slideInFromLeft {
    from {
        opacity: 0;
        transform: translateX(-30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* Loading states */
.loading-spinner {
    text-align: center;
    padding: 2rem;
    font-size: 1.2rem;
    color: var(--primary-color);
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
}
`;
document.head.appendChild(mobileStyles);

console.log('📱 Mobile Menu Fix loaded successfully');