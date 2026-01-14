/**
 * Image Fix for Group Cards
 * Ensures all group cards show images properly
 */

function fixGroupImages() {
    console.log('🖼️ Fixing group card images...');
    
    const groupCards = document.querySelectorAll('.group-card');
    console.log(`🖼️ Found ${groupCards.length} group cards to check`);
    
    groupCards.forEach((card, index) => {
        const img = card.querySelector('img');
        if (img) {
            // Set up error handling
            img.addEventListener('error', function() {
                console.log(`🚫 Image failed for card ${index}, using WhatsApp default`);
                this.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png';
                this.style.border = '2px solid #25d366';
                this.style.borderRadius = '50%';
            });
            
            // Check if image is already broken
            if (img.naturalWidth === 0 && img.complete) {
                console.log(`🔄 Fixing broken image for card ${index}`);
                img.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png';
                img.style.border = '2px solid #25d366';
                img.style.borderRadius = '50%';
            }
        }
    });
    
    console.log('✅ Group image fix complete');
}

// Auto-run image fix after page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(fixGroupImages, 1000); // Wait for groups to load
});

// Also run when groups are loaded
document.addEventListener('groupsLoaded', fixGroupImages);

// Export for manual use
window.fixGroupImages = fixGroupImages;

console.log('🖼️ Image Fix utility loaded');