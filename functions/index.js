const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');

admin.initializeApp();

// Configure SendGrid with API key from environment
const SENDGRID_API_KEY = functions.config().sendgrid?.key;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

const FROM_EMAIL = functions.config().email?.from || 'hilljamesconnor@gmail.com';
const FROM_NAME = functions.config().email?.from_name || "Connor Hill's Blog";
const WEBSITE_URL = 'https://connorhillblog.netlify.app/'; // TODO: Update with your actual domain

// ============================================================================
// 1. Send Welcome Email When User Signs Up
// ============================================================================
exports.sendWelcomeEmail = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const userData = snap.data();
    const email = userData.email;
    const name = userData.name;

    console.log(`Sending welcome email to: ${email}`);

    const msg = {
      to: email,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: 'Welcome to Connor Hill\'s Blog!',
      text: `Hi ${name},\n\nThanks for subscribing! You'll receive updates about new iOS tutorials and app releases.\n\nBest,\nConnor Hill`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px; }
            .button { display: inline-block; background: #3579ff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 999px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            ul { line-height: 2; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Welcome! 🎉</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Thanks for joining Connor Hill's Blog! I'm excited to share my iOS development journey with you.</p>
              <p><strong>You'll receive updates about:</strong></p>
              <ul>
                <li>📱 New iOS tutorials and articles</li>
                <li>🚀 App launches and portfolio updates</li>
                <li>💬 Replies to your comments (if enabled)</li>
              </ul>
              <p style="text-align: center;">
                <a href="${WEBSITE_URL}/#settings" class="button">Manage Your Preferences</a>
              </p>
              <p>Looking forward to connecting with you!</p>
              <p>Best,<br><strong>Connor Hill</strong></p>
            </div>
            <div class="footer">
              <p>You're receiving this because you created an account at Connor Hill's Blog.</p>
              <p><a href="${WEBSITE_URL}/#settings">Manage preferences</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await sgMail.send(msg);
      console.log('Welcome email sent successfully to:', email);
      return null;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      if (error.response) {
        console.error('SendGrid error details:', error.response.body);
      }
      return null;
    }
  });

