// ===================================
// Word Counter Tool Script
// LinkShare - Text Analysis Tools
// ===================================

document.addEventListener('DOMContentLoaded', function () {
    const textInput = document.getElementById('text-input');
    const clearBtn = document.getElementById('clear-btn');
    const copyStatsBtn = document.getElementById('copy-stats-btn');

    // Initialize event listeners
    textInput.addEventListener('input', updateStatistics);
    clearBtn.addEventListener('click', clearText);
    copyStatsBtn.addEventListener('click', copyStatistics);

    // Initialize with empty stats
    updateStatistics();
});

// ===== Main Statistics Update Function =====
function updateStatistics() {
    const text = document.getElementById('text-input').value;

    // Calculate all metrics
    const stats = {
        words: countWords(text),
        characters: countCharacters(text),
        charactersNoSpace: countCharactersNoSpace(text),
        sentences: countSentences(text),
        headings: countHeadings(text),
        readingTime: calculateReadingTime(text),
        speakingTime: calculateSpeakingTime(text),
        avgWordLength: calculateAvgWordLength(text),
        avgSentenceLength: calculateAvgSentenceLength(text),
        longestWord: findLongestWord(text)
    };

    // Update all displays
    updateDisplay(stats);
}

// ===== Counting Functions =====

function countWords(text) {
    if (!text.trim()) return 0;
    // Split by whitespace and filter empty strings
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
}

function countCharacters(text) {
    return text.length;
}

function countCharactersNoSpace(text) {
    return text.replace(/\s/g, '').length;
}

function countSentences(text) {
    if (!text.trim()) return 0;
    // Split by sentence-ending punctuation
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    return sentences.length;
}

function countHeadings(text) {
    if (!text.trim()) return 0;
    let headingCount = 0;
    const lines = text.split('\n');

    for (let line of lines) {
        const trimmedLine = line.trim();
        // Check for markdown-style headings (starting with #)
        if (trimmedLine.startsWith('#')) {
            headingCount++;
            continue;
        }

        // Check for title case lines (potential headings)
        // A line is considered a heading if:
        // 1. It's not too long (< 100 chars)
        // 2. It doesn't end with sentence-ending punctuation
        // 3. Most words start with capital letters
        if (trimmedLine.length > 0 && trimmedLine.length < 100 &&
            !/[.!?]$/.test(trimmedLine)) {
            const words = trimmedLine.split(/\s+/);
            const capitalizedWords = words.filter(word => /^[A-Z]/.test(word));
            if (capitalizedWords.length >= words.length * 0.6 && words.length >= 2) {
                headingCount++;
            }
        }
    }

    return headingCount;
}

function calculateReadingTime(text) {
    const words = countWords(text);
    // Average reading speed: 200-250 words per minute
    const wordsPerMinute = 225;
    const minutes = words / wordsPerMinute;

    if (minutes < 1) {
        return '< 1 min';
    }
    return Math.ceil(minutes) + ' min';
}

function calculateSpeakingTime(text) {
    const words = countWords(text);
    // Average speaking speed (slow): 100-130 words per minute
    const wordsPerMinute = 115;
    const minutes = words / wordsPerMinute;

    if (minutes < 1) {
        return '< 1 min';
    }
    return Math.ceil(minutes) + ' min';
}

function calculateAvgWordLength(text) {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0) return 0;

    const totalLength = words.reduce((sum, word) => {
        // Remove punctuation for accurate length
        const cleanWord = word.replace(/[^\w]/g, '');
        return sum + cleanWord.length;
    }, 0);

    return (totalLength / words.length).toFixed(1);
}

function calculateAvgSentenceLength(text) {
    const words = countWords(text);
    const sentences = countSentences(text);

    if (sentences === 0) return 0;
    return Math.round(words / sentences);
}

function findLongestWord(text) {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0) return '-';

    let longest = '';
    words.forEach(word => {
        // Remove punctuation
        const cleanWord = word.replace(/[^\w]/g, '');
        if (cleanWord.length > longest.length) {
            longest = cleanWord;
        }
    });

    return longest || '-';
}

// ===== Display Update Functions =====

function updateDisplay(stats) {
    // Update numerical values
    document.getElementById('word-count').textContent = stats.words;
    document.getElementById('char-count').textContent = stats.characters;
    document.getElementById('char-no-space-count').textContent = stats.charactersNoSpace;
    document.getElementById('sentence-count').textContent = stats.sentences;
    document.getElementById('heading-count').textContent = stats.headings;
    document.getElementById('reading-time').textContent = stats.readingTime;

    // Update additional insights
    document.getElementById('avg-word-length').textContent = stats.avgWordLength + ' characters';
    document.getElementById('avg-sentence-length').textContent = stats.avgSentenceLength + ' words';
    document.getElementById('longest-word').textContent = stats.longestWord;
    document.getElementById('speaking-time').textContent = stats.speakingTime;

    // Update progress bars and percentages
    updateProgressBars(stats);
}

