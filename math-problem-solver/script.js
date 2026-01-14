// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBH_lgpYQtF0KHodqs0sL7dGjhJWjNs2SM",
    authDomain: "linkshare-a5b4b.firebaseapp.com",
    databaseURL: "https://linkshare-a5b4b-default-rtdb.firebaseio.com",
    projectId: "linkshare-a5b4b",
    storageBucket: "linkshare-a5b4b.appspot.com",
    messagingSenderId: "1042493714343",
    appId: "1:1042493714343:web:b4f7a6d5a5d8a5b1c5d5a5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // API Key Status
    const apiKeyStatus = document.getElementById('api-key-status');

    // Input Tabs
    const inputTabs = document.querySelectorAll('.input-tab');
    const inputContents = document.querySelectorAll('.input-content');

    // Text Input
    const mathProblemInput = document.getElementById('math-problem');
    const solveTextBtn = document.getElementById('solve-text-btn');

    // Image Input
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const solveImageBtn = document.getElementById('solve-image-btn');

    // PDF Input
    const pdfUpload = document.getElementById('pdf-upload');
    const pdfPreview = document.getElementById('pdf-preview');
    const solvePdfBtn = document.getElementById('solve-pdf-btn');

    // Output
    const outputContainer = document.getElementById('output-container');
    const solutionOutput = document.getElementById('solution-output');
    const errorMessage = document.getElementById('error-message');

    // Example Problems
    const exampleProblems = document.querySelectorAll('.example-problem');

    // Set API key status
    apiKeyStatus.innerHTML = '<span class="api-key-status-success"><i class="fas fa-check-circle"></i> API Key is already set and ready to use</span>';
    
    inputTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab));
    });

    solveTextBtn.addEventListener('click', solveTextProblem);
    
    imageUpload.addEventListener('change', handleImageUpload);
    solveImageBtn.addEventListener('click', solveImageProblem);
    
    pdfUpload.addEventListener('change', handlePdfUpload);
    solvePdfBtn.addEventListener('click', solvePdfProblem);

    exampleProblems.forEach(example => {
        example.addEventListener('click', () => {
            mathProblemInput.value = example.textContent;
            // Switch to text input tab
            switchTab(inputTabs[0]);
        });
    });



    // Tab Switching
    function switchTab(tab) {
        // Remove active class from all tabs
        inputTabs.forEach(t => t.classList.remove('active'));
        inputContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to selected tab
        tab.classList.add('active');
        
        // Show corresponding content
        const tabId = tab.getAttribute('data-tab');
        document.getElementById(`${tabId}-input`).classList.add('active');
    }

    // File Handling Functions
    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Check if file is an image
        if (!file.type.match('image.*')) {
            showError('Please select a valid image file');
            return;
        }
        
        // Display image preview
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.classList.add('show');
            solveImageBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    async function handlePdfUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Check if file is a PDF
        if (file.type !== 'application/pdf') {
            showError('Please select a valid PDF file');
            return;
        }
        
        // Clear previous preview
        pdfPreview.innerHTML = '';
        pdfPreview.classList.add('show');
        
        // Read the PDF file
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                // Initialize PDF.js
                const loadingTask = pdfjsLib.getDocument(e.target.result);
                const pdf = await loadingTask.promise;
                
                // We'll just preview the first page for simplicity
                const numPages = pdf.numPages;
                if (numPages > 0) {
                    const page = await pdf.getPage(1);
                    
                    // Create a canvas for the PDF page
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    const viewport = page.getViewport({ scale: 1.5 });
                    
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    canvas.classList.add('pdf-page');
                    
                    // Render the PDF page to the canvas
                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };
                    
                    await page.render(renderContext).promise;
                    
                    // Add the canvas to the preview
                    pdfPreview.appendChild(canvas);
                    
                    // Enable the solve button
                    solvePdfBtn.disabled = false;
                    
                    // Add page info
                    const pageInfo = document.createElement('p');
                    pageInfo.textContent = `Page 1 of ${numPages} (only first page will be used for solving)`;
                    pdfPreview.appendChild(pageInfo);
                }
            } catch (error) {
                console.error('Error loading PDF:', error);
                showError('Error loading PDF. Please try another file.');
            }
        };
        reader.readAsArrayBuffer(file);
    }

    // Solving Functions
    async function solveTextProblem() {
        const problem = mathProblemInput.value.trim();
        if (!problem) {
            showError('Please enter a math problem');
            return;
        }
        
        // API Key provided by the user
        const API_KEY = "AIzaSyCNK0qJXxj-_ZcvxFZ4BUaHrHyTL2XS8dM";
        
        // Show loading state
        showLoading();
        
        try {
            const prompt = `Solve the following math problem and show the step-by-step solution: ${problem}`;
            const response = await callGeminiAPI(API_KEY, prompt);
            displaySolution(response);
            saveToHistory('text', problem, response);
        } catch (error) {
            console.error('Error solving problem:', error);
            showError('Error solving problem. Please try again.');
            hideLoading();
        }
    }

    async function solveImageProblem() {
        if (!imagePreview.src || !imagePreview.classList.contains('show')) {
            showError('Please upload an image first');
            return;
        }
        
        // API Key provided by the user
        const API_KEY = "AIzaSyCNK0qJXxj-_ZcvxFZ4BUaHrHyTL2XS8dM";
        
        // Show loading state
        showLoading();
        
        try {
            const imageData = imagePreview.src;
            const prompt = "Analyze the image provided and solve the math problem shown. Provide a detailed, step-by-step solution.";
            const response = await callGeminiAPIWithImage(API_KEY, prompt, imageData);
            displaySolution(response);
            saveToHistory('image', 'Image Math Problem', response);
        } catch (error) {
            console.error('Error solving image problem:', error);
            showError('Error solving image problem. Please try again.');
            hideLoading();
        }
    }

    async function solvePdfProblem() {
        if (!pdfPreview.classList.contains('show')) {
            showError('Please upload a PDF first');
            return;
        }
        
        // API Key provided by the user
        const API_KEY = "AIzaSyCNK0qJXxj-_ZcvxFZ4BUaHrHyTL2XS8dM";
        
        // Show loading state
        showLoading();
        
        try {
            // Get the canvas from the PDF preview
            const canvas = pdfPreview.querySelector('canvas');
            if (!canvas) {
                throw new Error('PDF preview not available');
            }
            
            // Convert canvas to image data URL
            const imageData = canvas.toDataURL('image/png');
            const prompt = "Solve the math problem presented in this PDF and provide a detailed, step-by-step solution.";
            const response = await callGeminiAPIWithImage(API_KEY, prompt, imageData);
            displaySolution(response);
            saveToHistory('pdf', 'PDF Math Problem', response);
        } catch (error) {
            console.error('Error solving PDF problem:', error);
            showError('Error solving PDF problem. Please try again.');
            hideLoading();
        }
    }

    // Gemini API Functions
    async function callGeminiAPI(apiKey, prompt) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const requestBody = {
            contents: [
                {
                    parts: [
                        { text: prompt }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.2,
                topK: 32,
                topP: 0.95,
                maxOutputTokens: 8192
            }
        };
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${errorData.error.message || response.statusText}`);
        }
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    async function callGeminiAPIWithImage(apiKey, prompt, imageData) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-vision:generateContent?key=${apiKey}`;
        
        // Extract the base64 data from the data URL
        const base64Data = imageData.split(',')[1];
        
        const requestBody = {
            contents: [
                {
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: base64Data
                            }
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.2,
                topK: 32,
                topP: 0.95,
                maxOutputTokens: 8192
            }
        };
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${errorData.error.message || response.statusText}`);
        }
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    // Utility Functions
    function getApiKey() {
        // Return the hardcoded API key
        return API_KEY;
    }

    function showLoading() {
        // Clear previous solution
        solutionOutput.innerHTML = '';
        
        // Add loading spinner
        outputContainer.classList.add('loading');
        outputContainer.innerHTML = `
            <div class="spinner"></div>
            <p>Solving your problem...</p>
        `;
    }

    function hideLoading() {
        outputContainer.classList.remove('loading');
    }

    function displaySolution(solution) {
        // Hide loading state
        hideLoading();
        
        // Display solution with proper formatting
        outputContainer.innerHTML = `
            <h2 class="solution-title">Solution</h2>
            <div id="solution-content" class="solution-content">${formatSolution(solution)}</div>
        `;
        
        // Render any math expressions
        renderMathExpressions();
    }

    function formatSolution(text) {
        // Convert markdown to HTML
        let formatted = text
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\`(.*?)\`/g, '<code>$1</code>');
        
        // Wrap in paragraph tags
        formatted = `<p>${formatted}</p>`;
        
        return formatted;
    }

    function renderMathExpressions() {
        // Use KaTeX to render math expressions
        renderMathInElement(document.getElementById('solution-content'), {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false},
                {left: '\\(', right: '\\)', display: false},
                {left: '\\[', right: '\\]', display: true}
            ],
            throwOnError: false
        });
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        
        // Hide after 5 seconds
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 5000);
    }

    function saveToHistory(type, problem, solution) {
        try {
            // Create a unique ID for this history item
            const id = Date.now().toString();
            
            // Create history item
            const historyItem = {
                id,
                type,
                problem,
                solution: solution.substring(0, 100) + '...', // Store truncated solution for display
                timestamp: new Date().toISOString()
            };
            
            // Save to Firebase
            saveToFirebase(historyItem);
        } catch (error) {
            console.error('Error saving to history:', error);
        }
    }

    function saveToFirebase(historyItem) {
        // Save to Firebase database
        database.ref('math-solutions/' + historyItem.id).set(historyItem)
            .catch(error => {
                console.error('Error saving to Firebase:', error);
            });
    }
});

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
