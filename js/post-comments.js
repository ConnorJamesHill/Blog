// Post Comments Module
// Handles comment loading and posting for individual blog posts

let currentUser = null;
let postId = null;

// Initialize authentication
async function initAuth() {
  try {
    const { auth } = await import('./firebase-config.js');
    const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
    
    onAuthStateChanged(auth, (user) => {
      currentUser = user;
      renderCommentForm();
    });
  } catch (error) {
    console.error('Error initializing auth:', error);
  }
}

// Get post ID from URL parameter or data attribute
function getPostId() {
  // Try URL parameter first (for dynamic posts)
  const urlParams = new URLSearchParams(window.location.search);
  const urlPostId = urlParams.get('id');
  if (urlPostId) return urlPostId;
  
  // Fall back to data attribute or filename
  const commentsSection = document.getElementById('postComments');
  if (commentsSection && commentsSection.dataset.postId) {
    return commentsSection.dataset.postId;
  }
  
  // Use filename as fallback
  const path = window.location.pathname;
  const filename = path.split('/').pop().replace('.html', '');
  return filename;
}

// Format timestamp for display
function formatCommentTime(timestamp) {
  if (!timestamp) return 'Just now';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
}

// Load comments for this post
async function loadComments() {
  const commentsList = document.getElementById('commentsList');
  if (!commentsList || !postId) return;

  try {
    const { db } = await import('./firebase-config.js');
    const { collection, query, where, getDocs, orderBy } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    
    const q = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const comments = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      comments.push({
        id: doc.id,
        ...data
      });
    });
    
    renderComments(comments);
  } catch (error) {
    console.error('Error loading comments:', error);
    commentsList.innerHTML = '<p class="muted" style="text-align: center; padding: 20px;">Unable to load comments.</p>';
  }
}

// Render comments in the list
function renderComments(comments) {
  const commentsList = document.getElementById('commentsList');
  const commentsCount = document.getElementById('commentsCount');
  
  if (commentsCount) {
    commentsCount.textContent = comments.length;
  }
  
  if (comments.length === 0) {
    commentsList.innerHTML = '<p class="muted" style="text-align: center; padding: 20px;">No comments yet. Be the first to comment!</p>';
    return;
  }
  
  commentsList.innerHTML = comments.map(comment => `
    <div class="comment-item">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
        <strong style="color: var(--text-primary);">${comment.userName}</strong>
        <span class="muted" style="font-size: 0.875rem;">${formatCommentTime(comment.timestamp)}</span>
      </div>
      <p style="color: var(--text-secondary); margin: 0;">${escapeHtml(comment.text)}</p>
    </div>
  `).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Render comment form based on auth state
function renderCommentForm() {
  const commentFormContainer = document.getElementById('commentFormContainer');
  if (!commentFormContainer) return;
  
  if (currentUser) {
    commentFormContainer.innerHTML = `
      <form id="commentForm" class="comment-form">
        <textarea
          id="commentText"
          name="comment"
          rows="4"
          placeholder="Share your thoughts..."
          required
        ></textarea>
        <button class="primary-button" type="submit">Post Comment</button>
      </form>
    `;
    
    const form = document.getElementById('commentForm');
    form.addEventListener('submit', handleCommentSubmit);
  } else {
    commentFormContainer.innerHTML = `
      <div class="comment-login-prompt">
        <p class="muted">Please <a href="../index.html" class="link-button" style="text-decoration: underline;">log in</a> to leave a comment.</p>
      </div>
    `;
  }
}

// Handle comment submission
async function handleCommentSubmit(event) {
  event.preventDefault();
  
  if (!currentUser) {
    alert('Please log in to comment');
    return;
  }

  const textarea = document.getElementById('commentText');
  const commentText = textarea.value.trim();
  const submitButton = event.target.querySelector('button[type="submit"]');

  if (!commentText) return;

  // Disable form during submission
  submitButton.disabled = true;
  submitButton.textContent = 'Posting...';

  try {
    const { db } = await import('./firebase-config.js');
    const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');

    // Add comment to Firestore
    await addDoc(collection(db, 'comments'), {
      postId: postId,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      userName: currentUser.email.split('@')[0],
      text: commentText,
      timestamp: serverTimestamp()
    });

    // Clear form
    textarea.value = '';
    
    // Reload comments
    await loadComments();
    
    // Show success (optional)
    submitButton.textContent = 'Posted!';
    setTimeout(() => {
      submitButton.textContent = 'Post Comment';
      submitButton.disabled = false;
    }, 1500);
  } catch (error) {
    console.error('Error posting comment:', error);
    alert('Failed to post comment. Please try again.');
    submitButton.textContent = 'Post Comment';
    submitButton.disabled = false;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  postId = getPostId();
  initAuth();
  loadComments();
  renderCommentForm();
});
