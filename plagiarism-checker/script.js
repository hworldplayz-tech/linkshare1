// ===================================
// Plagiarism Checker Tool Script
// LinkShare - Content Analysis Tools
// ===================================

document.addEventListener('DOMContentLoaded', function () {
    const textInput = document.getElementById('text-input');
    const checkBtn = document.getElementById('check-btn');
    const charCount = document.getElementById('char-count');
    const wordCount = document.getElementById('word-count');

    // Initialize event listeners
    textInput.addEventListener('input', updateCounters);
    checkBtn.addEventListener('click', checkPlagiarism);

    // Initialize counters
    updateCounters();
});

// ===== Update Character and Word Counters =====
function updateCounters() {
    const text = document.getElementById('text-input').value;
    const charCount = document.getElementById('char-count');
    const wordCount = document.getElementById('word-count');

    charCount.textContent = text.length;

    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    wordCount.textContent = words.length;
}

// ===== Main Plagiarism Check Function =====
function checkPlagiarism() {
    const text = document.getElementById('text-input').value.trim();
    const resultSection = document.getElementById('result-section');
    const checkBtn = document.getElementById('check-btn');

    if (text.length < 50) {
        alert('Please enter at least 50 characters for accurate plagiarism detection.');
        return;
    }

    // Show loading state
    checkBtn.disabled = true;
    checkBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    checkBtn.classList.add('loading');

    // Simulate API call with timeout
    setTimeout(() => {
        const analysis = performPlagiarismCheck(text);
        displayResults(analysis);

        // Reset button
        checkBtn.disabled = false;
        checkBtn.innerHTML = '<i class="fas fa-search"></i> Check for Plagiarism';
        checkBtn.classList.remove('loading');

        // Show results
        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 2000);
}

// ===== Plagiarism Detection Algorithm =====
function performPlagiarismCheck(text) {
    // Split text into sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const totalSentences = sentences.length;

    // Common phrases database (simulated plagiarism detection)
    const commonPhrases = [
        'the quick brown fox',
        'lorem ipsum dolor sit amet',
        'to be or not to be',
        'all that glitters is not gold',
        'a picture is worth a thousand words',
        'actions speak louder than words',
        'the early bird catches the worm',
        'better late than never',
        'practice makes perfect',
        'time is money',
        'knowledge is power',
        'honesty is the best policy',
        'where there is a will there is a way',
        'the pen is mightier than the sword',
        'two heads are better than one'
    ];

    // Check for common phrases and patterns
    let matchedSentences = 0;
    let matchedContent = [];

    sentences.forEach(sentence => {
        const lowerSentence = sentence.toLowerCase().trim();

        // Check against common phrases
        commonPhrases.forEach(phrase => {
            if (lowerSentence.includes(phrase)) {
                matchedSentences++;
                matchedContent.push({
                    text: sentence.trim(),
                    reason: 'Common phrase detected'
                });
            }
        });

        // Check for very common sentence starters (potential plagiarism indicators)
        const commonStarters = [
            'according to',
            'research shows that',
            'studies have shown',
            'it is widely known that',
            'experts agree that',
            'it has been proven that'
        ];

        commonStarters.forEach(starter => {
            if (lowerSentence.startsWith(starter) && Math.random() > 0.5) {
                if (!matchedContent.some(m => m.text === sentence.trim())) {
                    matchedSentences++;
                    matchedContent.push({
                        text: sentence.trim(),
                        reason: 'Commonly used phrase pattern'
                    });
                }
            }
        });
    });

    // Add some randomness for demonstration (simulating web search results)
    const randomFactor = Math.random() * 0.15; // 0-15% random variation
    const basePlagiarismScore = (matchedSentences / totalSentences) * 100;
    const plagiarismScore = Math.min(Math.round(basePlagiarismScore + (randomFactor * 100)), 100);
    const uniqueScore = 100 - plagiarismScore;
    const uniqueSentences = totalSentences - matchedSentences;

    return {
        plagiarismScore: plagiarismScore,
        uniqueScore: uniqueScore,
        totalSentences: totalSentences,
        uniqueSentences: uniqueSentences,
        matchedSentences: matchedSentences,
        matchedContent: matchedContent.slice(0, 5) // Limit to 5 examples
    };
}

// ===== Display Results =====
function displayResults(analysis) {
    // Update circular progress indicators
    updateCircularProgress('progress-circle', analysis.plagiarismScore, '#dc3545');
    updateCircularProgress('unique-progress-circle', analysis.uniqueScore, '#28a745');

    // Update score values
    document.getElementById('plagiarism-score').textContent = analysis.plagiarismScore + '%';
    document.getElementById('unique-score').textContent = analysis.uniqueScore + '%';

    // Update color based on plagiarism score
    const plagiarismCircle = document.getElementById('plagiarism-circle');
    const uniqueCircle = document.getElementById('unique-circle');

    if (analysis.plagiarismScore >= 50) {
        plagiarismCircle.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
    } else if (analysis.plagiarismScore >= 25) {
        plagiarismCircle.style.background = 'linear-gradient(135deg, #ffc107, #ff9800)';
    } else {
        plagiarismCircle.style.background = 'linear-gradient(135deg, #f8f9fa, #e9ecef)';
    }

    if (analysis.uniqueScore >= 75) {
        uniqueCircle.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
    }

    // Update result message
    const resultMessage = document.getElementById('result-message');
    if (analysis.plagiarismScore >= 50) {
        resultMessage.innerHTML = `
            <strong style="color: #dc3545;">⚠️ High Plagiarism Detected</strong><br>
            Your content shows significant similarity to existing sources. Major revision recommended.
        `;
    } else if (analysis.plagiarismScore >= 25) {
        resultMessage.innerHTML = `
            <strong style="color: #ff9800;">⚡ Moderate Similarity Found</strong><br>
            Some content matches existing sources. Review and add proper citations or rephrase.
        `;
    } else if (analysis.plagiarismScore >= 15) {
        resultMessage.innerHTML = `
            <strong style="color: #ffc107;">✓ Minor Matches Detected</strong><br>
            Low similarity detected. Content is mostly original with some common phrases.
        `;
    } else {
        resultMessage.innerHTML = `
            <strong style="color: #28a745;">✅ Excellent - Highly Original</strong><br>
            Your content appears to be highly original with minimal similarity to existing sources.
        `;
    }

    // Update detailed analysis
    document.getElementById('total-sentences').textContent = analysis.totalSentences;
    document.getElementById('unique-sentences').textContent = analysis.uniqueSentences;
    document.getElementById('matched-sentences').textContent = analysis.matchedSentences;
    document.getElementById('similarity-score').textContent = analysis.plagiarismScore + '%';

    // Display matched content if any
    const matchedContent = document.getElementById('matched-content');
    const matchedList = document.getElementById('matched-list');

    if (analysis.matchedContent.length > 0) {
        matchedContent.style.display = 'block';
        matchedList.innerHTML = '';

        analysis.matchedContent.forEach((match, index) => {
            const matchItem = document.createElement('div');
            matchItem.className = 'matched-item';
            matchItem.innerHTML = `
                <strong>Match ${index + 1}:</strong> ${match.text}<br>
                <small style="color: #666;"><em>${match.reason}</em></small>
            `;
            matchedList.appendChild(matchItem);
        });
    } else {
        matchedContent.style.display = 'none';
    }
}

// ===== Update Circular Progress =====
function updateCircularProgress(elementId, percentage, color) {
    const circle = document.getElementById(elementId);
    const radius = 85;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    // Animate the progress
    circle.style.strokeDashoffset = offset;
    circle.style.stroke = color;
}

// ===== Keyboard Shortcuts =====
document.addEventListener('keydown', function (e) {
    // Ctrl/Cmd + Enter to check plagiarism
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        checkPlagiarism();
    }
});

// ===== Console Info =====
console.log('💡 Plagiarism Checker Keyboard Shortcuts:');
console.log('   • Ctrl/Cmd + Enter: Check for plagiarism');
console.log('⚠️ Note: This is a demonstration tool. For production use, integrate with professional plagiarism detection APIs like Copyscape or Turnitin.');
