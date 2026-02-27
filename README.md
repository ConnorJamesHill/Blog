# Connor Hill's Blog

A modern, full stack blog platform built from scratch with vanilla JavaScript, HTML, CSS, and Firebase. Features user authentication, a custom admin CMS, real time comments, and automated email notifications.

**Live Site:** [connorhillblog.netlify.app](https://connorhillblog.netlify.app/)

## Features

### User Features
- **User Authentication** - Secure account creation and login with Firebase Auth
- **Newsletter Subscription** - Subscribe to receive new post notifications
- **Email Preferences** - Granular control over notification settings
- **Comment System** - Real time commenting on blog posts with nested discussions
- **Responsive Design** - Fully responsive across desktop, tablet, and mobile devices
- **Tab Navigation** - Smooth navigation between Blogs, Portfolio, Socials, About, and Settings

### Admin Features
- **Custom CMS** - Full featured admin panel for managing blog posts
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

## Tech Stack

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
- Netlify

## Email Notifications

The blog includes three automated email types:
1. **Welcome Email** - Sent when users create an account
2. **New Post Notification** - Sent to subscribers when you publish a new post
3. **Comment Reply** - Sent when someone comments on a post where they previously commented

All emails respect user preferences set in their account settings.

## Security Features

- Firebase Authentication for user management
- Server side validation via Firestore Security Rules
- Admin privileges verified server side
- Password reset functionality
- Account deletion with data cleanup

## Responsive Design

Fully responsive breakpoints:
- Mobile: < 600px
- Tablet: 600px - 900px
- Desktop: > 900px

## Key Learning Outcomes

Building this project from scratch provided hands on experience with:
- **Authentication & Authorization** - Implementing secure user systems
- **Database Design** - Structuring NoSQL data for scalability
- **Serverless Architecture** - Writing and deploying Cloud Functions
- **Email Automation** - Integrating third party APIs (SendGrid)
- **State Management** - Handling user sessions and data persistence
- **Responsive Web Design** - Creating mobile first layouts
- **Cloud Deployment** - Deploying full stack applications

## License

This project is open source and available for personal and educational use.

---

**Note:** This project was built entirely from scratch without frameworks or libraries (except Firebase SDK), demonstrating fundamental web development skills and understanding of core web technologies.
