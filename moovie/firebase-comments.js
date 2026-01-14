// Firebase Comments System
import { 
    auth, 
    database, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    ref, 
    push, 
    set, 
    onValue, 
    remove, 
    update,
    get
} from './firebase-config.js';

// Current user state
let currentUser = null;

// Initialize authentication state listener
export function initializeAuth() {
    console.log('🔐 Initializing Firebase Authentication...');
    
    try {
        onAuthStateChanged(auth, (user) => {
            currentUser = user;
            updateUIForAuthState(user);
            
            if (user) {
                console.log('✅ User logged in:', user.email);
                console.log('👤 User ID:', user.uid);
                loadComments(); // Reload comments when user logs in
            } else {
                console.log('👤 No user logged in - Login required to comment');
            }
        });
        
        console.log('✅ Auth state listener initialized');
    } catch (error) {
        console.error('❌ Failed to initialize auth:', error);
        throw error;
    }
}

// Update UI based on authentication state
function updateUIForAuthState(user) {
    const loginBtn = document.querySelector('.login-btn');
    const commentForm = document.getElementById('commentForm');
    const commentName = document.getElementById('commentName');
    
    if (user) {
        // User is logged in
        if (loginBtn) {
            loginBtn.textContent = 'Logout';
            loginBtn.onclick = handleLogout;
        }
        
        // Pre-fill name and make it readonly
        if (commentName) {
            commentName.value = user.displayName || user.email.split('@')[0];
            commentName.readOnly = true;
        }
        
        // Enable comment form
        if (commentForm) {
            commentForm.style.opacity = '1';
            commentForm.style.pointerEvents = 'auto';
        }
    } else {
        // User is logged out
        if (loginBtn) {
            loginBtn.textContent = 'Login';
            loginBtn.onclick = () => showAuthModal();
        }
        
        // Disable comment form
        if (commentForm) {
            commentForm.style.opacity = '0.6';
            commentForm.style.pointerEvents = 'none';
        }
        
        if (commentName) {
            commentName.value = '';
            commentName.readOnly = false;
            commentName.placeholder = 'Please login to comment...';
        }
    }
}

// Show authentication modal
function showAuthModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Handle logout
async function handleLogout() {
    try {
        await signOut(auth);
        alert('Logged out successfully!');
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out: ' + error.message);
    }
}

// Post a new comment
export async function postComment(commentData) {
    if (!currentUser) {
        alert('Please login to post a comment!');
        showAuthModal();
        return false;
    }
    
    try {
        const commentsRef = ref(database, 'comments');
        const newCommentRef = push(commentsRef);
        
        const comment = {
            userId: currentUser.uid,
            userName: currentUser.displayName || currentUser.email.split('@')[0],
            userEmail: currentUser.email,
            commentText: commentData.text,
            timestamp: Date.now(),
            likes: 0,
            edited: false,
            replies: {}
        };
        
        await set(newCommentRef, comment);
        console.log('✅ Comment posted successfully!');
        return true;
    } catch (error) {
        console.error('Error posting comment:', error);
        alert('Error posting comment: ' + error.message);
        return false;
    }
}

// Load all comments
export function loadComments() {
    console.log('📥 Loading comments from Firebase...');
    
    try {
        const commentsRef = ref(database, 'comments');
        
        onValue(commentsRef, (snapshot) => {
            const commentsData = snapshot.val();
            console.log('📊 Comments data received:', commentsData ? Object.keys(commentsData).length + ' comments' : '0 comments');
            displayComments(commentsData);
        }, (error) => {
            console.error('❌ Error loading comments:', error);
        });
    } catch (error) {
        console.error('❌ Failed to load comments:', error);
    }
}

// Display comments in the UI
function displayComments(commentsData) {
    const commentsList = document.getElementById('commentsList');
    const commentsCount = document.getElementById('commentsCount');
    const emptyComments = document.getElementById('emptyComments');
    
    if (!commentsList) return;
    
    // Clear existing comments (except sample)
    const sampleComment = commentsList.querySelector('.sample-comment');
    commentsList.innerHTML = '';
    
    if (!commentsData || Object.keys(commentsData).length === 0) {
        // Show empty state
        if (emptyComments) {
            emptyComments.style.display = 'block';
            commentsList.appendChild(emptyComments);
        }
        if (commentsCount) {
            commentsCount.textContent = '0';
        }
        return;
    }
    
    // Hide empty state
    if (emptyComments) {
        emptyComments.style.display = 'none';
    }
    
    // Convert to array and sort by timestamp (newest first)
    const commentsArray = Object.entries(commentsData).map(([id, data]) => ({
        id,
        ...data
    })).sort((a, b) => b.timestamp - a.timestamp);
    
    // Update count
    if (commentsCount) {
        commentsCount.textContent = commentsArray.length;
    }
    
    // Display each comment
    commentsArray.forEach(comment => {
        const commentElement = createCommentElement(comment);
        commentsList.appendChild(commentElement);
    });
}

