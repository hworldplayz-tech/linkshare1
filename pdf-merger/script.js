// Initialize variables
let pdfFiles = [];
let mergedPdfBytes = null;
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const mergeButton = document.getElementById('mergeButton');
const clearButton = document.getElementById('clearButton');
const progressBar = document.getElementById('progressBar');
const progress = document.getElementById('progress');
const orderControls = document.getElementById('orderControls');
const mergedResult = document.getElementById('mergedResult');
const downloadButton = document.getElementById('downloadButton');
const recentFilesList = document.getElementById('recentFilesList');

// Load saved files from localStorage
function loadSavedFiles() {
    const savedFiles = localStorage.getItem('pdfMergerFiles');
    if (savedFiles) {
        const fileData = JSON.parse(savedFiles);
        return fileData;
    }
    return [];
}

// Save files to localStorage
function saveFilesToStorage(files) {
    const fileData = files.map(file => ({
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        type: file.type
    }));
    localStorage.setItem('pdfMergerFiles', JSON.stringify(fileData));
}

// Load recent files from localStorage
let recentFiles = JSON.parse(localStorage.getItem('recentPdfMerges') || '[]');

// Drag and drop handlers
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '#f0f8ff';
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '';
    const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
    if (files.length === 0) {
        alert('Please drop only PDF files.');
        return;
    }
    handleFiles(files);
});

fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
    if (files.length === 0) {
        alert('Please select only PDF files.');
        return;
    }
    handleFiles(files);
    fileInput.value = ''; // Clear the input for future selections
});

