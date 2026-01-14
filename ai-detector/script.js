// ===================================
// AI Detector & Text Humanizer Script
// LinkShare - AI Tools
// ===================================

// ===== Tab Switching Functionality =====
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });

    // Initialize event listeners
    initializeDetector();
    initializeHumanizer();
});

// ===== AI Detector Functionality =====
function initializeDetector() {
    const detectorInput = document.getElementById('detector-input');
    const detectBtn = document.getElementById('detect-btn');
    const charCount = document.getElementById('detector-char-count');

    // Character counter
    detectorInput.addEventListener('input', () => {
        charCount.textContent = detectorInput.value.length;
    });

    // Analyze button
    detectBtn.addEventListener('click', analyzeText);
}

function analyzeText() {
    const input = document.getElementById('detector-input').value.trim();
    const resultSection = document.getElementById('detector-result');
    const detectBtn = document.getElementById('detect-btn');

    if (input.length < 50) {
        alert('Please enter at least 50 characters for accurate analysis.');
        return;
    }

    // Show loading state
    detectBtn.disabled = true;
    detectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';

    // Simulate API call with timeout
    setTimeout(() => {
        const analysis = performAIDetection(input);
        displayDetectionResults(analysis);
        
        // Reset button
        detectBtn.disabled = false;
        detectBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Text';
        
        // Show results
        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 1500);
}

function performAIDetection(text) {
    // Sophisticated AI detection algorithm (simulation)
    let aiScore = 0;
    const words = text.split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Factor 1: Common AI phrases and patterns
    const aiPhrases = [
        'it is important to note',
        'it\'s worth noting',
        'in conclusion',
        'furthermore',
        'moreover',
        'additionally',
        'however',
        'therefore',
        'consequently',
        'delve into',
        'dive into',
        'explore the',
        'it is essential',
        'crucial to understand',
        'comprehensive',
        'multifaceted',
        'paradigm',
        'leverage',
        'optimize',
        'utilize'
    ];

    let phraseMatches = 0;
    aiPhrases.forEach(phrase => {
        if (text.toLowerCase().includes(phrase)) {
            phraseMatches++;
        }
    });
    aiScore += Math.min(phraseMatches * 5, 30);

    // Factor 2: Sentence structure uniformity
    const avgSentenceLength = words.length / sentences.length;
    if (avgSentenceLength > 15 && avgSentenceLength < 25) {
        aiScore += 15; // AI tends to have consistent sentence length
    }

    // Factor 3: Vocabulary complexity
    const longWords = words.filter(w => w.length > 8).length;
    const complexityRatio = longWords / words.length;
    if (complexityRatio > 0.15) {
        aiScore += 20; // AI often uses complex vocabulary
    }

    // Factor 4: Repetitive sentence starters
    const sentenceStarters = sentences.map(s => s.trim().split(' ')[0].toLowerCase());
    const uniqueStarters = new Set(sentenceStarters);
    if (sentenceStarters.length - uniqueStarters.size > 2) {
        aiScore += 10;
    }

    // Factor 5: Lack of personal pronouns
    const personalPronouns = ['i', 'me', 'my', 'we', 'our', 'us'];
    const pronounCount = words.filter(w => 
        personalPronouns.includes(w.toLowerCase())
    ).length;
    if (pronounCount < words.length * 0.02) {
        aiScore += 15; // AI text often lacks personal touch
    }

    // Factor 6: Perfect grammar indicators
    const hasTypos = /\b(teh|hte|adn|taht|waht)\b/i.test(text);
    if (!hasTypos && text.length > 200) {
        aiScore += 10; // Perfect grammar might indicate AI
    }

    // Normalize score to 0-100
    aiScore = Math.min(Math.max(aiScore, 0), 100);
    
    // Add some randomness for realism
    aiScore += Math.random() * 10 - 5;
    aiScore = Math.min(Math.max(Math.round(aiScore), 0), 100);

    return {
        aiProbability: aiScore,
        humanProbability: 100 - aiScore,
        wordCount: words.length,
        sentenceCount: sentences.length,
        avgSentenceLength: Math.round(avgSentenceLength),
        aiPhraseCount: phraseMatches
    };
}

function displayDetectionResults(analysis) {
    const aiScore = document.getElementById('ai-score');
    const humanScore = document.getElementById('human-score');
    const resultMessage = document.getElementById('result-message');
    const resultDetails = document.getElementById('result-details');
    const aiCircle = document.getElementById('ai-score-circle');
    const humanCircle = document.getElementById('human-score-circle');

    // Update scores with animation
    animateScore(aiScore, analysis.aiProbability);
    animateScore(humanScore, analysis.humanProbability);

    // Color code based on AI probability
    if (analysis.aiProbability >= 70) {
        aiCircle.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
        aiScore.style.color = '#fff';
        resultMessage.innerHTML = `
            <strong style="color: #dc3545;">⚠️ High AI Probability Detected</strong><br>
            This text shows strong indicators of AI-generated content.
        `;
    } else if (analysis.aiProbability >= 40) {
        aiCircle.style.background = 'linear-gradient(135deg, #ffc107, #ff9800)';
        resultMessage.innerHTML = `
            <strong style="color: #ff9800;">⚡ Mixed Indicators</strong><br>
            This text shows some AI characteristics but may be human-edited AI content.
        `;
    } else {
        humanCircle.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        humanScore.style.color = '#fff';
        resultMessage.innerHTML = `
            <strong style="color: #28a745;">✅ Likely Human-Written</strong><br>
            This text shows characteristics of authentic human writing.
        `;
    }

    // Display detailed analysis
    resultDetails.innerHTML = `
        <h4 style="color: #128C7E; margin-bottom: 1rem;">📊 Detailed Analysis</h4>
        <ul style="list-style: none; padding: 0;">
            <li style="padding: 0.5rem 0; border-bottom: 1px solid #e0e0e0;">
                <strong>Word Count:</strong> ${analysis.wordCount} words
            </li>
            <li style="padding: 0.5rem 0; border-bottom: 1px solid #e0e0e0;">
                <strong>Sentences:</strong> ${analysis.sentenceCount}
            </li>
            <li style="padding: 0.5rem 0; border-bottom: 1px solid #e0e0e0;">
                <strong>Avg. Sentence Length:</strong> ${analysis.avgSentenceLength} words
            </li>
            <li style="padding: 0.5rem 0; border-bottom: 1px solid #e0e0e0;">
                <strong>AI Phrase Matches:</strong> ${analysis.aiPhraseCount}
            </li>
            <li style="padding: 0.5rem 0;">
                <strong>Confidence Level:</strong> ${getConfidenceLevel(analysis.aiProbability)}
            </li>
        </ul>
        <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
            <em>Note: This is a simulation for demonstration purposes. For production use, integrate with professional AI detection APIs like GPTZero or Originality.ai.</em>
        </p>
    `;
}

function animateScore(element, targetValue) {
    let current = 0;
    const increment = targetValue / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
            current = targetValue;
            clearInterval(timer);
        }
        element.textContent = Math.round(current) + '%';
    }, 20);
}