// Create comment element
function createCommentElement(comment) {
    const div = document.createElement('div');
    div.className = 'comment-item';
    div.dataset.commentId = comment.id;
    
    const timeAgo = getTimeAgo(comment.timestamp);
    const isOwner = currentUser && currentUser.uid === comment.userId;
    
    div.innerHTML = `
        <div class="comment-avatar">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
        </div>
        <div class="comment-content">
            <div class="comment-header">
                <h4 class="comment-author">${comment.userName}</h4>
                <span class="comment-time">${timeAgo}</span>
            </div>
            <p class="comment-text">${escapeHtml(comment.commentText)}</p>
            <div class="comment-actions">
                <button class="reply-btn" onclick="handleReply('${comment.id}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 14 4 9 9 4"></polyline>
                        <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
                    </svg>
                    Reply
                </button>
                ${isOwner ? `
                    <button class="edit-btn" onclick="handleEdit('${comment.id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit
                    </button>
                    <button class="delete-btn" onclick="handleDelete('${comment.id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Delete
                    </button>
                ` : ''}
            </div>
            ${comment.replies ? displayReplies(comment.replies) : ''}
        </div>
    `;
    
    return div;
}

// Display replies
function displayReplies(replies) {
    if (!replies || Object.keys(replies).length === 0) return '';
    
    const repliesArray = Object.entries(replies).map(([id, data]) => ({
        id,
        ...data
    })).sort((a, b) => a.timestamp - b.timestamp);
    
    let html = '<div class="replies-container">';
    repliesArray.forEach(reply => {
        const timeAgo = getTimeAgo(reply.timestamp);
        html += `
            <div class="reply-item" data-reply-id="${reply.id}">
                <div class="reply-avatar">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                </div>
                <div class="reply-content">
                    <div class="reply-header">
                        <h5 class="reply-author">${reply.userName}</h5>
                        <span class="reply-time">${timeAgo}</span>
                    </div>
                    <p class="reply-text">${escapeHtml(reply.replyText)}</p>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    return html;
}

// Post a reply to a comment
export async function postReply(commentId, replyText) {
    if (!currentUser) {
        alert('Please login to reply!');
        showAuthModal();
        return false;
    }
    
    try {
        const repliesRef = ref(database, `comments/${commentId}/replies`);
        const newReplyRef = push(repliesRef);
        
        const reply = {
            userId: currentUser.uid,
            userName: currentUser.displayName || currentUser.email.split('@')[0],
            replyText: replyText,
            timestamp: Date.now()
        };
        
        await set(newReplyRef, reply);
        console.log('✅ Reply posted successfully!');
        return true;
    } catch (error) {
        console.error('Error posting reply:', error);
        alert('Error posting reply: ' + error.message);
        return false;
    }
}

// Delete a comment
export async function deleteComment(commentId) {
    if (!currentUser) {
        alert('Please login to delete comments!');
        return false;
    }
    
    if (!confirm('Are you sure you want to delete this comment?')) {
        return false;
    }
    
    try {
        const commentRef = ref(database, `comments/${commentId}`);
        await remove(commentRef);
        console.log('✅ Comment deleted successfully!');
        return true;
    } catch (error) {
        console.error('Error deleting comment:', error);
        alert('Error deleting comment: ' + error.message);
        return false;
    }
}

// Edit a comment
export async function editComment(commentId, newText) {
    if (!currentUser) {
        alert('Please login to edit comments!');
        return false;
    }
    
    try {
        const commentRef = ref(database, `comments/${commentId}`);
        await update(commentRef, {
            commentText: newText,
            edited: true,
            editedAt: Date.now()
        });
        console.log('✅ Comment edited successfully!');
        return true;
    } catch (error) {
        console.error('Error editing comment:', error);
        alert('Error editing comment: ' + error.message);
        return false;
    }
}

// Utility functions
function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    
    return new Date(timestamp).toLocaleDateString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally available
window.handleReply = async function(commentId) {
    const replyText = prompt('Enter your reply:');
    if (replyText && replyText.trim()) {
        await postReply(commentId, replyText.trim());
    }
};

window.handleEdit = async function(commentId) {
    const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
    const currentText = commentElement.querySelector('.comment-text').textContent;
    const newText = prompt('Edit your comment:', currentText);
    
    if (newText && newText.trim() && newText !== currentText) {
        await editComment(commentId, newText.trim());
    }
};

window.handleDelete = async function(commentId) {
    await deleteComment(commentId);
};

// Export currentUser for external access
export { currentUser };
