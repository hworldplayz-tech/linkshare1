document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    const convertButton = document.getElementById('convertButton');
    const clearButton = document.getElementById('clearButton');
    const progressBar = document.getElementById('progressBar');
    const progress = document.getElementById('progress');
    const convertedResult = document.getElementById('convertedResult');
    const downloadButton = document.getElementById('downloadButton');
    const convertedFileName = document.getElementById('convertedFileName');
    const finalFileName = document.getElementById('finalFileName');
    const orderControls = document.getElementById('orderControls');

    let files = [];

    // Setup drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropZone.classList.add('dragover');
    }

    function unhighlight() {
        dropZone.classList.remove('dragover');
    }

    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const droppedFiles = [...dt.files];
        handleFiles(droppedFiles);
    }

    // Handle file input change
    fileInput.addEventListener('change', function() {
        handleFiles([...this.files]);
    });

    // Handle file selection
    function handleFiles(newFiles) {
        const imageFiles = newFiles.filter(file => file.type.startsWith('image/'));
        files = [...files, ...imageFiles];
        updateFileList();
        updateButtons();
    }

    // Update file list UI
    function updateFileList() {
        fileList.innerHTML = '';
        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}" class="file-preview">
                    <div class="file-info">
                        <p class="file-name">${file.name}</p>
                        <p class="file-size">${formatFileSize(file.size)}</p>
                    </div>
                    <button class="remove-file" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                fileList.appendChild(fileItem);
            };
            reader.readAsDataURL(file);
        });

        if (files.length > 1) {
            orderControls.style.display = 'block';
            // Initialize drag-and-drop reordering
            new Sortable(fileList, {
                animation: 150,
                onEnd: function(evt) {
                    const item = files[evt.oldIndex];
                    files.splice(evt.oldIndex, 1);
                    files.splice(evt.newIndex, 0, item);
                }
            });
        } else {
            orderControls.style.display = 'none';
        }
    }

    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Update button states
    function updateButtons() {
        convertButton.disabled = files.length === 0;
        clearButton.disabled = files.length === 0;
    }

    // Handle file removal
    fileList.addEventListener('click', function(e) {
        if (e.target.closest('.remove-file')) {
            const index = parseInt(e.target.closest('.remove-file').dataset.index);
            files.splice(index, 1);
            updateFileList();
            updateButtons();
        }
    });

    // Clear all files
    clearButton.addEventListener('click', function() {
        files = [];
        updateFileList();
        updateButtons();
        convertedResult.style.display = 'none';
    });

    // Convert images to PDF
    convertButton.addEventListener('click', async function() {
        try {
            progressBar.style.display = 'block';
            progress.style.width = '0%';

            const pageSize = document.getElementById('pageSize').value;
            const orientation = document.getElementById('orientation').value;
            const imageQuality = document.getElementById('imageQuality').value;

            // Create PDF document
            const { PDFDocument } = PDFLib;
            const pdfDoc = await PDFDocument.create();

            // Process each image
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                progress.style.width = `${((i + 1) / files.length) * 100}%`;

                // Convert image file to bytes
                const imageBytes = await readFileAsBytes(file);

                // Determine image type and embed accordingly
                let image;
                if (file.type === 'image/jpeg') {
                    image = await pdfDoc.embedJpg(imageBytes);
                } else if (file.type === 'image/png') {
                    image = await pdfDoc.embedPng(imageBytes);
                } else {
                    continue; // Skip unsupported image types
                }

                // Add page with proper size and orientation
                const pageDimensions = getPageDimensions(pageSize, orientation);
                const page = pdfDoc.addPage([pageDimensions.width, pageDimensions.height]);

                // Calculate image dimensions to fit the page
                const { width, height } = fitImageToPage(
                    image.width,
                    image.height,
                    pageDimensions.width,
                    pageDimensions.height
                );

                // Draw image on page
                page.drawImage(image, {
                    x: (pageDimensions.width - width) / 2,
                    y: (pageDimensions.height - height) / 2,
                    width,
                    height
                });
            }

            // Save PDF
            const pdfBytes = await pdfDoc.save();
            const defaultFileName = `linkshare_image2pdf_${new Date().toISOString().slice(0, 10)}.pdf`;
            finalFileName.textContent = defaultFileName;
            
            // Store PDF data for download
            downloadButton.onclick = () => {
                const fileName = convertedFileName.value.trim() || defaultFileName;
                download(pdfBytes, fileName, 'application/pdf');
            };

            // Show success message
            progressBar.style.display = 'none';
            convertedResult.style.display = 'block';

        } catch (error) {
            console.error('Error converting images to PDF:', error);
            alert('An error occurred while converting images to PDF. Please try again.');
            progressBar.style.display = 'none';
        }
    });

    // Helper function to read file as bytes
    function readFileAsBytes(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(new Uint8Array(reader.result));
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    // Helper function to get page dimensions
    function getPageDimensions(size, orientation) {
        const dimensions = {
            'A4': { width: 595.276, height: 841.890 },
            'Letter': { width: 612, height: 792 },
            'Legal': { width: 612, height: 1008 }
        };

        const dim = dimensions[size];
        return orientation === 'landscape' 
            ? { width: dim.height, height: dim.width }
            : dim;
    }

    // Helper function to fit image to page
    function fitImageToPage(imgWidth, imgHeight, pageWidth, pageHeight) {
        const margin = 40; // 20pt margin on each side
        const maxWidth = pageWidth - (margin * 2);
        const maxHeight = pageHeight - (margin * 2);
        
        const widthRatio = maxWidth / imgWidth;
        const heightRatio = maxHeight / imgHeight;
        const scale = Math.min(widthRatio, heightRatio);
        
        return {
            width: imgWidth * scale,
            height: imgHeight * scale
        };
    }
});