function getConfidenceLevel(score) {
    if (score >= 80 || score <= 20) return 'High';
    if (score >= 60 || score <= 40) return 'Medium';
    return 'Low';
}

// ===== Text Humanizer Functionality =====
function initializeHumanizer() {
    const humanizerInput = document.getElementById('humanizer-input');
    const humanizeBtn = document.getElementById('humanize-btn');
    const charCount = document.getElementById('humanizer-char-count');
    const copyBtn = document.getElementById('copy-humanized');

    // Character counter
    humanizerInput.addEventListener('input', () => {
        charCount.textContent = humanizerInput.value.length;
    });

    // Humanize button
    humanizeBtn.addEventListener('click', humanizeText);

    // Copy button
    copyBtn.addEventListener('click', copyHumanizedText);
}

function humanizeText() {
    const input = document.getElementById('humanizer-input').value.trim();
    const resultSection = document.getElementById('humanizer-result');
    const humanizeBtn = document.getElementById('humanize-btn');

    if (input.length < 50) {
        alert('Please enter at least 50 characters to humanize.');
        return;
    }

    // Show loading state
    humanizeBtn.disabled = true;
    humanizeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Humanizing...';

    // Simulate API call
    setTimeout(() => {
        const humanized = performHumanization(input);
        displayHumanizedText(humanized);
        
        // Reset button
        humanizeBtn.disabled = false;
        humanizeBtn.innerHTML = '<i class="fas fa-magic"></i> Humanize Text';
        
        // Show results
        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 2000);
}

function performHumanization(text) {
    // Humanization transformations
    let humanized = text;

    // 1. Replace formal AI phrases with casual alternatives
    const replacements = {
        'it is important to note that': 'worth mentioning,',
        'it\'s worth noting that': 'interestingly,',
        'in conclusion': 'to wrap up,',
        'furthermore': 'also,',
        'moreover': 'plus,',
        'additionally': 'and',
        'however': 'but',
        'therefore': 'so',
        'consequently': 'as a result,',
        'utilize': 'use',
        'implement': 'use',
        'leverage': 'use',
        'optimize': 'improve',
        'comprehensive': 'complete',
        'multifaceted': 'complex',
        'paradigm': 'model',
        'delve into': 'explore',
        'dive into': 'look at',
        'it is essential to': 'you should',
        'crucial to understand': 'important to know'
    };

    Object.keys(replacements).forEach(formal => {
        const regex = new RegExp(formal, 'gi');
        humanized = humanized.replace(regex, replacements[formal]);
    });

    // 2. Add conversational elements
    const sentences = humanized.split(/([.!?]+)/);
    for (let i = 0; i < sentences.length; i += 2) {
        if (sentences[i] && sentences[i].trim().length > 0) {
            // Randomly add conversational starters
            if (Math.random() > 0.7 && i > 0) {
                const starters = ['Look,', 'Here\'s the thing:', 'Actually,', 'You know what?', 'Honestly,'];
                sentences[i] = ' ' + starters[Math.floor(Math.random() * starters.length)] + ' ' + sentences[i].trim();
            }
        }
    }
    humanized = sentences.join('');

    // 3. Add contractions
    humanized = humanized.replace(/\bdo not\b/gi, 'don\'t');
    humanized = humanized.replace(/\bcannot\b/gi, 'can\'t');
    humanized = humanized.replace(/\bwill not\b/gi, 'won\'t');
    humanized = humanized.replace(/\bit is\b/gi, 'it\'s');
    humanized = humanized.replace(/\bthey are\b/gi, 'they\'re');
    humanized = humanized.replace(/\bwe are\b/gi, 'we\'re');

    // 4. Vary sentence structure
    humanized = humanized.replace(/\. ([A-Z])/g, (match, p1) => {
        if (Math.random() > 0.8) {
            return ' - ' + p1;
        }
        return match;
    });

    // 5. Add occasional emphasis
    const words = humanized.split(' ');
    for (let i = 0; i < words.length; i++) {
        if (words[i].length > 8 && Math.random() > 0.95) {
            words[i] = '*' + words[i] + '*'; // Markdown emphasis
        }
    }
    humanized = words.join(' ');

    return humanized;
}

function displayHumanizedText(text) {
    const output = document.getElementById('humanized-output');
    output.textContent = text;
}

function copyHumanizedText() {
    const output = document.getElementById('humanized-output');
    const text = output.textContent;
    const copyBtn = document.getElementById('copy-humanized');

    navigator.clipboard.writeText(text).then(() => {
        // Show success feedback
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.style.background = '#28a745';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.style.background = '';
        }, 2000);
    }).catch(err => {
        alert('Failed to copy text. Please select and copy manually.');
    });
}

// ===== Utility Functions =====

// Prevent form submission on enter
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab.id === 'detector-tab') {
            analyzeText();
        } else {
            humanizeText();
        }
    }
});

// Add keyboard shortcuts info
console.log('💡 Keyboard Shortcut: Ctrl + Enter to analyze/humanize text');
