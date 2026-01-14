const DEFAULT_OBJECTIVE = "I being a dynamic aggravated & action oriented young person, present myself with all my devotion, dedication & commitment for the best of your substantiated organization. I cordially assure you, if given a chance would capitalize my abilities.";

let currentTemplate = 'classic';
let educationCount = 1;
let profileImageData = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadRecentCVs();
    setupEventListeners();
    updateFileName();
});

function initializeApp() {
    const savedData = localStorage.getItem('currentCVData');
    if (savedData) {
        const data = JSON.parse(savedData);
        loadFormData(data);
    }
}

function setupEventListeners() {
    document.getElementById('templateSelect').addEventListener('change', function(e) {
        selectTemplate(e.target.value);
    });

    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            goToTab(this.dataset.tab);
        });
    });

    document.getElementById('profileImage').addEventListener('change', handleImageUpload);
    
    document.getElementById('removeImageBtn').addEventListener('click', removeProfileImage);

    document.getElementById('addEducationBtn').addEventListener('click', addEducationEntry);
    
    document.getElementById('updatePreviewBtn').addEventListener('click', updatePreview);
    
    document.getElementById('clearFormBtn').addEventListener('click', clearForm);
    
    document.getElementById('downloadBtn').addEventListener('click', downloadPDF);
    
    document.getElementById('saveBtn').addEventListener('click', saveCV);
    
    document.getElementById('clearAllBtn').addEventListener('click', clearAllCVs);
    
    document.getElementById('cvFileName').addEventListener('input', updateFileName);
}

function goToTab(tabName) {
    const targetTab = document.getElementById(tabName + '-tab');
    const targetButton = document.querySelector(`[data-tab="${tabName}"]`);
    
    if (!targetTab) {
        console.error('Tab not found:', tabName);
        return;
    }
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    targetTab.classList.add('active');
    
    if (targetButton) {
        targetButton.classList.add('active');
    }
}

window.goToTab = goToTab;

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            profileImageData = event.target.result;
            document.getElementById('imagePreview').src = profileImageData;
            document.getElementById('imagePreviewContainer').style.display = 'block';
            updatePreview();
        };
        reader.readAsDataURL(file);
    }
}

function removeProfileImage() {
    profileImageData = null;
    document.getElementById('profileImage').value = '';
    document.getElementById('imagePreviewContainer').style.display = 'none';
    updatePreview();
}

function selectTemplate(template) {
    currentTemplate = template;
    
    const preview = document.getElementById('cvPreview');
    preview.className = `cv-preview ${template}-template`;
    
    updatePreview();
}

function addEducationEntry() {
    educationCount++;
    const educationList = document.getElementById('educationList');
    
    const newEntry = document.createElement('div');
    newEntry.className = 'education-entry';
    newEntry.innerHTML = `
        <button type="button" class="remove-education-btn" onclick="removeEducationEntry(this)">
            <i class="fas fa-times"></i>
        </button>
        <div class="form-row">
            <div class="form-group">
                <input type="text" class="edu-level" placeholder="Level (e.g., MATRIC)">
            </div>
            <div class="form-group">
                <input type="text" class="edu-year" placeholder="Year (e.g., 2018-2019)">
            </div>
            <div class="form-group">
                <input type="text" class="edu-board" placeholder="Board/University">
            </div>
        </div>
    `;
    
    educationList.appendChild(newEntry);
}

function removeEducationEntry(button) {
    const entry = button.closest('.education-entry');
    const educationList = document.getElementById('educationList');
    
    if (educationList.children.length > 1) {
        entry.remove();
    } else {
        alert('At least one education entry is required.');
    }
}

window.removeEducationEntry = removeEducationEntry;

