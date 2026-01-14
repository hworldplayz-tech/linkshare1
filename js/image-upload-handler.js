/**
 * Image Upload Handler
 * Handles custom image uploads for WhatsApp groups
 */

document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('groupImage');
    const imagePreview = document.getElementById('imagePreview');
    const groupImageUrl = document.getElementById('groupImageUrl');
    
    if (imageInput && imagePreview) {
        setupImageUpload();
    }
});

function setupImageUpload() {
    const imageInput = document.getElementById('groupImage');
    const imagePreview = document.getElementById('imagePreview');
    const groupImageUrl = document.getElementById('groupImageUrl');
    
    // Handle file selection
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            handleImageUpload(file);
        }
    });
    
    // Handle drag and drop
    imagePreview.addEventListener('dragover', function(e) {
        e.preventDefault();
        imagePreview.style.borderColor = '#25D366';
        imagePreview.style.backgroundColor = '#f0f9f4';
    });
    
    imagePreview.addEventListener('dragleave', function(e) {
        e.preventDefault();
        imagePreview.style.borderColor = '#ddd';
        imagePreview.style.backgroundColor = '#fafafa';
    });
    
    imagePreview.addEventListener('drop', function(e) {
        e.preventDefault();
        imagePreview.style.borderColor = '#ddd';
        imagePreview.style.backgroundColor = '#fafafa';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                imageInput.files = files;
                handleImageUpload(file);
            }
        }
    });
}

function handleImageUpload(file) {
    console.log('[IMAGE] Handling image upload:', file.name);
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Image too large! Please choose an image under 5MB.', 'error');
        return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file (JPG, PNG, GIF).', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        displayImagePreview(e.target.result, file.name);
        
        // Convert image to base64 and store
        const base64Image = e.target.result;
        document.getElementById('groupImageUrl').value = base64Image;
        
        console.log('[IMAGE] Image loaded and stored as base64');
    };
    
    reader.onerror = function() {
        console.error('[IMAGE] Error reading file');
        showNotification('Error reading image file. Please try again.', 'error');
    };
    
    reader.readAsDataURL(file);
}

function displayImagePreview(imageSrc, fileName) {
    const imagePreview = document.getElementById('imagePreview');
    
    imagePreview.innerHTML = `
        <div style="position: relative; width: 100%;">
            <img src="${imageSrc}" alt="Preview" class="preview-image" style="max-width: 100%; max-height: 200px; border-radius: 8px; object-fit: cover;">
            <div style="margin-top: 10px; text-align: center;">
                <small style="color: #666; font-weight: 500;">${fileName}</small>
                <br>
                <button type="button" onclick="removeImage()" style="
                    background: #dc3545; 
                    color: white; 
                    border: none; 
                    padding: 4px 8px; 
                    border-radius: 4px; 
                    font-size: 0.8rem; 
                    margin-top: 5px;
                    cursor: pointer;
                ">Remove Image</button>
            </div>
        </div>
    `;
    
    imagePreview.classList.add('has-image');
}

function removeImage() {
    const imageInput = document.getElementById('groupImage');
    const imagePreview = document.getElementById('imagePreview');
    const groupImageUrl = document.getElementById('groupImageUrl');
    
    // Clear file input
    imageInput.value = '';
    
    // Clear hidden field
    groupImageUrl.value = '';
    
    // Reset preview
    imagePreview.innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <p>Click to upload custom group image<br><small>JPG, PNG, GIF up to 5MB</small></p>
    `;
    
    imagePreview.classList.remove('has-image');
    
    console.log('[IMAGE] Image removed');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed; 
        top: 20px; 
        right: 20px; 
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'}; 
        color: white; 
        padding: 12px 20px; 
        border-radius: 8px; 
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        font-weight: 500;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 4000);
}

// Make removeImage function global
window.removeImage = removeImage;

console.log('📷 Image Upload Handler loaded successfully');