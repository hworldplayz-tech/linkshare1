/**
 * Form Handler for Add Group Page
 * Handles form submission with extracted metadata
 */

document.addEventListener('DOMContentLoaded', function() {
    const groupForm = document.getElementById('groupForm');
    if (groupForm) {
        setupFormHandler();
    }
});

function setupFormHandler() {
    const groupForm = document.getElementById('groupForm');
    
    groupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('[FORM] Form submission started');
        
        // Get form data
        const formData = new FormData(groupForm);
        
        // Get values from the specific form fields
        const title = document.getElementById('groupTitle')?.value || '';
        const link = document.getElementById('groupLink')?.value || '';
        const category = document.getElementById('groupCategory')?.value || 'General';
        const country = document.getElementById('groupCountry')?.value || 'Global';
        let imageUrl = document.getElementById('groupImageUrl')?.value || '';
        
        // Require custom image upload
        if (!imageUrl) {
            showNotification('Please upload a custom group image', 'error');
            return;
        }
        
        const data = {
            title: title,
            description: 'Join this amazing WhatsApp group!',
            group_url: link,
            image_url: imageUrl,
            category: category,
            country: country
        };
        
        console.log('[FORM] Submitting data:', data);
        
        // Disable submit button and show loading
        const submitBtn = groupForm.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding Group...';
        
        try {
            // Submit to API
            const response = await fetch('/api/groups', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            console.log('[FORM] API response:', result);
            
            if (result.success) {
                // Show success message
                showNotification('Group added successfully!', 'success');
                
                // Reset form
                groupForm.reset();
                document.getElementById('linkPreview').innerHTML = '';
                
                // Redirect to homepage after a delay
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
                
            } else {
                // Show error message
                showNotification(result.error || 'Failed to add group', 'error');
            }
            
        } catch (error) {
            console.error('[FORM] Error:', error);
            showNotification('Network error occurred. Please try again.', 'error');
        }
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    });
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3',
        color: 'white',
        padding: '16px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        zIndex: '9999',
        animation: 'slideInRight 0.3s ease',
        maxWidth: '300px'
    });
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 12px;
}

.notification i {
    font-size: 18px;
}
`;
document.head.appendChild(style);

console.log('📝 Form Handler loaded successfully');