// ============================================================================
// 2. Notify Users When New Blog Post is Published
// ============================================================================
exports.notifyNewBlogPost = functions.firestore
  .document('posts/{postId}')
  .onCreate(async (snap, context) => {
    const postData = snap.data();
    const postTitle = postData.title;
    const postExcerpt = postData.excerpt || '';
    const postId = context.params.postId;
    const postUrl = `${WEBSITE_URL}/post.html?id=${postId}`;

    console.log(`New post published: ${postTitle}`);

    // Get all users who want new post notifications
    const usersSnapshot = await admin.firestore().collection('users')
      .where('emailPreferences.newPosts', '==', true)
      .get();

    if (usersSnapshot.empty) {
      console.log('No users subscribed to new post notifications');
      return null;
    }

    console.log(`Sending notifications to ${usersSnapshot.size} users`);

    const emailPromises = usersSnapshot.docs.map((userDoc) => {
      const userData = userDoc.data();
      const msg = {
        to: userData.email,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: `New Post: ${postTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
              .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px; }
              .button { display: inline-block; background: #3579ff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 999px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
              .post-title { color: #3579ff; margin-top: 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">New Post Published! 📝</h1>
              </div>
              <div class="content">
                <p>Hi ${userData.name},</p>
                <p>I just published a new post you might enjoy:</p>
                <h2 class="post-title">${postTitle}</h2>
                <p style="color: #666;">${postExcerpt}</p>
                <p style="text-align: center;">
                  <a href="${postUrl}" class="button">Read Post →</a>
                </p>
                <p>Happy reading!</p>
                <p>Best,<br><strong>Connor Hill</strong></p>
              </div>
              <div class="footer">
                <p>You're receiving this because you subscribed to new post notifications.</p>
                <p><a href="${WEBSITE_URL}/#settings">Manage preferences</a></p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      return sgMail.send(msg).catch(error => {
        console.error(`Error sending email to ${userData.email}:`, error);
      });
    });

    try {
      await Promise.all(emailPromises);
      console.log(`New post notifications sent successfully`);
      return null;
    } catch (error) {
      console.error('Error sending new post notifications:', error);
      return null;
    }
  });

// ============================================================================
// 3. Notify Users When Someone Replies to Their Comment
// ============================================================================
exports.notifyCommentReply = functions.firestore
  .document('posts/{postId}/comments/{commentId}')
  .onCreate(async (snap, context) => {
    const commentData = snap.data();
    const postId = context.params.postId;
    const newCommenterId = commentData.userId;
    const newCommenterName = commentData.name;

    console.log(`New comment on post ${postId} by ${newCommenterName}`);

    // Get the post details
    const postDoc = await admin.firestore().collection('posts').doc(postId).get();
    if (!postDoc.exists) {
      console.log('Post not found');
      return null;
    }

    const postData = postDoc.data();
    const postTitle = postData.title;
    const postUrl = `${WEBSITE_URL}/post.html?id=${postId}`;

    // Get all previous commenters on this post (excluding the new commenter)
    const commentsSnapshot = await admin.firestore()
      .collection('posts').doc(postId).collection('comments')
      .get();

    // Get unique user IDs (excluding the new commenter)
    const uniqueUserIds = [...new Set(
      commentsSnapshot.docs
        .map(doc => doc.data().userId)
        .filter(userId => userId && userId !== newCommenterId)
    )];

    if (uniqueUserIds.length === 0) {
      console.log('No previous commenters to notify');
      return null;
    }

    console.log(`Notifying ${uniqueUserIds.length} previous commenters`);

    const emailPromises = uniqueUserIds.map(async (userId) => {
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return null;
      }

      const userData = userDoc.data();
      
      // Only send if user has comment reply notifications enabled
      if (userData.emailPreferences?.commentReplies === false) {
        console.log(`User ${userData.email} has comment notifications disabled`);
        return null;
      }

      const msg = {
        to: userData.email,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: `New comment on "${postTitle}"`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
              .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px; }
              .button { display: inline-block; background: #3579ff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 999px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
              .comment-box { background: #f5f5f5; padding: 20px; border-left: 4px solid #3579ff; margin: 20px 0; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">New Comment 💬</h1>
              </div>
              <div class="content">
                <p>Hi ${userData.name},</p>
                <p><strong>${newCommenterName}</strong> left a new comment on <strong>"${postTitle}"</strong> where you previously commented:</p>
                <div class="comment-box">
                  <p style="margin: 0;">${commentData.comment}</p>
                </div>
                <p style="text-align: center;">
                  <a href="${postUrl}" class="button">View Discussion →</a>
                </p>
                <p>Best,<br><strong>Connor Hill</strong></p>
              </div>
              <div class="footer">
                <p>You're receiving this because you commented on this post.</p>
                <p><a href="${WEBSITE_URL}/#settings">Manage preferences</a></p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      return sgMail.send(msg).catch(error => {
        console.error(`Error sending email to ${userData.email}:`, error);
      });
    });

    try {
      await Promise.all(emailPromises.filter(p => p !== null));
      console.log('Comment reply notifications sent successfully');
      return null;
    } catch (error) {
      console.error('Error sending comment reply notifications:', error);
      return null;
    }
  });

// ============================================================================
// 4. Weekly Digest (runs every Monday at 9am EST)
// ============================================================================
exports.sendWeeklyDigest = functions.pubsub
  .schedule('0 9 * * 1')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    console.log('Running weekly digest...');

    // Get posts from the last week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const postsSnapshot = await admin.firestore().collection('posts')
      .where('timestamp', '>', admin.firestore.Timestamp.fromDate(oneWeekAgo))
      .orderBy('timestamp', 'desc')
      .get();

    if (postsSnapshot.empty) {
      console.log('No new posts this week, skipping digest');
      return null;
    }

    // Get users who want weekly digest
    const usersSnapshot = await admin.firestore().collection('users')
      .where('emailPreferences.weeklyDigest', '==', true)
      .get();

    if (usersSnapshot.empty) {
      console.log('No users subscribed to weekly digest');
      return null;
    }

    console.log(`Sending weekly digest to ${usersSnapshot.size} users`);

    const posts = postsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const postsHtml = posts.map(post => `
      <div style="margin-bottom: 30px; padding-bottom: 30px; border-bottom: 1px solid #e0e0e0;">
        <h3 style="margin: 0 0 10px 0; color: #3579ff;">${post.title}</h3>
        <p style="color: #666; margin: 0 0 10px 0;">${post.excerpt || ''}</p>
        <a href="${WEBSITE_URL}/post.html?id=${post.id}" style="color: #3579ff; text-decoration: none;">Read more →</a>
      </div>
    `).join('');

    const emailPromises = usersSnapshot.docs.map((userDoc) => {
      const userData = userDoc.data();
      
      const msg = {
        to: userData.email,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject: `This Week's iOS Tutorials & Updates`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
              .content { background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Your Weekly Digest 📬</h1>
              </div>
              <div class="content">
                <p>Hi ${userData.name},</p>
                <p>Here's what I published this week:</p>
                ${postsHtml}
                <p>Thanks for being part of the community!</p>
                <p>Best,<br><strong>Connor Hill</strong></p>
              </div>
              <div class="footer">
                <p><a href="${WEBSITE_URL}/#settings">Manage preferences</a> | <a href="${WEBSITE_URL}/#settings">Unsubscribe</a></p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      return sgMail.send(msg).catch(error => {
        console.error(`Error sending email to ${userData.email}:`, error);
      });
    });

    try {
      await Promise.all(emailPromises);
      console.log('Weekly digest sent successfully');
      return null;
    } catch (error) {
      console.error('Error sending weekly digest:', error);
      return null;
    }
  });
