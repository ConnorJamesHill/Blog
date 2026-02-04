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


// Newsletter signup with email verification
let pendingSignup = null;

joinForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  
  const fullName = document.getElementById("joinFullName").value.trim();
  const email = document.getElementById("joinEmail").value.trim();
  const password = document.getElementById("joinPassword").value;

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

  try {
    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store verification data in Firestore
    const { db } = await import('./js/firebase-config.js');
    const { setDoc, doc, Timestamp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    
    // Note: We store the password temporarily in memory, not in Firestore for security
    await setDoc(doc(db, 'verificationCodes', email), {
      code: verificationCode,
      fullName: fullName,
      email: email,
      timestamp: Timestamp.now(),
      expiresAt: Timestamp.fromMillis(Date.now() + 15 * 60 * 1000) // 15 minutes
    });

    // Send verification email
    // TODO: In production, use Cloud Functions to send email via SendGrid/similar
    console.log(`📧 Verification code for ${email}: ${verificationCode}`);
    alert(`For demo purposes, your verification code is: ${verificationCode}\n\nIn production, this would be sent to your email.`);

    // Store pending signup data
    pendingSignup = { fullName, email, password };

    // Show verification step
    document.getElementById("signupStep").style.display = "none";
    document.getElementById("verificationStep").style.display = "block";
    document.getElementById("verifyEmail").textContent = email;
    joinMessage.textContent = "Code sent! Check your email.";
    joinMessage.style.color = "var(--accent)";
  } catch (error) {
    console.error("Error sending verification code:", error);
    joinMessage.textContent = "Error sending code. Please try again.";
    joinMessage.style.color = "#dc3545";
  }
});

// Verify code and create account
document.getElementById("verifyCodeBtn").addEventListener("click", async () => {
  const enteredCode = document.getElementById("verificationCode").value.trim();
  
  if (!enteredCode || enteredCode.length !== 6) {
    joinMessage.textContent = "Please enter a valid 6-digit code.";
    joinMessage.style.color = "var(--text-secondary)";
    return;
  }

  if (!pendingSignup) {
    joinMessage.textContent = "Error: No pending signup found.";
    joinMessage.style.color = "#dc3545";
    return;
  }

  try {
    const { db, auth } = await import('./js/firebase-config.js');
    const { getDoc, doc, deleteDoc, setDoc, Timestamp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    const { createUserWithEmailAndPassword, updateProfile } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
    
    // Verify code from Firestore
    const verificationDoc = await getDoc(doc(db, 'verificationCodes', pendingSignup.email));
    
    if (!verificationDoc.exists()) {
      joinMessage.textContent = "Verification code expired. Please try again.";
      joinMessage.style.color = "#dc3545";
      return;
    }

    const verificationData = verificationDoc.data();
    
    // Check if code expired
    if (verificationData.expiresAt.toMillis() < Date.now()) {
      await deleteDoc(doc(db, 'verificationCodes', pendingSignup.email));
      joinMessage.textContent = "Verification code expired. Please try again.";
      joinMessage.style.color = "#dc3545";
      return;
    }

    // Check if code matches
    if (verificationData.code !== enteredCode) {
      joinMessage.textContent = "Invalid code. Please try again.";
      joinMessage.style.color = "#dc3545";
      return;
    }

    // Code is valid - create account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      pendingSignup.email,
      pendingSignup.password
    );

    // Update profile with name
    await updateProfile(userCredential.user, {
      displayName: pendingSignup.fullName
    });

    // Store user data in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      name: pendingSignup.fullName,
      email: pendingSignup.email,
      createdAt: Timestamp.now(),
      subscribedToNewsletter: true
    });

    // Delete verification code
    await deleteDoc(doc(db, 'verificationCodes', pendingSignup.email));

    // Success!
    joinMessage.textContent = "✅ Account created! You're now logged in.";
    joinMessage.style.color = "var(--accent)";
    
    // Reset form after delay
    setTimeout(() => {
      document.getElementById("signupStep").style.display = "block";
      document.getElementById("verificationStep").style.display = "none";
      joinForm.reset();
      document.getElementById("verificationCode").value = "";
      pendingSignup = null;
    }, 2000);

  } catch (error) {
    console.error("Error creating account:", error);
    
    let message = "Error creating account. Please try again.";
    if (error.code === 'auth/email-already-in-use') {
      message = "This email is already registered. Please log in instead.";
    } else if (error.code === 'auth/weak-password') {
      message = "Password is too weak. Please use a stronger password.";
    }
    
    joinMessage.textContent = message;
    joinMessage.style.color = "#dc3545";
  }
});

// Resend verification code
document.getElementById("resendCodeBtn").addEventListener("click", async () => {
  if (!pendingSignup) {
    joinMessage.textContent = "Error: No pending signup found.";
    joinMessage.style.color = "#dc3545";
    return;
  }

  try {
    // Generate new code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    const { db } = await import('./js/firebase-config.js');
    const { setDoc, doc, Timestamp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    
    await setDoc(doc(db, 'verificationCodes', pendingSignup.email), {
      code: verificationCode,
      fullName: pendingSignup.fullName,
      email: pendingSignup.email,
      timestamp: Timestamp.now(),
      expiresAt: Timestamp.fromMillis(Date.now() + 15 * 60 * 1000)
    });

    // Send new code
    console.log(`📧 New verification code for ${pendingSignup.email}: ${verificationCode}`);
    alert(`New verification code: ${verificationCode}\n\nIn production, this would be sent to your email.`);

    joinMessage.textContent = "New code sent!";
    joinMessage.style.color = "var(--accent)";
  } catch (error) {
    console.error("Error resending code:", error);
    joinMessage.textContent = "Error sending code. Please try again.";
    joinMessage.style.color = "#dc3545";
  }
});

// Cancel verification and go back
document.getElementById("cancelVerificationBtn").addEventListener("click", () => {
  document.getElementById("signupStep").style.display = "block";
  document.getElementById("verificationStep").style.display = "none";
  document.getElementById("verificationCode").value = "";
  pendingSignup = null;
  joinMessage.textContent = "";
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