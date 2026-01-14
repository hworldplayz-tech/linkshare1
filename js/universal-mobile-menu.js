/**
 * Simple Mobile Menu - No conflicts, just works
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Simple mobile menu starting...');
    
    // Wait a bit for other scripts to load
    setTimeout(() => {
        const navToggle = document.querySelector('.nav-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (!navToggle || !navLinks) {
            console.log('⚠️ Menu elements missing');
            return;
        }
        
        // Remove ALL existing event listeners by replacing the element
        const newToggle = navToggle.cloneNode(true);
        navToggle.parentNode.replaceChild(newToggle, navToggle);
        
        // Simple click handler
        newToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('🔥 MENU CLICKED');
            
            // Simple toggle
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                newToggle.innerHTML = '<i class="fas fa-bars"></i>';
                console.log('🔥 MENU CLOSED');
            } else {
                navLinks.classList.add('active');
                newToggle.innerHTML = '<i class="fas fa-times"></i>';
                console.log('🔥 MENU OPENED');
            }
        });
        
        console.log('✅ Simple mobile menu ready');
    }, 500);
    
    // Touch support for mobile devices
    navToggle.addEventListener('touchstart', function(e) {
        e.stopPropagation();
    }, { passive: true });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.navbar') && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            setTimeout(() => {
                navToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }, 50);
            console.log('📱 Menu closed by outside click');
        }
    });
    
    // Close menu when clicking nav links (mobile only)
    const navLinkItems = navLinks.querySelectorAll('a');
    navLinkItems.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 868) {
                navLinks.classList.remove('active');
                setTimeout(() => {
                    navToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }, 50);
                console.log('📱 Menu closed after link click');
            }
        });
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 868 && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            setTimeout(() => {
                navToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }, 50);
        }
    });
    
    console.log('✅ Universal mobile menu setup complete');
});

console.log('📱 Universal Mobile Menu loaded');