function updateProgressBars(stats) {
    // Define maximum values for progress calculation
    const maxValues = {
        words: 1000,
        characters: 5000,
        charactersNoSpace: 4000,
        sentences: 50,
        headings: 20,
        readingTime: 5 // minutes
    };

    // Words
    updateProgressBar('word', stats.words, maxValues.words);

    // Characters
    updateProgressBar('char', stats.characters, maxValues.characters);

    // Characters without spaces
    updateProgressBar('char-no-space', stats.charactersNoSpace, maxValues.charactersNoSpace);

    // Sentences
    updateProgressBar('sentence', stats.sentences, maxValues.sentences);

    // Headings
    updateProgressBar('heading', stats.headings, maxValues.headings);

    // Reading time
    const readingMinutes = parseInt(stats.readingTime) || 0;
    updateProgressBar('reading', readingMinutes, maxValues.readingTime);
}

function updateProgressBar(id, value, maxValue) {
    const progressBar = document.getElementById(`${id}-progress`);
    const percentElement = document.getElementById(`${id}-percent`);

    // Calculate percentage (cap at 100%)
    let percentage = Math.min((value / maxValue) * 100, 100);

    // For better visual representation, ensure minimum visibility if value > 0
    if (value > 0 && percentage < 2) {
        percentage = 2;
    }

    // Update progress bar width
    progressBar.style.width = percentage + '%';

    // Update percentage text
    percentElement.textContent = Math.round(percentage) + '%';

    // Add color variation based on percentage
    if (percentage >= 80) {
        progressBar.style.background = 'linear-gradient(90deg, #28a745, #20c997)';
    } else if (percentage >= 50) {
        progressBar.style.background = 'linear-gradient(90deg, #ffc107, #fd7e14)';
    } else {
        progressBar.style.background = 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))';
    }
}

// ===== Action Functions =====

function clearText() {
    const textInput = document.getElementById('text-input');

    // Confirm if there's text
    if (textInput.value.trim().length > 0) {
        if (confirm('Are you sure you want to clear all text?')) {
            textInput.value = '';
            updateStatistics();
            textInput.focus();
        }
    }
}

function copyStatistics() {
    const text = document.getElementById('text-input').value;
    const stats = {
        words: countWords(text),
        characters: countCharacters(text),
        charactersNoSpace: countCharactersNoSpace(text),
        sentences: countSentences(text),
        headings: countHeadings(text),
        readingTime: calculateReadingTime(text),
        speakingTime: calculateSpeakingTime(text),
        avgWordLength: calculateAvgWordLength(text),
        avgSentenceLength: calculateAvgSentenceLength(text),
        longestWord: findLongestWord(text)
    };

    // Format statistics as text
    const statsText = `
📊 TEXT STATISTICS
═══════════════════════════════

📝 Basic Counts:
   • Total Words: ${stats.words}
   • Total Characters: ${stats.characters}
   • Characters (No Spaces): ${stats.charactersNoSpace}
   • Total Sentences: ${stats.sentences}
   • Total Headings: ${stats.headings}

⏱️ Time Estimates:
   • Reading Time: ${stats.readingTime}
   • Speaking Time (Slow): ${stats.speakingTime}

💡 Additional Insights:
   • Average Word Length: ${stats.avgWordLength} characters
   • Average Sentence Length: ${stats.avgSentenceLength} words
   • Longest Word: ${stats.longestWord}

Generated by LinkShare Word Counter
https://www.linkshare.online/word-counter
    `.trim();

    // Copy to clipboard
    navigator.clipboard.writeText(statsText).then(() => {
        // Show success feedback
        const copyBtn = document.getElementById('copy-stats-btn');
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.style.background = '#28a745';
        copyBtn.style.color = '#fff';

        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.style.background = '';
            copyBtn.style.color = '';
        }, 2000);
    }).catch(err => {
        alert('Failed to copy statistics. Please try again.');
        console.error('Copy failed:', err);
    });
}

// ===== Keyboard Shortcuts =====

document.addEventListener('keydown', function (e) {
    // Ctrl/Cmd + K to clear text
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        clearText();
    }

    // Ctrl/Cmd + Shift + C to copy statistics
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        copyStatistics();
    }
});

// ===== Auto-save to localStorage (optional) =====

// Save text to localStorage on input
document.getElementById('text-input').addEventListener('input', function () {
    localStorage.setItem('wordCounterText', this.value);
});

// Restore text from localStorage on page load
window.addEventListener('load', function () {
    const savedText = localStorage.getItem('wordCounterText');
    if (savedText) {
        document.getElementById('text-input').value = savedText;
        updateStatistics();
    }
});

// ===== Console Info =====
console.log('💡 Word Counter Keyboard Shortcuts:');
console.log('   • Ctrl/Cmd + K: Clear text');
console.log('   • Ctrl/Cmd + Shift + C: Copy statistics');
console.log('✨ Your text is automatically saved in your browser!');
