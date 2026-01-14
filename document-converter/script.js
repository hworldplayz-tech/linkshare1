// Local Storage for Recent Conversions
const STORAGE_KEY = 'linkshare_document_conversions';
let recentConversions = [];

// Load recent conversions from local storage
function loadRecentConversions() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            recentConversions = JSON.parse(saved);
            renderRecentConversions();
        } catch (e) {
            console.error('Error loading recent conversions:', e);
            recentConversions = [];
        }
    }
}

// Save recent conversions to local storage
function saveRecentConversions() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recentConversions));
}

// Add a new conversion to history
function addConversion(type, fileName, sourceFormat, targetFormat, textPreview) {
    // Limit preview text length
    const previewText = textPreview ? (textPreview.length > 100 ? textPreview.substring(0, 100) + '...' : textPreview) : '';
    
    // Create new conversion record
    const conversion = {
        id: Date.now().toString(),
        type: type,
        fileName: fileName,
        sourceFormat: sourceFormat,
        targetFormat: targetFormat,
        textPreview: previewText,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
    };
    
    // Add to beginning of array
    recentConversions.unshift(conversion);
    
    // Limit to 10 most recent conversions
    if (recentConversions.length > 10) {
        recentConversions = recentConversions.slice(0, 10);
    }
    
    // Save and render
    saveRecentConversions();
    renderRecentConversions();
}

