const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".tab-panel");
const joinForm = document.getElementById("joinForm");
const joinMessage = document.getElementById("joinMessage");

// Blog posts will be loaded from Firebase
let blogPosts = [];

const renderBlogPosts = async () => {
  const blogPostsList = document.getElementById("blogPostsList");
  if (!blogPostsList) return;

  if (blogPosts.length === 0) {
    blogPostsList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">Loading posts...</p>';
    return;
  }

  blogPostsList.innerHTML = blogPosts.map(post => {
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
      </article>
    `;
  }).join('');
};


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
renderBlogPosts();
loadPostsFromFirebase();