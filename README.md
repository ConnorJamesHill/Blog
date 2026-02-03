# Code Journey - iOS Developer Blog

A modern, responsive blog showcasing iOS development articles, portfolio projects, and professional insights.

## 🚀 Features

### Current Features (Static)
- ✅ **Responsive Design** - Works beautifully on desktop, tablet, and mobile
- ✅ **Individual Blog Posts** - Full article pages with rich content
- ✅ **Category Filtering** - Filter posts by SwiftUI, Performance, Architecture, Swift
- ✅ **Portfolio Section** - Showcase your published iOS apps
- ✅ **Newsletter Subscription UI** - Beautiful subscription form
- ✅ **Social Sharing** - Share posts on Twitter, LinkedIn, or copy link
- ✅ **Tab Navigation** - Blogs, Portfolio, About, Settings sections
- ✅ **Comments Section** - Community discussion (currently in-memory)
- ✅ **Modern UI** - Clean design with smooth animations

### Coming Soon (With Firebase)
- 🔄 **Dynamic Blog Posts** - Write and publish from admin panel
- 🔄 **Persistent Comments** - Comments stored in Firestore
- 🔄 **Newsletter Integration** - Real email subscriptions
- 🔄 **Admin Authentication** - Secure login for content management
- 🔄 **Image Uploads** - Add images to blog posts
- 🔄 **Analytics** - Track post views and engagement

## 📁 Project Structure

```
Blog/
├── index.html              # Main landing page
├── styles.css              # Main stylesheet
├── post-styles.css         # Blog post page styles
├── script.js               # JavaScript functionality
├── posts/                  # Individual blog post pages
│   ├── swiftui-onboarding-flows.html
│   ├── profiling-animations-instruments.html
│   └── mvc-to-mvvm-refactor.html
└── README.md              # This file
```

## 🎯 How to Use

### Running Locally

1. **Clone or navigate to the project:**
   ```bash
   cd "/Users/connorhill/Documents/GitHub Repo's/Blog"
   ```

2. **Start a local server:**
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # OR using Node.js
   npx http-server -p 8000
   ```

3. **Open in browser:**
   ```
   http://localhost:8000
   ```

### Adding New Blog Posts

#### Method 1: Manual (Current)
1. Create a new HTML file in the `posts/` directory
2. Copy the structure from an existing post
3. Add the post to the `blogPosts` array in `script.js`

Example:
```javascript
{
  id: 7,
  title: "Your New Post Title",
  category: "SwiftUI",  // or Performance, Architecture, Swift
  readTime: "5 min read",
  date: "February 3, 2024",
  excerpt: "A brief description of your post...",
  url: "posts/your-new-post.html"
}
```

#### Method 2: With Firebase (After Setup)
1. Log into admin panel
2. Write post in rich text editor
3. Hit publish
4. Automatically appears on site

## 🎨 Customization

### Change Brand Name
Update in `index.html`:
```html
<p class="brand-title">Your Name</p>
<p class="brand-subtitle">Your Title</p>
```

### Change Colors
Edit CSS variables in `styles.css`:
```css
:root {
  --accent: #3579ff;        /* Primary blue */
  --background: #f4f6fb;    /* Light gray background */
  --text-primary: #0c1524;  /* Dark text */
  /* ... more variables */
}
```

### Update Portfolio Projects
Edit the portfolio section in `index.html` or add to the Portfolio tab.

### Change Author Info
Update the author section in each blog post:
```html
<div class="author-avatar">YI</div>
<div class="author-info">
  <h4>Your Name</h4>
  <p>Your bio...</p>
</div>
```

## 🔥 Firebase Setup (Next Steps)

Follow the Firebase setup guide to enable:
- Dynamic blog post management
- Real-time comments
- User authentication
- Newsletter subscriptions
- Image storage

See the detailed setup instructions provided separately.

## 📱 Features Breakdown

### Blog Posts
- Rich text content with code snippets
- Syntax highlighting for code blocks
- Reading time estimates
- Category tags
- Publication dates
- Social sharing buttons

### Navigation
- Tab-based navigation
- URL hash support (e.g., `#blogs`, `#portfolio`)
- Click filter to cycle through categories
- Smooth transitions

### Newsletter
- Beautiful subscription form
- Benefits showcase
- Subscriber count display
- Email validation

### Portfolio
- App showcase cards
- Direct links to App Store
- Tags for technologies used
- App icons and descriptions

## 🌐 Deployment Options

### Option 1: GitHub Pages (Free)
1. Push code to GitHub repository
2. Go to Settings → Pages
3. Select branch and save
4. Site live at `username.github.io/repo-name`

### Option 2: Netlify (Free)
1. Sign up at netlify.com
2. Connect GitHub repository
3. Auto-deploys on push
4. Custom domain support

### Option 3: Vercel (Free)
1. Sign up at vercel.com
2. Import GitHub repository
3. Auto-deploys on push
4. Excellent performance

### Option 4: Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Run: `firebase init hosting`
3. Deploy: `firebase deploy`

## 📝 Content Guidelines

### Writing Blog Posts
- Use clear, descriptive titles
- Start with the problem/challenge
- Include code examples
- Add personal insights
- End with key takeaways
- Link to related posts

### Blog Post Structure
1. **Hero Section** - Title, category, date, read time
2. **Introduction** - Hook and context
3. **Main Content** - Sections with H2/H3 headings
4. **Code Examples** - Well-formatted code blocks
5. **Conclusion** - Summary and next steps
6. **Share & Subscribe** - Social buttons and CTA

## 🛠️ Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox
- **JavaScript (ES6+)** - Dynamic content, filtering
- **Firebase** (Coming) - Backend services
- **Google Fonts** - Inter typeface

## 📊 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

This is a personal blog template. Feel free to:
- Fork and customize for your own use
- Suggest improvements via issues
- Share with other iOS developers

## 📄 License

Feel free to use this template for your own blog. Attribution appreciated but not required.

## 📧 Contact

Questions or suggestions? Reach out via:
- Email: hello@codejourney.dev
- Twitter: @yourhandle
- LinkedIn: /in/yourprofile

---

**Built with ❤️ for the iOS development community**