// Render recent conversions list
function renderRecentConversions() {
    const listElement = document.getElementById('recent-conversions-list');
    const emptyMessage = document.getElementById('empty-conversions-message');
    
    // Clear current list
    listElement.innerHTML = '';
    
    if (recentConversions.length === 0) {
        listElement.appendChild(emptyMessage);
        return;
    }
    
    // Hide empty message
    if (emptyMessage) {
        emptyMessage.style.display = 'none';
    }
    
    // Add each conversion to the list
    recentConversions.forEach(conversion => {
        const item = document.createElement('div');
        item.className = 'recent-item';
        
        // Determine icon based on conversion type
        let iconClass = 'fa-file';
        if (conversion.targetFormat === 'pdf') {
            iconClass = 'fa-file-pdf';
        } else if (conversion.targetFormat === 'docx') {
            iconClass = 'fa-file-word';
        } else if (conversion.targetFormat === 'txt') {
            iconClass = 'fa-file-alt';
        }
        
        item.innerHTML = `
            <div class="recent-icon">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="recent-details">
                <div class="recent-title">${conversion.fileName || 'Untitled Document'}</div>
                <div class="recent-meta">
                    <div class="recent-type">
                        <i class="fas fa-exchange-alt"></i>
                        ${conversion.sourceFormat || 'text'} → ${conversion.targetFormat}
                    </div>
                    <div class="recent-date">
                        <i class="fas fa-clock"></i>
                        ${conversion.date} ${conversion.time}
                    </div>
                </div>
            </div>
            <div class="recent-item-actions">
                <button class="action-btn delete-conversion" data-id="${conversion.id}" title="Remove from history">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        listElement.appendChild(item);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-conversion').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            removeConversion(id);
            e.stopPropagation(); // Prevent item click
        });
    });
}

// Remove a conversion from history
function removeConversion(id) {
    recentConversions = recentConversions.filter(conversion => conversion.id !== id);
    saveRecentConversions();
    renderRecentConversions();
}

// Clear all conversion history
function clearConversionHistory() {
    recentConversions = [];
    saveRecentConversions();
    renderRecentConversions();
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Document Ready Function
document.addEventListener('DOMContentLoaded', () => {
    // Initialize recent conversions
    loadRecentConversions();
    
    // Tab switching functionality
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all tab content
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            // Show the corresponding tab content
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Preview functionality
    const previewBtn = document.getElementById('preview-btn');
    const previewContainer = document.getElementById('preview-container');
    const previewContent = document.getElementById('preview-content');
    const closePreview = document.getElementById('close-preview');
    
    previewBtn.addEventListener('click', () => {
        const text = document.getElementById('input-text').value;
        if (text.trim() === '') {
            alert('Please enter some text to preview.');
            return;
        }
        
        previewContent.innerHTML = text.replace(/\n/g, '<br>');
        previewContainer.classList.remove('hidden');
    });
    
    closePreview.addEventListener('click', () => {
        previewContainer.classList.add('hidden');
    });
    
    // Clear functionality
    document.getElementById('clear-btn').addEventListener('click', () => {
        document.getElementById('input-text').value = '';
        previewContainer.classList.add('hidden');
    });
    
    document.getElementById('clear-file-btn').addEventListener('click', () => {
        document.getElementById('input-file').value = '';
        document.getElementById('file-info').classList.add('hidden');
        document.getElementById('output-text-container').classList.add('hidden');
    });
    
    // File upload info display
    document.getElementById('input-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            document.getElementById('file-name').textContent = file.name;
            document.getElementById('file-size').textContent = formatFileSize(file.size);
            document.getElementById('file-info').classList.remove('hidden');
        } else {
            document.getElementById('file-info').classList.add('hidden');
        }
    });
    
    // Copy to clipboard functionality
    document.getElementById('copy-btn').addEventListener('click', () => {
        const outputText = document.getElementById('output-text');
        outputText.select();
        document.execCommand('copy');
        alert('Text copied to clipboard!');
    });
    
    // Convert and download functionality
    document.getElementById('convert-btn').addEventListener('click', () => {
        const text = document.getElementById('input-text').value;
        if (text.trim() === '') {
            alert('Please enter some text to convert.');
            return;
        }
        
        const format = document.getElementById('output-format').value;
        const fontFamily = document.getElementById('font-family').value;
        const fontSize = document.getElementById('font-size').value;
        
        // Show loading spinner
        document.getElementById('loading').classList.add('show');
        
        // Simulate processing delay
        setTimeout(() => {
            if (format === 'pdf') {
                convertToPdf(text, fontFamily, fontSize);
                // Save to recent conversions
                addConversion('text-to-pdf', 'converted-document.pdf', 'text', 'pdf', text);
            } else if (format === 'docx') {
                convertToDocx(text, fontFamily, fontSize);
                // Save to recent conversions
                addConversion('text-to-docx', 'converted-document.docx', 'text', 'docx', text);
            } else if (format === 'txt') {
                convertToTxt(text);
                // Save to recent conversions
                addConversion('text-to-txt', 'converted-document.txt', 'text', 'txt', text);
            }
            
            // Hide loading spinner
            document.getElementById('loading').classList.remove('show');
        }, 1000);
    });
    
    // Convert to PDF function
    function convertToPdf(text, fontFamily, fontSize) {
        // Using jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Set font
        doc.setFont(fontFamily);
        doc.setFontSize(parseInt(fontSize));
        
        // Split text into lines to handle wrapping
        const pageWidth = doc.internal.pageSize.getWidth() - 20;
        const lines = doc.splitTextToSize(text, pageWidth);
        
        // Add text to PDF
        doc.text(lines, 10, 10);
        
        // Save the PDF
        doc.save('converted-document.pdf');
    }
    
    // Convert to DOCX function
    function convertToDocx(text, fontFamily, fontSize) {
        // Using docx.js
        const { Document, Paragraph, TextRun, Packer, AlignmentType, HeadingLevel } = window.docx;
        
        // Create paragraphs from text
        const paragraphs = [];
        
        // Add a title
        paragraphs.push(
            new Paragraph({
                text: "Converted Document",
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
            })
        );
        
        // Add a separator
        paragraphs.push(new Paragraph({
            text: "",
            spacing: {
                after: 200,
            },
        }));
        
        // Add content paragraphs
        text.split('\n').forEach(line => {
            if (line.trim() === '') {
                // Empty line
                paragraphs.push(new Paragraph({
                    text: "",
                }));
            } else {
                paragraphs.push(
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: line,
                                font: fontFamily,
                                size: parseInt(fontSize) * 2 // docx uses half-points
                            })
                        ]
                    })
                );
            }
        });
        
        // Create document
        const doc = new Document({
            sections: [{
                properties: {},
                children: paragraphs
            }]
        });
        
        // Generate and save document
        Packer.toBlob(doc).then(blob => {
            saveAs(blob, 'converted-document.docx');
        }).catch(error => {
            console.error("Error generating DOCX:", error);
            alert("Error generating Word document. Please try again.");
        });
    }
    
    // Convert to TXT function
    function convertToTxt(text) {
        const blob = new Blob([text], { type: 'text/plain' });
        saveAs(blob, 'converted-document.txt');
    }
    
    // Extract text functionality
    document.getElementById('extract-btn').addEventListener('click', () => {
        const fileInput = document.getElementById('input-file');
        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Please upload a document first.');
            return;
        }
        
        const file = fileInput.files[0];
        const fileName = file.name.toLowerCase();
        
        // Show loading spinner
        document.getElementById('loading-extract').classList.add('show');
        
        // Check file type and extract text accordingly
        if (fileName.endsWith('.txt')) {
            extractFromTxt(file);
        } else if (fileName.endsWith('.pdf')) {
            extractFromPdf(file);
        } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
            extractFromDocx(file);
        } else {
            alert('Unsupported file format. Please upload a PDF, DOCX, or TXT file.');
            document.getElementById('loading-extract').classList.remove('show');
        }
    });
    
    // Extract text from TXT file
    function extractFromTxt(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            document.getElementById('output-text').value = text;
            document.getElementById('output-text-container').classList.remove('hidden');
            document.getElementById('loading-extract').classList.remove('show');
            
            // Save to recent conversions
            addConversion('doc-to-text', file.name, 'txt', 'text', text);
        };
        reader.readAsText(file);
    }
    
    // Extract text from PDF file
    function extractFromPdf(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const typedArray = new Uint8Array(e.target.result);
            
            // Load the PDF file
            pdfjsLib.getDocument(typedArray).promise.then(function(pdf) {
                let textContent = '';
                let pendingPages = pdf.numPages;
                
                // Extract text from each page
                for (let i = 1; i <= pdf.numPages; i++) {
                    pdf.getPage(i).then(function(page) {
                        page.getTextContent().then(function(content) {
                            // Concatenate the text items
                            const pageText = content.items.map(item => item.str).join(' ');
                            textContent += pageText + '\n\n--- Page ' + i + ' ---\n\n';
                            
                            pendingPages--;
                            if (pendingPages === 0) {
                                // All pages processed
                                document.getElementById('output-text').value = textContent;
                                document.getElementById('output-text-container').classList.remove('hidden');
                                document.getElementById('loading-extract').classList.remove('show');
                                
                                // Save to recent conversions
                                addConversion('doc-to-text', file.name, 'pdf', 'text', textContent);
                            }
                        });
                    });
                }
            }).catch(function(error) {
                console.error('Error extracting PDF text:', error);
                document.getElementById('output-text').value = 'Error extracting text from PDF: ' + error.message;
                document.getElementById('output-text-container').classList.remove('hidden');
                document.getElementById('loading-extract').classList.remove('show');
            });
        };
        reader.readAsArrayBuffer(file);
    }
    
    // Extract text from DOCX file
    function extractFromDocx(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            mammoth.extractRawText({arrayBuffer: e.target.result})
                .then(function(result) {
                    document.getElementById('output-text').value = result.value;
                    document.getElementById('output-text-container').classList.remove('hidden');
                    document.getElementById('loading-extract').classList.remove('show');
                    
                    // Save to recent conversions
                    addConversion('doc-to-text', file.name, 'docx', 'text', result.value);
                    
                    // Show warnings if any
                    if (result.messages.length > 0) {
                        console.warn('Warnings while extracting DOCX text:', result.messages);
                    }
                })
                .catch(function(error) {
                    console.error('Error extracting DOCX text:', error);
                    document.getElementById('output-text').value = 'Error extracting text from Word document: ' + error.message;
                    document.getElementById('output-text-container').classList.remove('hidden');
                    document.getElementById('loading-extract').classList.remove('show');
                });
        };
        reader.readAsArrayBuffer(file);
    }
    
    // Download extracted text as TXT
    document.getElementById('download-text-btn').addEventListener('click', () => {
        const text = document.getElementById('output-text').value;
        const blob = new Blob([text], { type: 'text/plain' });
        saveAs(blob, 'extracted-text.txt');
    });
    
    // PDF to Word conversion functionality
    document.getElementById('pdf-input-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            document.getElementById('pdf-file-name').textContent = file.name;
            document.getElementById('pdf-file-size').textContent = formatFileSize(file.size);
            document.getElementById('pdf-file-info').classList.remove('hidden');
        } else {
            document.getElementById('pdf-file-info').classList.add('hidden');
        }
    });
    
    document.getElementById('clear-pdf-btn').addEventListener('click', () => {
        document.getElementById('pdf-input-file').value = '';
        document.getElementById('pdf-file-info').classList.add('hidden');
    });
    
    document.getElementById('convert-pdf-btn').addEventListener('click', () => {
        const fileInput = document.getElementById('pdf-input-file');
        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Please upload a PDF document first.');
            return;
        }
        
        const file = fileInput.files[0];
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            alert('Please upload a PDF file.');
            return;
        }
        
        const fontFamily = document.getElementById('pdf-font-family').value;
        const includeImages = document.getElementById('include-images').value === 'yes';
        
        // Show loading spinner
        document.getElementById('loading-pdf-convert').classList.add('show');
        
        // Convert PDF to Word
        convertPdfToWord(file, fontFamily, includeImages);
    });
    
    // Convert PDF to Word function
    function convertPdfToWord(file, fontFamily, includeImages) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const typedArray = new Uint8Array(e.target.result);
            
            // Load the PDF file
            pdfjsLib.getDocument(typedArray).promise.then(function(pdf) {
                let textContent = [];
                let pendingPages = pdf.numPages;
                
                // Process each page
                for (let i = 1; i <= pdf.numPages; i++) {
                    pdf.getPage(i).then(function(page) {
                        page.getTextContent().then(function(content) {
                            // Store text content with page number for ordering
                            textContent.push({
                                page: i,
                                content: content.items.map(item => item.str).join(' ')
                            });
                            
                            pendingPages--;
                            if (pendingPages === 0) {
                                // All pages processed, create Word document
                                createWordFromPdfText(textContent, file.name.replace('.pdf', ''), fontFamily);
                            }
                        });
                    });
                }
            }).catch(function(error) {
                console.error('Error processing PDF:', error);
                alert('Error processing PDF: ' + error.message);
                document.getElementById('loading-pdf-convert').classList.remove('show');
            });
        };
        reader.readAsArrayBuffer(file);
    }
    
    // Create Word document from PDF text
    function createWordFromPdfText(textContent, fileName, fontFamily) {
        // Sort by page number
        textContent.sort((a, b) => a.page - b.page);
        
        // Using docx.js
        const { Document, Paragraph, TextRun, Packer, AlignmentType, HeadingLevel } = window.docx;
        
        // Create paragraphs from text
        const paragraphs = [];
        
        // Add a title
        paragraphs.push(
            new Paragraph({
                text: fileName,
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
            })
        );
        
        // Add a separator
        paragraphs.push(new Paragraph({
            text: "",
            spacing: {
                after: 200,
            },
        }));
        
        // Add content from each page
        textContent.forEach((page, index) => {
            // Add page header if not first page
            if (index > 0) {
                paragraphs.push(
                    new Paragraph({
                        text: "",
                        spacing: {
                            before: 300,
                        },
                    })
                );
            }
            
            // Add page content
            const pageLines = page.content.split(/\r?\n/);
            pageLines.forEach(line => {
                if (line.trim() === '') {
                    paragraphs.push(new Paragraph({ text: "" }));
                } else {
                    paragraphs.push(
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: line,
                                    font: fontFamily,
                                    size: 24 // 12pt
                                })
                            ]
                        })
                    );
                }
            });
        });
        
        // Create document
        const doc = new Document({
            sections: [{
                properties: {},
                children: paragraphs
            }]
        });
        
        // Generate and save document
        Packer.toBlob(doc).then(blob => {
            saveAs(blob, fileName + '.docx');
            document.getElementById('loading-pdf-convert').classList.remove('show');
            
            // Save to recent conversions
            const combinedText = textContent.map(page => page.content).join(' ');
            addConversion('pdf-to-word', fileName + '.docx', 'pdf', 'docx', combinedText);
        }).catch(error => {
            console.error("Error generating Word document:", error);
            alert("Error generating Word document: " + error.message);
            document.getElementById('loading-pdf-convert').classList.remove('show');
        });
    }
    
    // Clear history button
    document.getElementById('clear-history-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your conversion history?')) {
            clearConversionHistory();
        }
    });
});
