//stylish Text Generator tool js ========================
const inputTextGenerator = document.getElementById("inputTextGenerator");
const outputTextGenerator = document.getElementById("output");

// Define character maps
const medievalMap = {
    'a': '𝖆', 'b': '𝖇', 'c': '𝖈', 'd': '𝖉', 'e': '𝖊', 'f': '𝖋', 'g': '𝖌', 'h': '𝖍',
    'i': '𝖎', 'j': '𝖏', 'k': '𝖐', 'l': '𝖑', 'm': '𝖒', 'n': '𝖓', 'o': '𝖔', 'p': '𝖕',
    'q': '𝖖', 'r': '𝖗', 's': '𝖘', 't': '𝖙', 'u': '𝖚', 'v': '𝖛', 'w': '𝖜', 'x': '𝖝',
    'y': '𝖞', 'z': '𝖟'
};

const fancyCharMap = {
    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢',
    'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫',
    's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳'
};

const bubbleMap = {
    'a': 'ⓐ', 'b': 'ⓑ', 'c': 'ⓒ', 'd': 'ⓓ', 'e': 'ⓔ', 'f': 'ⓕ', 'g': 'ⓖ', 'h': 'ⓗ',
    'i': 'ⓘ', 'j': 'ⓙ', 'k': 'ⓚ', 'l': 'ⓛ', 'm': 'ⓜ', 'n': 'ⓝ', 'o': 'ⓞ', 'p': 'ⓟ',
    'q': 'ⓠ', 'r': 'ⓡ', 's': 'ⓢ', 't': 'ⓣ', 'u': 'ⓤ', 'v': 'ⓥ', 'w': 'ⓦ', 'x': 'ⓧ',
    'y': 'ⓨ', 'z': 'ⓩ'
};

// Flipped character map for mirrored text
const flippedMap = {
    'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ',
    'h': 'ɥ', 'i': 'ᴉ', 'j': 'ɾ', 'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u',
    'o': 'o', 'p': 'd', 'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n',
    'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ', 'z': 'z',
    '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ',
    '6': '9', '7': 'ㄥ', '8': '8', '9': '6', '.': '˙', ',': '\'',
    '!': '¡', '?': '¿', '"': '„', '\'': ',', '(': ')', ')': '(',
    '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<',
    '&': '⅋', '_': '‾', '∴': '∵', '⁂': '⁂', '☆': '★', '★': '☆'
};