function handleFiles(files) {
    // Show warning for very large files but don't prevent
    const totalSize = files.reduce((total, file) => total + file.size, 0) / (1024 * 1024);
    if (totalSize > 200) {
        if (!confirm(`You are attempting to merge ${totalSize.toFixed(1)}MB of PDFs. This might take some time and could affect browser performance. Continue?`)) {
            return;
        }
    }

    files.forEach(file => {
        // Generate a unique ID for the file
        const fileId = `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const fileWithId = Object.assign(file, { id: fileId });
        pdfFiles.push(fileWithId);
        addFileToList(fileWithId);
    });
    
    // Save to localStorage
    saveFilesToStorage(pdfFiles);
    
    updateButtons();
    if (pdfFiles.length >= 2) {
        orderControls.style.display = 'block';
    }
}

// Initialize drag and drop sorting
new Sortable(fileList, {
    animation: 150,
    ghostClass: 'dragging',
    onEnd: function(evt) {
        const item = pdfFiles[evt.oldIndex];
        pdfFiles.splice(evt.oldIndex, 1);
        pdfFiles.splice(evt.newIndex, 0, item);
    }
});

function addFileToList(file) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';
    
    const icon = document.createElement('i');
    icon.className = 'fas fa-file-pdf';
    icon.style.color = '#dc3545';
    
    const fileDetails = document.createElement('div');
    fileDetails.innerHTML = `
        <div class="file-name">${file.name}</div>
        <div class="file-size">${formatFileSize(file.size)}</div>
    `;
    
    const removeButton = document.createElement('div');
    removeButton.className = 'remove-file';
    removeButton.innerHTML = '<i class="fas fa-times"></i>';
    removeButton.onclick = () => removeFile(file.name);
    
    fileInfo.appendChild(icon);
    fileInfo.appendChild(fileDetails);
    fileItem.appendChild(fileInfo);
    fileItem.appendChild(removeButton);
    fileList.appendChild(fileItem);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function removeFile(fileName) {
    pdfFiles = pdfFiles.filter(file => file.name !== fileName);
    fileList.innerHTML = '';
    pdfFiles.forEach(file => addFileToList(file));
    updateButtons();
    orderControls.style.display = pdfFiles.length >= 2 ? 'block' : 'none';
    mergedResult.style.display = 'none';
}

function updateButtons() {
    mergeButton.disabled = pdfFiles.length < 2;
    clearButton.disabled = pdfFiles.length === 0;
}

function updateRecentFiles() {
    recentFilesList.innerHTML = '';
    recentFiles.forEach((merge, index) => {
        const item = document.createElement('div');
        item.className = 'recent-file-item';
        
        // Format date nicely
        const mergeDate = new Date(merge.date);
        const formattedDate = mergeDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        item.innerHTML = `
            <div class="delete-recent" onclick="deleteRecentMerge(${index})" title="Delete this record">
                <i class="fas fa-times"></i>
            </div>
            <div class="merge-count">
                <i class="fas fa-file-pdf"></i>
                ${merge.files.length} files merged
            </div>
            <div class="merge-date">
                <i class="far fa-clock"></i>
                ${formattedDate}
            </div>
            <div class="merge-size">
                <i class="fas fa-weight-hanging"></i>
                ${merge.totalSize}
            </div>
            <div class="files-list">
                ${merge.files.map(file => `<div>${file}</div>`).join('')}
            </div>
        `;
        recentFilesList.appendChild(item);
    });
}

function deleteRecentMerge(index) {
    recentFiles.splice(index, 1);
    localStorage.setItem('recentPdfMerges', JSON.stringify(recentFiles));
    updateRecentFiles();
}

// Clear all recent merges
document.getElementById('clearRecentBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all merge history?')) {
        recentFiles = [];
        localStorage.setItem('recentPdfMerges', JSON.stringify(recentFiles));
        updateRecentFiles();
    }
});

// Function to merge PDFs in chunks
async function mergePDFsInChunks(pdfFiles) {
    const CHUNK_SIZE = 50; // Process 50 pages at a time
    const pdfDoc = await PDFLib.PDFDocument.create();
    let totalPages = 0;
    let currentPage = 0;

    // First count total pages
    for (const file of pdfFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        totalPages += pdf.getPageCount();
    }

    // Then merge PDFs in chunks
    for (const file of pdfFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const pageIndices = pdf.getPageIndices();
        
        // Process pages in chunks
        for (let i = 0; i < pageIndices.length; i += CHUNK_SIZE) {
            const chunk = pageIndices.slice(i, i + CHUNK_SIZE);
            const pages = await pdfDoc.copyPages(pdf, chunk);
            
            for (const page of pages) {
                pdfDoc.addPage(page);
                currentPage++;
                progress.style.width = `${(currentPage / totalPages) * 100}%`;
                // Allow UI to update
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }
    }
    return pdfDoc;
}

// Merge PDFs
mergeButton.addEventListener('click', async () => {
    try {
        progressBar.style.display = 'block';
        progress.style.width = '0%';
        mergeButton.disabled = true;
        clearButton.disabled = true;

        const pdfDoc = await mergePDFsInChunks(pdfFiles);

        mergedPdfBytes = await pdfDoc.save();
        
        // Save to recent files
        const newMerge = {
            date: new Date().toISOString(),
            fileCount: pdfFiles.length,
            totalSize: formatFileSize(mergedPdfBytes.length),
            files: pdfFiles.map(f => f.name)
        };
        recentFiles.unshift(newMerge);
        if (recentFiles.length > 5) recentFiles.pop();
        localStorage.setItem('recentPdfMerges', JSON.stringify(recentFiles));
        
        // Update UI
        document.getElementById('mergedFileSize').textContent = formatFileSize(mergedPdfBytes.length);
        progressBar.style.display = 'none';
        mergedResult.style.display = 'block';
        updateRecentFiles();
        
        mergeButton.disabled = false;
        clearButton.disabled = false;
    } catch (error) {
        console.error('Error merging PDFs:', error);
        alert('An error occurred while merging the PDF files. Please try again.');
        progressBar.style.display = 'none';
        mergeButton.disabled = false;
        clearButton.disabled = false;
    }
});

// Handle file name input
const mergedFileName = document.getElementById('mergedFileName');
const finalFileName = document.getElementById('finalFileName');

function updateFinalFileName() {
    const timestamp = new Date().toISOString().slice(0,10);
    const customName = mergedFileName.value.trim();
    const fileName = customName ? 
        (customName.endsWith('.pdf') ? customName : `${customName}.pdf`) : 
        `linkshare_merger_${timestamp}.pdf`;
    finalFileName.textContent = fileName;
    return fileName;
}

mergedFileName.addEventListener('input', updateFinalFileName);

// Download merged PDF
downloadButton.addEventListener('click', () => {
    if (mergedPdfBytes) {
        const fileName = updateFinalFileName();
        
        // Create blob from the PDF bytes
        const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
        
        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        
        // Append to document, click, and cleanup
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);
    }
});

// Clear all files
clearButton.addEventListener('click', () => {
    pdfFiles = [];
    fileList.innerHTML = '';
    mergedResult.style.display = 'none';
    orderControls.style.display = 'none';
    mergedPdfBytes = null;
    mergedFileName.value = ''; // Clear the filename input
    updateFinalFileName(); // Reset the filename preview
    updateButtons();
    // Clear localStorage
    localStorage.removeItem('pdfMergerFiles');
});

// Initialize recent files list
updateRecentFiles();


// Scroll to Top Button
const scrollToTopBtn = document.querySelector('.scroll-to-top');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Initialize page with saved files
document.addEventListener('DOMContentLoaded', () => {
    const savedFiles = loadSavedFiles();
    if (savedFiles && savedFiles.length > 0) {
        savedFiles.forEach(fileData => {
            const fileId = `${fileData.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const dummyFile = new File([], fileData.name, {
                type: fileData.type,
                lastModified: fileData.lastModified
            });
            Object.assign(dummyFile, { 
                id: fileId,
                size: fileData.size,
                dummy: true // Mark as dummy file to indicate it needs to be replaced
            });
            pdfFiles.push(dummyFile);
            addFileToList(dummyFile);
        });
        updateButtons();
        if (pdfFiles.length >= 2) {
            orderControls.style.display = 'block';
        }
        
        // Show notice to user
        const notice = document.createElement('div');
        notice.className = 'restore-notice';
        notice.innerHTML = `
            <div style="background: #fff3cd; color: #856404; padding: 1rem; border-radius: 5px; margin: 1rem 0; text-align: center;">
                Previous files have been restored. Please reselect them to continue.
                <button onclick="this.parentElement.remove()" style="margin-left: 1rem; padding: 0.2rem 0.5rem; border: none; background: #856404; color: white; border-radius: 3px;">
                    Dismiss
                </button>
            </div>
        `;
        fileList.insertBefore(notice, fileList.firstChild);
    }
});