function updatePreview() {
    const fullName = document.getElementById('fullName').value || 'YOUR NAME';
    const dateOfBirth = document.getElementById('dateOfBirth').value;
    const gender = document.getElementById('gender').value;
    const religion = document.getElementById('religion').value;
    const nationality = document.getElementById('nationality').value;
    const objectiveInput = document.getElementById('objective').value;
    const objective = objectiveInput.trim() ? objectiveInput : DEFAULT_OBJECTIVE;
    const experience = document.getElementById('experience').value;
    const email = document.getElementById('email').value || 'your@email.com';
    const phone = document.getElementById('phone').value || 'Your Phone';
    const mailingAddress = document.getElementById('mailingAddress').value || 'Your address will appear here...';

    const educationEntries = [];
    document.querySelectorAll('.education-entry').forEach(entry => {
        const level = entry.querySelector('.edu-level').value;
        const year = entry.querySelector('.edu-year').value;
        const board = entry.querySelector('.edu-board').value;
        
        if (level || year || board) {
            educationEntries.push({ level, year, board });
        }
    });

    let cvLogoHTML = '';
    if (profileImageData) {
        cvLogoHTML = `<img src="${profileImageData}" alt="Profile">`;
    } else {
        cvLogoHTML = 'CV';
    }

    let personalDetailsHTML = '';
    if (fullName && fullName !== 'YOUR NAME') {
        personalDetailsHTML += `<div class="cv-detail-item"><span class="cv-detail-label">Name:</span> ${fullName}</div>`;
    }
    if (dateOfBirth) {
        personalDetailsHTML += `<div class="cv-detail-item"><span class="cv-detail-label">Date of Birth:</span> ${dateOfBirth}</div>`;
    }
    if (gender) {
        personalDetailsHTML += `<div class="cv-detail-item"><span class="cv-detail-label">Gender:</span> ${gender}</div>`;
    }
    if (religion) {
        personalDetailsHTML += `<div class="cv-detail-item"><span class="cv-detail-label">Religion:</span> ${religion}</div>`;
    }
    if (nationality) {
        personalDetailsHTML += `<div class="cv-detail-item"><span class="cv-detail-label">Nationality:</span> ${nationality}</div>`;
    }

    let experienceHTML = '';
    if (experience && experience.trim()) {
        const experienceLines = experience.split('\n').filter(line => line.trim());
        experienceHTML = '<ul style="margin: 0; padding-left: 20px; list-style-type: disc;">';
        experienceLines.forEach(line => {
            experienceHTML += `<li style="margin-bottom: 5px; font-weight: normal; font-size: 11px; color: #2c3e50;">${line}</li>`;
        });
        experienceHTML += '</ul>';
    } else {
        experienceHTML = '<div class="cv-text">Your experience will appear here...</div>';
    }

    let educationHTML = '';
    if (educationEntries.length > 0) {
        educationHTML = `
            <table class="cv-education-table">
                <thead>
                    <tr>
                        <th>Level</th>
                        <th>Year</th>
                        <th>Board/University</th>
                    </tr>
                </thead>
                <tbody>
        `;
        educationEntries.forEach(entry => {
            educationHTML += `
                <tr>
                    <td>${entry.level || '-'}</td>
                    <td>${entry.year || '-'}</td>
                    <td>${entry.board || '-'}</td>
                </tr>
            `;
        });
        educationHTML += '</tbody></table>';
    } else {
        educationHTML = '<div class="cv-text">Your education details will appear here...</div>';
    }

    const cvPreview = document.getElementById('cvPreview');
    cvPreview.innerHTML = `
        <div class="cv-header">
            <div class="cv-logo" id="cvLogo">${cvLogoHTML}</div>
            <div class="cv-name">${fullName}</div>
        </div>
        <div class="cv-content">
            <div class="cv-left-column">
                <div class="cv-section">
                    <h3 class="cv-section-title">OBJECTIVE</h3>
                    <p class="cv-text">${objective}</p>
                </div>
                <div class="cv-section">
                    <h3 class="cv-section-title">PERSONAL DETAIL</h3>
                    <div class="cv-text">
                        ${personalDetailsHTML || 'Fill the form to see your details here'}
                    </div>
                </div>
            </div>
            <div class="cv-right-column">
                <div class="cv-section">
                    <h3 class="cv-section-title">EXPERIENCE & SKILLS</h3>
                    ${experienceHTML}
                </div>
                <div class="cv-section">
                    <h3 class="cv-section-title">EDUCATION</h3>
                    ${educationHTML}
                </div>
                <div class="cv-section">
                    <h3 class="cv-section-title">MAILING ADDRESS</h3>
                    <p class="cv-text">${mailingAddress}</p>
                </div>
            </div>
        </div>
        <div class="cv-footer">
            <div class="cv-contact">
                <i class="fas fa-envelope"></i>
                <span>${email}</span>
            </div>
            <div class="cv-contact">
                <i class="fas fa-phone"></i>
                <span>${phone}</span>
            </div>
        </div>
    `;
}

