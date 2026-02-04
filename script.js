const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".tab-panel");
const joinForm = document.getElementById("joinForm");
const joinMessage = document.getElementById("joinMessage");

// Blog posts will be loaded from Firebase
let blogPosts = [];
let currentUser = null;
let postComments = {}; // Store comments by postId

// Track authentication state
async function initAuth() {
  try {
    const { auth } = await import('./js/firebase-config.js');
    const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
    
    onAuthStateChanged(auth, (user) => {
      currentUser = user;
      // Re-render posts to update comment forms
      renderBlogPosts();
    });
  } catch (error) {
    console.error('Error initializing auth:', error);
  }
}

const renderBlogPosts = async () => {
  const blogPostsList = document.getElementById("blogPostsList");
  if (!blogPostsList) return;

  if (blogPosts.length === 0) {
    blogPostsList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">Loading posts...</p>';
    return;
  }

  // Load comments for all posts
  await loadAllComments();

  blogPostsList.innerHTML = blogPosts.map(post => {
    const comments = postComments[post.id] || [];
    const commentsHtml = comments.map(comment => `
      <div class="comment-item">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
          <strong style="color: var(--text-primary);">${comment.userName}</strong>
          <span class="muted" style="font-size: 0.875rem;">${formatCommentTime(comment.timestamp)}</span>
        </div>
        <p style="color: var(--text-secondary); margin: 0;">${comment.text}</p>
      </div>
    `).join('');

    const commentFormHtml = currentUser 
      ? `
        <form class="comment-form" data-post-id="${post.id}">
          <textarea
            name="comment"
            rows="3"
            placeholder="Share your thoughts..."
            required
          ></textarea>
          <button class="primary-button" type="submit">Post Comment</button>
        </form>
      `
      : `
        <div class="comment-login-prompt">
          <p class="muted">Please <button class="link-button" type="button" onclick="document.getElementById('loginBtn').click()">log in</button> to leave a comment.</p>
        </div>
      `;

    return `
      <article class="blog-post-item">
        <div class="blog-post-header">
          <div>
            <h3 style="margin: 0 0 8px 0;">
              <a href="${post.url}" style="color: var(--text-primary); text-decoration: none;">${post.title}</a>
            </h3>
            <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
              <span class="pill">${post.category}</span>
              <span class="muted">${post.date}</span>
              <span class="muted">${post.readTime}</span>
            </div>
          </div>
          <a href="${post.url}" class="link-button">Read Post</a>
        </div>
        <p style="color: var(--text-secondary); margin: 16px 0;">${post.excerpt}</p>
        
        <div class="post-comments">
          <h4 style="margin: 0 0 16px 0; color: var(--text-primary); font-size: 1rem;">
            Comments (${comments.length})
          </h4>
          ${commentFormHtml}
          <div class="comment-list">
            ${commentsHtml || '<p class="muted" style="text-align: center; padding: 20px;">No comments yet. Be the first to comment!</p>'}
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Attach event listeners to comment forms
  document.querySelectorAll('.comment-form').forEach(form => {
    form.addEventListener('submit', handleCommentSubmit);
  });
};

async function handleCommentSubmit(event) {
  event.preventDefault();
  
  if (!currentUser) {
    alert('Please log in to comment');
    return;
  }

  const form = event.target;
  const postId = form.dataset.postId;
  const textarea = form.querySelector('textarea[name="comment"]');
  const commentText = textarea.value.trim();

  if (!commentText) return;

  try {
    const { db } = await import('./js/firebase-config.js');
    const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');

    // Add comment to Firestore
    await addDoc(collection(db, 'comments'), {
      postId: postId,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      userName: currentUser.email.split('@')[0], // Use email username
      text: commentText,
      timestamp: serverTimestamp()
    });

    // Clear form
    textarea.value = '';
    
    // Reload posts and comments
    await renderBlogPosts();
  } catch (error) {
    console.error('Error posting comment:', error);
    alert('Failed to post comment. Please try again.');
  }
}

async function loadAllComments() {
  try {
    const { db } = await import('./js/firebase-config.js');
    const { collection, query, where, getDocs, orderBy } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    
    postComments = {};
    
    // Load comments for all posts
    for (const post of blogPosts) {
      const q = query(
        collection(db, 'comments'),
        where('postId', '==', post.id),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      postComments[post.id] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        postComments[post.id].push({
          id: doc.id,
          ...data
        });
      });
    }
  } catch (error) {
    console.error('Error loading comments:', error);
  }
}

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

const setActiveTab = (target) => {
  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === target);
  });
  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === target);
  });
  
  // Handle hash navigation
  if (target) {
    window.location.hash = target;
  }
};

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setActiveTab(tab.dataset.tab));
});

// Handle initial hash navigation
window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.slice(1);
  if (hash && ['blogs', 'portfolio', 'about', 'settings'].includes(hash)) {
    setActiveTab(hash);
  }
});

// Handle hash changes (for subscribe buttons, etc.)
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1);
  if (hash && ['blogs', 'portfolio', 'about', 'settings'].includes(hash)) {
    setActiveTab(hash);
  }
});


joinForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(joinForm);
  const email = formData.get("email").toString().trim();

  if (!email) {
    joinMessage.textContent = "Please add a valid email address.";
    return;
  }

  joinMessage.textContent =
    "Thanks for joining! Check your inbox to confirm within 24 hours.";
  joinForm.reset();
});


// Load posts from Firebase
async function loadPostsFromFirebase() {
  try {
    // Dynamically import Firebase modules
    const { db } = await import('./js/firebase-config.js');
    const { collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    blogPosts = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      blogPosts.push({
        id: doc.id,
        title: data.title,
        category: data.category,
        readTime: data.readTime,
        date: data.date,
        excerpt: data.excerpt,
        url: `post.html?id=${doc.id}` // Dynamic post URL
      });
    });
    
    await renderBlogPosts();
  } catch (error) {
    console.error('Error loading posts from Firebase:', error);
    // Fallback to showing a message
    const blogPostsList = document.getElementById("blogPostsList");
    if (blogPostsList) {
      blogPostsList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">Unable to load posts. Please check back later.</p>';
    }
  }
}

// Initialize
initAuth();
renderBlogPosts();
loadPostsFromFirebase();