const styles = {
    blank: s => '\u3164\u200E\u200D',
    fullBlank: s => s.replace(/\S/g, 'ㅤ‎‍'),
 upside: s => {
        const upsideMap = {
            // Lowercase letters
            'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ',
            'h': 'ɥ', 'i': 'ᴉ', 'j': 'ɾ', 'k': 'ʞ', 'l': 'ʅ', 'm': 'ɯ', 'n': 'u',
            'o': 'o', 'p': 'd', 'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n',
            'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ', 'z': 'z',
            // Uppercase letters
            'A': '∀', 'B': '𐐒', 'C': 'Ɔ', 'D': '◖', 'E': 'Ǝ', 'F': 'Ⅎ', 'G': '⅁',
            'H': 'H', 'I': 'I', 'J': 'ſ', 'K': '⋊', 'L': '⅂', 'M': 'W', 'N': 'N',
            'O': 'O', 'P': 'Ԁ', 'Q': 'Ό', 'R': 'ᴚ', 'S': 'S', 'T': '⊥', 'U': '∩',
            'V': 'Λ', 'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z',
            // Numbers
            '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ',
            '6': '9', '7': 'ㄥ', '8': '8', '9': '6',
            // Punctuation and special characters
            '.': '˙', ',': '\'', '!': '¡', '?': '¿', '"': '„', "'": ',',
            '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{',
            '<': '>', '>': '<', '&': '⅋', '_': '‾', '-': '-',
            '\\': '/', '/': '\\', '|': '|', '+': '+', '=': '=',
            ';': '؛', ':': ':', '~': '~', '`': ',', '@': '@',
            '#': '#', '$': '$', '%': '%', '^': 'v', '*': '∗',
            ' ': ' ' // Preserve spaces
        };
        
        // Split, reverse, and transform the text
        return s.split('')
                .reverse()
                .map(c => upsideMap[c] || c)
                .join('')
                .replace(/\s+/g, ' '); // Normalize spaces
    },
    neonGlow: s => `<span style="text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0073e6, 0 0 20px #0073e6, 0 0 25px #0073e6">${s}</span>`,
    glitch: s => s.split('').map(c => `${c}҉`).join(''),
    gaming1: s => `꧁ ${s} ꧂`,
    gaming2: s => `▄︻デ ${s} ══━一`,
    gaming3: s => `★彡 ${s} 彡★`,
    matrix: s => `█▓▒░⡷⠂${s}⠐⢾░▒▓█`,
    aesthetic: s => s.split('').join(' '),
    vaporwave: s => s.split('').map(c => String.fromCharCode(0xFF00 + c.charCodeAt(0) - 0x20)).join(''),
    medieval: s => s.replace(/[A-Za-z]/g, c => medievalMap[c.toLowerCase()] || c),
    bubbles: s => s.replace(/[A-Za-z]/g, c => bubbleMap[c.toLowerCase()] || c),
    waves: s => s.split('').map(c => c + '〰️').join(''),
    reverse: s => s.split('').reverse().join(''),
    diamonds: s => `💎${s.split('').join('💎')}💎`,
    rainbow: s => s.split('').map((c, i) => 
        `<span style="color: hsl(${Math.floor(i * 360 / s.length)}, 100%, 50%)">${c}</span>`
    ).join(''),
    bold: s => s.replace(/[a-z]/gi, c => String.fromCodePoint(c.charCodeAt(0) + (c < 'a' ? 0x1D400 - 65 : 0x1D41A - 97))),
    italic: s => s.replace(/[a-z]/gi, c => String.fromCodePoint(c.charCodeAt(0) + (c < 'a' ? 0x1D434 - 65 : 0x1D44E - 97))),
    monospace: s => s.replace(/[a-z]/gi, c => String.fromCodePoint(c.charCodeAt(0) + (c < 'a' ? 0x1D670 - 65 : 0x1D68A - 97))),
    bubble: s => s.replace(/[a-z]/gi, c => "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ"[c.toLowerCase().charCodeAt(0) - 97] || c),
    tiny: s => s.replace(/[a-z]/gi, c => ({a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ғ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'})[c.toLowerCase()] || c),
    mirrored: s => {
        // First flip the text horizontally
        const flipped = s.toLowerCase().split('').map(c => flippedMap[c] || c).reverse().join('');
        // Add CSS to rotate 180 degrees
        return `<span style="display: inline-block; transform: rotate(180deg);">${flipped}</span>`;
    },
    mirroredFancy: s => {
        const flipped = s.toLowerCase().split('').map(c => flippedMap[c] || c).reverse().join('');
        return `<span style="display: inline-block; transform: rotate(180deg); background: linear-gradient(45deg, #FF79C6, #BD93F9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">${flipped}</span>`;
    },
    circledLetters: s => s.replace(/[a-z]/gi, c => String.fromCharCode((c === c.toLowerCase() ? 0x24D0 : 0x24B6) + (c.toLowerCase().charCodeAt(0) - 97))),
    shadowText: s => `<span style="text-shadow: 3px 3px 5px rgba(0,0,0,0.5);">${s}</span>`,
    hollowText: s => `<span style="color: White; -webkit-background-clip: text; background: linear-gradient(45deg, #ff6ec7, #ff8a00); border: 2px solid #ff00ff; padding: 0 5px;">${s}</span>`,
    spaced: s => s.split('').join(' '),
    doubleStruck: s => s.replace(/[A-Za-z]/g, c => String.fromCharCode(c.charCodeAt(0) + 120205)),
    cursive: s => s.replace(/[A-Za-z]/g, c => String.fromCharCode(c.charCodeAt(0) + 119951)),
    circled: s => s.replace(/[A-Za-z]/g, c => String.fromCharCode((c.toLowerCase().charCodeAt(0) - 97) + 0x24D0)),
    squares: s => s.replace(/[A-Za-z]/g, c => String.fromCharCode((c.toLowerCase().charCodeAt(0) - 97) + 0x1F130)),
    
    fancy: s => s.replace(/[A-Za-z]/g, c => fancyCharMap[c.toLowerCase()] || c),
    hearts: s => `❤️${s.split('').join('❤️')}❤️`,
    sparkles: s => `✨${s.split('').join('✨')}✨`,
    fire: s => `🔥${s.split('').join('🔥')}🔥`,
    stars: s => `⭐${s.split('').join('⭐')}⭐`,
    
};


function generateBox(title, content) {
    const escapedContent = content
        .replace(/'/g, "\\'")
        .replace(/"/g, "&quot;");
        
    return `
        <div class="style-box">
            <strong>${title}</strong>
            <p class="stylized-text">${content}</p>
            <button class="copy-btn" data-text="${escapedContent}">
                <i class="fas fa-copy"></i> <span class="copy-text">Copy</span>
            </button>
        </div>
    `;
}

function copyToClipboard(text) {
    const plainText = text.replace(/<[^>]*>/g, '');
    const btn = event.target.closest('.copy-btn');
    const copyText = btn.querySelector('.copy-text');
    
    navigator.clipboard.writeText(plainText)
        .then(() => {
            copyText.textContent = 'Copied!';
            btn.style.background = 'linear-gradient(45deg, #25D366, #128C7E)';
            
            setTimeout(() => {
                copyText.textContent = 'Copy';
                btn.style.background = 'linear-gradient(45deg, #128C7E, #25D366)';
            }, 2000);
        })
        .catch(err => {
            console.error("Failed to copy:", err);
            alert("Failed to copy text");
        });
}

// Add click event listener for copy buttons
document.addEventListener('click', function(e) {
    if (e.target.closest('.copy-btn')) {
        const btn = e.target.closest('.copy-btn');
        copyToClipboard(btn.dataset.text);
    }
});

function generateStylishText(showAll = false, fullPageUrl = null) {
    const txt = inputTextGenerator.value.trim();
    if (!txt) {
        outputTextGenerator.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                Please enter some text first
            </div>
        `;
        return;
    }
    
    const styleEntries = Object.entries(styles);
    const stylesToShow = showAll ? styleEntries : styleEntries.slice(0, 6);
    
    let html = stylesToShow
        .map(([name, styleFn]) => generateBox(
            name.charAt(0).toUpperCase() + name.slice(1),
            styleFn(txt)
        ))
        .join('');

    if (!showAll && styleEntries.length > 6) {
        if (fullPageUrl) {
            html += `
                <div style="grid-column: 1 / -1; text-align: center;">
                    <a href="${fullPageUrl}" class="show-more-btn" style="text-decoration: none;">
                        Try More Styles (${styleEntries.length - 6} more) →
                    </a>
                </div>
            `;
        } else {
            html += `
                <div style="grid-column: 1 / -1; text-align: center;">
                    <button id="showMoreBtn" class="show-more-btn">
                        Show More Styles (${styleEntries.length - 6} more)
                    </button>
                </div>
            `;
        }
    }
    
    outputTextGenerator.innerHTML = html;

    // Add event listener for show more button
    const showMoreBtn = document.getElementById('showMoreBtn');
    if (showMoreBtn) {
        showMoreBtn.style.display = 'block';
        showMoreBtn.addEventListener('click', () => generateStylishText(true));
    }
}

// Update the event listener to include URL on homepage
inputTextGenerator.addEventListener("input", () => {
    const isHomePage = window.location.pathname === '/' || window.location.pathname === '/index.html';
    generateStylishText(false, isHomePage ? '/stylish-text-generator' : null);
});

// Add CSS styles
const style = document.createElement('style');
style.textContent = `
    .copy-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        animation: slideIn 0.3s ease-out;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }

    .style-box:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 24px rgba(0,0,0,0.1);
    }
`;
document.head.appendChild(style);