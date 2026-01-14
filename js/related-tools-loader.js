// ===================================
// Related Tools Loader
// Automatically adds related tools section to results
// ===================================

// Configuration for each tool page
const RELATED_TOOLS_CONFIG = {
    'plagiarism-checker': [
        {
            href: '/ai-detector',
            icon: 'fas fa-robot',
            title: 'AI Detector & Humanizer',
            description: 'Detect AI-generated content and convert it to human-like writing'
        },
        {
            href: '/word-counter',
            icon: 'fas fa-calculator',
            title: 'Word Counter',
            description: 'Count words, characters, sentences with detailed statistics'
        }
    ],
    'ai-detector': [
        {
            href: '/plagiarism-checker',
            icon: 'fas fa-shield-alt',
            title: 'Plagiarism Checker',
            description: 'Detect duplicate content and ensure originality'
        },
        {
            href: '/word-counter',
            icon: 'fas fa-calculator',
            title: 'Word Counter',
            description: 'Count words, characters, sentences with detailed statistics'
        }
    ],
    'word-counter': [
        {
            href: '/ai-detector',
            icon: 'fas fa-robot',
            title: 'AI Detector & Humanizer',
            description: 'Detect AI-generated content and convert it to human-like writing'
        },
        {
            href: '/plagiarism-checker',
            icon: 'fas fa-shield-alt',
            title: 'Plagiarism Checker',
            description: 'Detect duplicate content and ensure originality'
        }
    ]
};

// Function to create related tools HTML
function createRelatedToolsHTML(tools) {
    const toolCards = tools.map(tool => `
        <a href="${tool.href}" class="related-tool-card">
            <div class="tool-icon">
                <i class="${tool.icon}"></i>
            </div>
            <div class="tool-info">
                <h5>${tool.title}</h5>
                <p>${tool.description}</p>
            </div>
            <i class="fas fa-arrow-right tool-arrow"></i>
        </a>
    `).join('');

    return `
        <div class="related-tools">
            <h4><i class="fas fa-tools"></i> Try Our Related Tools</h4>
            <div class="related-tools-grid">
                ${toolCards}
            </div>
        </div>
    `;
}

// Function to inject related tools into result section
function injectRelatedTools(toolName) {
    const tools = RELATED_TOOLS_CONFIG[toolName];
    if (!tools) return;

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => inject());
    } else {
        inject();
    }

    function inject() {
        const resultSection = document.getElementById('result-section') ||
            document.querySelector('.result-section');

        if (resultSection) {
            const relatedToolsHTML = createRelatedToolsHTML(tools);
            resultSection.insertAdjacentHTML('beforeend', relatedToolsHTML);
        }
    }
}

// Auto-detect current tool and inject related tools
(function () {
    const path = window.location.pathname;

    if (path.includes('plagiarism-checker')) {
        injectRelatedTools('plagiarism-checker');
    } else if (path.includes('ai-detector')) {
        injectRelatedTools('ai-detector');
    } else if (path.includes('word-counter')) {
        injectRelatedTools('word-counter');
    }
})();
