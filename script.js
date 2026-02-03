const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".tab-panel");
const commentForm = document.querySelector(".comment-form");
const commentList = document.getElementById("commentList");
const joinForm = document.getElementById("joinForm");
const joinMessage = document.getElementById("joinMessage");

// Blog posts data
const blogPosts = [
  {
    id: 1,
    title: "Designing elegant onboarding flows in SwiftUI",
    category: "SwiftUI",
    readTime: "4 min read",
    date: "July 12, 2024",
    excerpt: "A breakdown of the storyboard-to-SwiftUI migration strategy I used to build a smooth onboarding experience.",
    url: "posts/swiftui-onboarding-flows.html"
  },
  {
    id: 2,
    title: "Profiling animations with Instruments",
    category: "Performance",
    readTime: "6 min read",
    date: "July 03, 2024",
    excerpt: "A guided approach to diagnosing dropped frames and using Core Animation templates to keep UI silky.",
    url: "posts/profiling-animations-instruments.html"
  },
  {
    id: 3,
    title: "From MVC to MVVM: a clean refactor plan",
    category: "Architecture",
    readTime: "5 min read",
    date: "June 20, 2024",
    excerpt: "The checkpoints I follow to refactor existing apps without breaking shipping schedules.",
    url: "posts/mvc-to-mvvm-refactor.html"
  },
  {
    id: 4,
    title: "Building custom SwiftUI shapes and paths",
    category: "SwiftUI",
    readTime: "7 min read",
    date: "June 15, 2024",
    excerpt: "Learn how to create custom shapes beyond the basics—from curves to complex animations.",
    url: "#"
  },
  {
    id: 5,
    title: "Async/await in Swift: patterns and best practices",
    category: "Swift",
    readTime: "8 min read",
    date: "June 08, 2024",
    excerpt: "How modern Swift concurrency changed the way I write asynchronous code.",
    url: "#"
  },
  {
    id: 6,
    title: "Debugging memory leaks in iOS apps",
    category: "Performance",
    readTime: "6 min read",
    date: "May 28, 2024",
    excerpt: "A systematic approach to finding and fixing retain cycles using Xcode's memory graph debugger.",
    url: "#"
  }
];

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

  const filteredPosts = filter === "All Posts" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === filter);

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
        <button class="link-button" type="button" onclick="window.location.href='${post.url}'">Read more</button>
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

// Initialize
renderComments();
renderBlogPosts();