function clearForm() {
    if (confirm('Are you sure you want to clear the form? This will reset all fields.')) {
        document.querySelectorAll('input, select, textarea').forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else if (input.type !== 'file') {
                input.value = '';
            }
        });

        removeProfileImage();

        const educationList = document.getElementById('educationList');
        while (educationList.children.length > 1) {
            educationList.lastChild.remove();
        }
        
        educationList.querySelector('.edu-level').value = '';
        educationList.querySelector('.edu-year').value = '';
        educationList.querySelector('.edu-board').value = '';
        
        localStorage.removeItem('currentCVData');
        goToTab('personal');
        updatePreview();
    }
}

function getFormData() {
    const educationEntries = [];
    document.querySelectorAll('.education-entry').forEach(entry => {
        educationEntries.push({
            level: entry.querySelector('.edu-level').value,
            year: entry.querySelector('.edu-year').value,
            board: entry.querySelector('.edu-board').value
        });
    });

    return {
        template: currentTemplate,
        profileImage: profileImageData,
        fullName: document.getElementById('fullName').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        gender: document.getElementById('gender').value,
        religion: document.getElementById('religion').value,
        nationality: document.getElementById('nationality').value,
        objective: document.getElementById('objective').value,
        experience: document.getElementById('experience').value,
        education: educationEntries,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        mailingAddress: document.getElementById('mailingAddress').value
    };
}

