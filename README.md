# Connor Hill's Blog

A modern, full-stack blog platform built from scratch with vanilla JavaScript, HTML, CSS, and Firebase. Features user authentication, a custom admin CMS, real-time comments, and automated email notifications.

🔗 **Live Site:** [connorhillblog.netlify.app](https://connorhillblog.netlify.app/)

## 📋 Features

### User Features
- **User Authentication** - Secure account creation and login with Firebase Auth
- **Newsletter Subscription** - Subscribe to receive new post notifications
- **Email Preferences** - Granular control over notification settings
- **Comment System** - Real-time commenting on blog posts with nested discussions
- **Responsive Design** - Fully responsive across desktop, tablet, and mobile devices
- **Tab Navigation** - Smooth navigation between Blogs, Portfolio, Socials, About, and Settings

### Admin Features
- **Custom CMS** - Full-featured admin panel for managing blog posts
- **Rich Content Editor** - HTML content editor with live preview
- **Post Management** - Create, edit, and delete posts with custom dates
- **Draft System** - Write and edit posts before publishing
- **Category Organization** - Organize posts by topics (SwiftUI, Performance, Architecture, etc.)

### Backend Features
- **Cloud Functions** - Serverless functions for email automation
- **Welcome Emails** - Automatic welcome email when users sign up
- **New Post Notifications** - Email subscribers when new posts are published
- **Comment Notifications** - Notify users of replies to their comments
- **Firestore Database** - NoSQL database for posts, comments, and user data

## 🛠 Tech Stack

**Frontend:**
- Vanilla JavaScript (ES6 modules)
- HTML5 & CSS3
- Firebase SDK (Auth, Firestore, Storage)

**Backend:**
- Firebase Authentication
- Cloud Firestore
- Firebase Cloud Functions
- SendGrid (Email delivery)

**Deployment:**
- Netlify (Frontend hosting)
- Firebase Hosting (Alternative option)

## 🏗 Project Structure

```
Blog/
├── index.html              # Main landing page
├── post.html              # Individual blog post page
├── admin.html             # Admin CMS panel
├── admin-login.html       # Admin login page
├── styles.css             # Global styles
├── post-styles.css        # Blog post-specific styles
├── script.js              # Main JavaScript logic
├── js/
│   └── firebase-config.js # Firebase configuration
├── functions/
│   ├── index.js           # Cloud Functions for email automation
│   └── package.json       # Backend dependencies
├── images/                # App icons and assets
└── posts/                 # Static post content (if any)
```

## 🚀 Setup & Installation

### Prerequisites
- Node.js (for Firebase Functions)
- Firebase account
- SendGrid account (for email notifications)

### 1. Clone the Repository
```bash
git clone https://github.com/ConnorJamesHill/Blog.git
cd Blog
```

### 2. Firebase Configuration
1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Copy your Firebase config and update `js/firebase-config.js`
5. Update the `ADMIN_EMAIL` constant with your admin email

### 3. Firestore Security Rules
Set up security rules in the Firebase Console to protect your data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read posts
    match /posts/{postId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == 'YOUR_ADMIN_EMAIL@gmail.com';
      
      // Comments subcollection
      match /comments/{commentId} {
        allow read: if true;
        allow create: if request.auth != null;
        allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
      }
    }
    
    // Users can only read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Firebase Functions Setup
```bash
cd functions
npm install
firebase login
firebase use --add  # Select your Firebase project
```

Configure SendGrid:
```bash
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
firebase functions:config:set email.from="your@email.com"
firebase functions:config:set email.from_name="Your Blog Name"
```

Deploy functions:
```bash
firebase deploy --only functions
```

### 5. Deploy Frontend
**Option A: Netlify**
1. Connect your GitHub repository to Netlify
2. Set build command to none (static site)
3. Set publish directory to `/`
4. Deploy

**Option B: Firebase Hosting**
```bash
firebase deploy --only hosting
```

## 🎨 Customization

### Styling
- Primary colors defined in CSS custom properties in `styles.css`
- Modify the gradient in `.hero` for custom branding
- Update font families in the root CSS variables

### Content
- Blog categories can be modified in `admin.html` (category select dropdown)
- Social links in the Socials tab can be updated in `index.html`
- Portfolio projects can be added/edited in the Portfolio section

### Email Templates
- Email HTML templates are in `functions/index.js`
- Customize colors, branding, and copy for welcome/notification emails

## 📧 Email Notifications

The blog includes three automated email types:
1. **Welcome Email** - Sent when users create an account
2. **New Post Notification** - Sent to subscribers when you publish a new post
3. **Comment Reply** - Sent when someone comments on a post where they previously commented

All emails respect user preferences set in their account settings.

## 🔒 Security Features

- Firebase Authentication for user management
- Server-side validation via Firestore Security Rules
- Admin privileges verified server-side
- Rate limiting on authentication attempts
- Password reset functionality
- Account deletion with data cleanup

## 📱 Responsive Design

Fully responsive breakpoints:
- Mobile: < 600px
- Tablet: 600px - 900px
- Desktop: > 900px

## 🧰 Key Learning Outcomes

Building this project from scratch provided hands-on experience with:
- **Authentication & Authorization** - Implementing secure user systems
- **Database Design** - Structuring NoSQL data for scalability
- **Serverless Architecture** - Writing and deploying Cloud Functions
- **Email Automation** - Integrating third-party APIs (SendGrid)
- **State Management** - Handling user sessions and data persistence
- **Responsive Web Design** - Creating mobile-first layouts
- **Cloud Deployment** - Deploying full-stack applications

## 📝 Future Enhancements

- [ ] Rich text editor (WYSIWYG) for blog post creation
- [ ] Image upload functionality for posts
- [ ] Search functionality for posts
- [ ] Post tags and filtering
- [ ] Analytics dashboard for admin
- [ ] Social media preview cards (OpenGraph)
- [ ] RSS feed generation
- [ ] Dark mode toggle

## 👤 Author

**Connor Hill**  
iOS Developer & Blog Creator

- Website: [connorhillblog.netlify.app](https://connorhillblog.netlify.app/)
- Email: hilljamesconnor@gmail.com
- GitHub: [@ConnorJamesHill](https://github.com/ConnorJamesHill)
- LinkedIn: [Connor Hill](https://linkedin.com/in/connor-j-hill)
- Twitter: [@ConnorJayHill](https://twitter.com/ConnorJayHill)

## 📄 License

This project is open source and available for personal and educational use.

---

**Note:** This project was built entirely from scratch without frameworks or libraries (except Firebase SDK), demonstrating fundamental web development skills and understanding of core web technologies.
