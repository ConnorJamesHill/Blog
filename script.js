const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".tab-panel");
const commentForm = document.querySelector(".comment-form");
const commentList = document.getElementById("commentList");
const joinForm = document.getElementById("joinForm");
const joinMessage = document.getElementById("joinMessage");

// Blog posts will be loaded from Firebase
let blogPosts = [];
let currentFilter = "All Posts";

const seedComments = [
  {
    name: "Ava",
    message: "The MVVM refactor checklist was super helpful. Thanks!",
    time: "2 hours ago",
  },
  {
    name: "Marcus",
    message: "Loved the Instruments breakdown. More performance tips please.",
    time: "1 day ago",
  },
];

const renderComments = () => {
  commentList.innerHTML = "";
  seedComments.forEach((comment) => {
    const item = document.createElement("div");
    item.className = "comment-item";
    item.innerHTML = `<strong>${comment.name}</strong><p>${comment.message}</p><span class="muted">${comment.time}</span>`;
    commentList.appendChild(item);
  });
};

const renderBlogPosts = (filter = "All Posts") => {
  const contentGrid = document.querySelector("#blogs .content-grid");
  if (!contentGrid) return;

  if (blogPosts.length === 0) {
    contentGrid.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">Loading posts...</p>';
    return;
  }

  const filteredPosts = filter === "All Posts" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === filter);

  if (filteredPosts.length === 0) {
    contentGrid.innerHTML = `<p style="color: var(--text-secondary); text-align: center; padding: 40px;">No posts in category "${filter}"</p>`;
    return;
  }

  contentGrid.innerHTML = filteredPosts.map(post => `
    <article class="card post-card">
      <div class="card-header">
        <p class="pill">${post.category}</p>
        <span class="muted">${post.readTime}</span>
      </div>
      <h3>${post.title}</h3>
      <p>${post.excerpt}</p>
      <div class="post-meta">
        <span>${post.date}</span>
        <button class="link-button" type="button" onclick="window.location.href='${post.url || '#'}'">Read more</button>
      </div>
    </article>
  `).join('');
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

commentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(commentForm);
  const name = formData.get("name").toString().trim();
  const message = formData.get("comment").toString().trim();

  if (!name || !message) {
    return;
  }

  seedComments.unshift({
    name,
    message,
    time: "Just now",
  });
  commentForm.reset();
  renderComments();
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

// Category filtering
const filterPill = document.querySelector(".filter-pill");
if (filterPill) {
  filterPill.addEventListener("click", () => {
    const categories = ["All Posts", "SwiftUI", "Performance", "Architecture", "Swift"];
    const currentIndex = categories.indexOf(currentFilter);
    currentFilter = categories[(currentIndex + 1) % categories.length];
    filterPill.textContent = currentFilter;
    renderBlogPosts(currentFilter);
  });
}

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
    
    renderBlogPosts(currentFilter);
  } catch (error) {
    console.error('Error loading posts from Firebase:', error);
    // Fallback to showing a message
    const contentGrid = document.querySelector("#blogs .content-grid");
    if (contentGrid) {
      contentGrid.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px;">Unable to load posts. Please check back later.</p>';
    }
  }
}

// Initialize
renderComments();
renderBlogPosts();
loadPostsFromFirebase();