function loadFormData(data) {
    currentTemplate = data.template || 'classic';
    
    document.getElementById('templateSelect').value = currentTemplate;
    
    const preview = document.getElementById('cvPreview');
    preview.className = `cv-preview ${currentTemplate}-template`;
    
    if (data.profileImage) {
        profileImageData = data.profileImage;
        document.getElementById('imagePreview').src = profileImageData;
        document.getElementById('imagePreviewContainer').style.display = 'block';
    }
    
    document.getElementById('fullName').value = data.fullName || '';
    document.getElementById('dateOfBirth').value = data.dateOfBirth || '';
    document.getElementById('gender').value = data.gender || '';
    document.getElementById('religion').value = data.religion || '';
    document.getElementById('nationality').value = data.nationality || '';
    document.getElementById('objective').value = data.objective || '';
    document.getElementById('experience').value = data.experience || '';
    document.getElementById('email').value = data.email || '';
    document.getElementById('phone').value = data.phone || '';
    document.getElementById('mailingAddress').value = data.mailingAddress || '';

    if (data.education && data.education.length > 0) {
        const educationList = document.getElementById('educationList');
        educationList.innerHTML = '';
        
        data.education.forEach((edu, index) => {
            const entry = document.createElement('div');
            entry.className = 'education-entry';
            entry.innerHTML = `
                ${index > 0 ? `
                    <button type="button" class="remove-education-btn" onclick="removeEducationEntry(this)">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
                <div class="form-row">
                    <div class="form-group">
                        <input type="text" class="edu-level" placeholder="Level (e.g., MATRIC)" value="${edu.level || ''}">
                    </div>
                    <div class="form-group">
                        <input type="text" class="edu-year" placeholder="Year (e.g., 2018-2019)" value="${edu.year || ''}">
                    </div>
                    <div class="form-group">
                        <input type="text" class="edu-board" placeholder="Board/University" value="${edu.board || ''}">
                    </div>
                </div>
            `;
            educationList.appendChild(entry);
        });
    }
    
    updatePreview();
}

function autoSaveFormData() {
    const formData = getFormData();
    localStorage.setItem('currentCVData', JSON.stringify(formData));
}

function saveCV() {
    const formData = getFormData();
    
    if (!formData.fullName || !formData.email || !formData.phone) {
        alert('Please fill in at least Name, Email, and Phone Number before saving.');
        return;
    }
    
    const cvId = 'cv_' + Date.now();
    const cvData = {
        id: cvId,
        ...formData,
        savedAt: new Date().toISOString()
    };
    
    let recentCVs = JSON.parse(localStorage.getItem('recentCVs') || '[]');
    recentCVs.unshift(cvData);
    
    if (recentCVs.length > 10) {
        recentCVs = recentCVs.slice(0, 10);
    }
    
    localStorage.setItem('recentCVs', JSON.stringify(recentCVs));
    
    loadRecentCVs();
    
    alert('CV saved successfully!');
}

function loadRecentCVs() {
    const recentCVs = JSON.parse(localStorage.getItem('recentCVs') || '[]');
    const recentCvsList = document.getElementById('recentCvsList');
    
    if (recentCVs.length === 0) {
        recentCvsList.innerHTML = '<p class="no-cvs-message">No recent CVs. Create your first CV!</p>';
        return;
    }
    
    recentCvsList.innerHTML = '';
    
    recentCVs.forEach(cv => {
        const cvCard = document.createElement('div');
        cvCard.className = 'cv-card';
        
        const date = new Date(cv.savedAt);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        const templateNames = {
            'classic': 'Classic Red',
            'modern': 'Modern Blue',
            'minimal': 'Minimal'
        };
        
        cvCard.innerHTML = `
            <div class="cv-card-header">
                <div>
                    <div class="cv-card-title">${cv.fullName || 'Untitled CV'}</div>
                    <div class="cv-card-date">${formattedDate}</div>
                    <div class="cv-card-template">${templateNames[cv.template] || 'Classic'}</div>
                </div>
            </div>
            <div class="cv-card-actions">
                <button class="cv-action-btn edit-btn" onclick="editCV('${cv.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="cv-action-btn delete-btn" onclick="deleteCV('${cv.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        recentCvsList.appendChild(cvCard);
    });
}

function editCV(cvId) {
    const recentCVs = JSON.parse(localStorage.getItem('recentCVs') || '[]');
    const cv = recentCVs.find(c => c.id === cvId);
    
    if (cv) {
        loadFormData(cv);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

window.editCV = editCV;

function deleteCV(cvId) {
    if (confirm('Are you sure you want to delete this CV?')) {
        let recentCVs = JSON.parse(localStorage.getItem('recentCVs') || '[]');
        recentCVs = recentCVs.filter(cv => cv.id !== cvId);
        localStorage.setItem('recentCVs', JSON.stringify(recentCVs));
        loadRecentCVs();
    }
}

window.deleteCV = deleteCV;

function clearAllCVs() {
    if (confirm('Are you sure you want to clear all recent CVs? This action cannot be undone.')) {
        localStorage.removeItem('recentCVs');
        loadRecentCVs();
    }
}

function updateFileName() {
    const fileName = document.getElementById('cvFileName').value;
    const finalFileName = document.getElementById('finalFileName');
    
    if (fileName.trim()) {
        finalFileName.textContent = fileName.trim() + '.pdf';
    } else {
        finalFileName.textContent = 'my_cv.pdf';
    }
}

async function downloadPDF() {
    const cvPreview = document.getElementById('cvPreview');
    const downloadBtn = document.getElementById('downloadBtn');
    
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
    
    // Small delay to ensure animation is visible
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
        // Force desktop layout for PDF generation
        const originalWidth = cvPreview.style.minWidth;
        const cvContent = cvPreview.querySelector('.cv-content');
        const cvHeader = cvPreview.querySelector('.cv-header');
        const cvFooter = cvPreview.querySelector('.cv-footer');
        
        const originalContentDisplay = cvContent ? cvContent.style.display : '';
        const originalContentGrid = cvContent ? cvContent.style.gridTemplateColumns : '';
        const originalHeaderFlex = cvHeader ? cvHeader.style.flexDirection : '';
        const originalFooterFlex = cvFooter ? cvFooter.style.flexDirection : '';
        
        // Apply desktop layout
        cvPreview.style.minWidth = '800px';
        if (cvContent) {
            cvContent.style.display = 'grid';
            cvContent.style.gridTemplateColumns = 'repeat(auto-fit, minmax(220px, 1fr))';
        }
        if (cvHeader) {
            cvHeader.style.flexDirection = 'row';
        }
        if (cvFooter) {
            cvFooter.style.flexDirection = 'row';
        }
        
        const canvas = await html2canvas(cvPreview, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        // Restore original styles
        cvPreview.style.minWidth = originalWidth;
        if (cvContent) {
            cvContent.style.display = originalContentDisplay;
            cvContent.style.gridTemplateColumns = originalContentGrid;
        }
        if (cvHeader) {
            cvHeader.style.flexDirection = originalHeaderFlex;
        }
        if (cvFooter) {
            cvFooter.style.flexDirection = originalFooterFlex;
        }
        
        const imgData = canvas.toDataURL('image/png');
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        const fileName = document.getElementById('cvFileName').value.trim() || 'my_cv';
        pdf.save(fileName + '.pdf');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    } finally {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download PDF';
    }
}
