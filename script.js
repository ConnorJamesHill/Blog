// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  console.log('Initializing script.js');
  
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");
  const joinForm = document.getElementById("joinForm");
  const joinMessage = document.getElementById("joinMessage");

  if (!joinForm) {
    console.error('joinForm element not found!');
  } else {
    console.log('Found joinForm:', joinForm);
  }
  
  if (!joinMessage) {
    console.error('joinMessage element not found!');
  }
  
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
            <a href="${post.url}" class="primary-button" style="text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
              Read Post
              <span style="font-size: 18px;">→</span>
            </a>
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
  const hash = window.location.hash.slice(1);
  if (hash && ['blogs', 'portfolio', 'about', 'settings'].includes(hash)) {
    setActiveTab(hash);
  }

  // Handle hash changes (for subscribe buttons, etc.)
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (hash && ['blogs', 'portfolio', 'about', 'settings'].includes(hash)) {
      setActiveTab(hash);
    }
  });

  // Direct account creation (simplified - no email verification for now)
  if (joinForm) {
    console.log('Setting up form submit handler');
    joinForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      console.log('Form submitted!');
      
      const fullName = document.getElementById("joinFullName").value.trim();
      const email = document.getElementById("joinEmail").value.trim();
      const password = document.getElementById("joinPassword").value;

      console.log('Form values:', { fullName, email, password: password ? '***' : '' });

      if (!fullName || !email || !password) {
        joinMessage.textContent = "Please fill in all fields.";
        joinMessage.style.color = "var(--text-secondary)";
        return;
      }

      if (password.length < 6) {
        joinMessage.textContent = "Password must be at least 6 characters.";
        joinMessage.style.color = "var(--text-secondary)";
        return;
      }

      joinMessage.textContent = "Creating account...";
      joinMessage.style.color = "var(--accent)";
      console.log('Starting account creation...');

      try {
        const { db, auth } = await import('./js/firebase-config.js');
        const { setDoc, doc, Timestamp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const { createUserWithEmailAndPassword, updateProfile } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
        
        console.log('Firebase modules imported');
        
        // Create Firebase account directly
        console.log('Creating Firebase account...');
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        console.log('Account created, updating profile...');
        // Update profile with name
        await updateProfile(userCredential.user, {
          displayName: fullName
        });

        console.log('Storing user data in Firestore...');
        // Store user data in Firestore with default preferences
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: fullName,
          email: email,
          createdAt: Timestamp.now(),
          subscribedToNewsletter: true,
          emailPreferences: {
            newPosts: true,
            projects: true,
            commentReplies: true
          }
        });

        console.log('Account creation complete!');
        // Success!
        joinMessage.textContent = "✅ Account created! You're now logged in.";
        joinMessage.style.color = "var(--accent)";
        
        // Reset form after delay
        setTimeout(() => {
          joinForm.reset();
          joinMessage.textContent = "";
        }, 2000);

      } catch (error) {
        console.error("Error creating account:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        
        let message = "Error creating account. Please try again.";
        if (error.code === 'auth/email-already-in-use') {
          message = "This email is already registered. Please log in instead.";
        } else if (error.code === 'auth/weak-password') {
          message = "Password is too weak. Please use a stronger password.";
        } else if (error.code === 'auth/invalid-email') {
          message = "Invalid email address.";
        } else {
          message = `Error: ${error.message}`;
        }
        
        joinMessage.textContent = message;
        joinMessage.style.color = "#dc3545";
      }
    });
  }

  // Load posts from Firebase
  async function loadPostsFromFirebase() {
    try {
      // Dynamically import Firebase modules
      const { db } = await import('./js/firebase-config.js');
      const { collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
      
      const q = query(collection(db, 'posts'), orderBy('sortDate', 'desc'));
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
}
