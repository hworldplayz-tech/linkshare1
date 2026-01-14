// Navbar Loading and Initialization
document.addEventListener('DOMContentLoaded', async function() {
    await loadNavbar();
});

async function loadNavbar() {
    try {
        // Fetch the navbar content with no-cache to always get latest version
        const response = await fetch('/nav.html', {
            cache: 'no-store', // Don't use cache during development
            headers: {
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!response.ok) throw new Error('Failed to load navbar');
        
        const navContent = await response.text();
        
        // Create a temporary container
        const temp = document.createElement('div');
        temp.innerHTML = navContent;
        
        // Get the nav element from the loaded content
        const navElement = temp.querySelector('nav.navbar');
        
        if (navElement) {
            // Remove any existing navbar
            const existingNav = document.querySelector('nav.navbar');
            if (existingNav) {
                existingNav.remove();
            }
            
            // Insert the new navbar at the start of the body
            document.body.insertAdjacentElement('afterbegin', navElement);
        } else {
            console.error('Navbar element not found in nav.html');
        }
        
        // Set current page as active
        setActiveNavLink();
        
        // Initialize mobile menu
        initMobileMenu();
        
    } catch (error) {
        console.error('Error loading navbar:', error);
    }
}

function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function initMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    let isMenuOpen = false;

    if (!navToggle || !navLinks) return;

    // Function to close menu and restore scroll
    function closeMenu() {
        isMenuOpen = false;
        navLinks.classList.remove('active');
        navLinks.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Function to open menu and prevent scroll
    function openMenu() {
        isMenuOpen = true;
        navLinks.classList.add('active');
        navLinks.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Handle mobile menu toggle
    navToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (isMenuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Handle dropdowns
    dropdowns.forEach(dropdown => {
        const dropBtn = dropdown.querySelector('.dropbtn');
        if (dropBtn) {
            dropBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Close other dropdowns
                dropdowns.forEach(d => {
                    if (d !== dropdown) d.classList.remove('active');
                });
                
                dropdown.classList.toggle('active');
            });
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
            if (isMenuOpen && window.innerWidth < 992) {
                closeMenu();
            }
        }
        
        // Close dropdowns when clicking outside
        if (!e.target.closest('.nav-dropdown')) {
            dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
        }
    });

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth >= 992) {
                navLinks.style.display = 'flex';
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
                isMenuOpen = false;
            } else if (!isMenuOpen) {
                navLinks.style.display = 'none';
            }
        }, 100);
    });
    
    // Initial state based on screen size
    if (window.innerWidth >= 992) {
        navLinks.style.display = 'flex';
        document.body.style.overflow = '';
    } else {
        navLinks.style.display = 'none';
        document.body.style.overflow = '';
    }
}
