import { Order } from '@/types'

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(to right, #6366f1, #8b5cf6);
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background: white;
      padding: 20px;
      border-radius: 0 0 8px 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(to right, #6366f1, #8b5cf6);
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin-top: 20px;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      color: #666;
      font-size: 14px;
    }
    .discord-button {
      display: inline-block;
      padding: 12px 24px;
      background: #5865F2;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Artist Hiring Platform</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Artist Hiring Platform. All rights reserved.
    </div>
  </div>
</body>
</html>
`

export const emailTemplates = {
  // Welcome Email
  welcome: (name: string, isArtist: boolean) => ({
    subject: 'Welcome to Artist Hiring Platform! 🎨',
    html: baseTemplate(`
      <h2>Welcome to Artist Hiring Platform!</h2>
      <p>Hello ${name},</p>
      <p>We're excited to have you join our creative community as a ${isArtist ? 'talented artist' : 'valued client'}!</p>
      ${isArtist ? `
        <p>As an artist, you can:</p>
        <ul>
          <li>Showcase your amazing work</li>
          <li>Connect with potential clients</li>
          <li>Manage your orders efficiently</li>
          <li>Build your creative portfolio</li>
        </ul>
      ` : `
        <p>As a client, you can:</p>
        <ul>
          <li>Discover talented artists</li>
          <li>Commission unique artworks</li>
          <li>Track your orders easily</li>
          <li>Build lasting relationships with artists</li>
        </ul>
      `}
      <p>Join our Discord community to connect with other ${isArtist ? 'artists' : 'art enthusiasts'}!</p>
      <a href="https://discord.com/invite/YWFD72HV" class="discord-button">Join Our Discord</a>
      <p style="margin-top: 20px;">Ready to get started?</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/${isArtist ? 'artist/dashboard' : 'browse-works'}" class="button">
        ${isArtist ? 'Go to Dashboard' : 'Browse Works'}
      </a>
    `)
  }),

  // Email Verification
  verifyEmail: (verificationLink: string) => ({
    subject: 'Verify Your Email - Artist Hiring Platform',
    html: baseTemplate(`
      <h2>Verify Your Email Address</h2>
      <p>Welcome to Artist Hiring Platform! Please verify your email address to get started.</p>
      <p>Click the button below to verify your email:</p>
      <a href="${verificationLink}" class="button">Verify Email</a>
      <p style="margin-top: 20px;">This link will expire in 24 hours.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    `)
  }),

  // New Message Notification
  newMessage: (order: Order, senderName: string) => ({
    subject: `New Message: Order #${order.id}`,
    html: baseTemplate(`
      <h2>New Message Received</h2>
      <p>Hello,</p>
      <p>You have received a new message from ${senderName} regarding order "${order.work.title}".</p>
      <p>Click below to view and respond to the message:</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}" class="button">View Message</a>
    `)
  }),

  // Order Creation
  orderCreated: (order: Order) => ({
    subject: 'New Order Received',
    html: baseTemplate(`
      <h2>New Order Received</h2>
      <p>Hello ${order.artist.full_name},</p>
      <p>You have received a new order for "${order.work.title}".</p>
      <p><strong>Client:</strong> ${order.client.full_name}</p>
      <p><strong>Amount:</strong> ₹${order.total_amount}</p>
      <p><strong>Requirements:</strong> ${order.requirements}</p>
      <p>Please review and accept/reject the order in your dashboard.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/artist/notifications" class="button">View Order</a>
      <p style="margin-top: 20px;">Need help? Join our Discord community:</p>
      <a href="https://discord.com/invite/YWFD72HV" class="discord-button">Join Discord</a>
    `)
  }),

  orderConfirmation: (order: Order) => ({
    subject: 'Order Placed Successfully',
    html: baseTemplate(`
      <h2>Order Placed Successfully</h2>
      <p>Hello ${order.client.full_name},</p>
      <p>Your order for "${order.work.title}" has been placed successfully.</p>
      <p><strong>Amount:</strong> ₹${order.total_amount}</p>
      <p><strong>Requirements:</strong> ${order.requirements}</p>
      <p>The artist will review your order shortly.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}" class="button">View Order Details</a>
      <p style="margin-top: 20px;">Join our Discord community for updates and support:</p>
      <a href="https://discord.com/invite/YWFD72HV" class="discord-button">Join Discord</a>
    `)
  }),

  // Order Status Updates
  orderAccepted: (order: Order) => ({
    subject: 'Order Accepted',
    html: baseTemplate(`
      <h2>Order Accepted</h2>
      <p>Hello ${order.client.full_name},</p>
      <p>Great news! The artist has accepted your order for "${order.work.title}".</p>
      <p>They will start working on your requirements soon.</p>
      <p><strong>Next Steps:</strong></p>
      <ul>
        <li>The artist will review your requirements in detail</li>
        <li>You can communicate with the artist through the order chat</li>
        <li>You'll be notified of any updates or progress</li>
      </ul>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}" class="button">View Order Details</a>
    `)
  }),

  orderRejected: (order: Order) => ({
    subject: 'Order Rejected',
    html: baseTemplate(`
      <h2>Order Rejected</h2>
      <p>Hello ${order.client.full_name},</p>
      <p>Unfortunately, the artist has rejected your order for "${order.work.title}".</p>
      <p>This could be due to their current workload or specific requirements.</p>
      <p>We encourage you to:</p>
      <ul>
        <li>Browse other artists who offer similar services</li>
        <li>Modify your requirements if needed</li>
        <li>Contact our support team if you need assistance</li>
      </ul>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/browse-works" class="button">Browse More Artists</a>
    `)
  }),

  // Payment Status
  paymentReceived: (order: Order) => ({
    subject: 'Payment Received: New Order Ready to Start',
    html: baseTemplate(`
      <h2>Payment Received - Order Ready to Start</h2>
      <p>Hello ${order.artist.full_name},</p>
      <p>Great news! The client has completed payment for order "${order.work.title}".</p>
      <p><strong>Order Amount:</strong> ₹${order.total_amount}</p>
      <p><strong>Your Earnings:</strong> ₹${order.total_amount - order.platform_fee}</p>
      
      <h3>Next Steps to Complete This Order:</h3>
      <ol>
        <li>Review the client's requirements and project files in the order details</li>
        <li>Communicate with the client through the order chat if you need any clarifications</li>
        <li>Complete the work according to the requirements</li>
        <li>Upload your completed work using the "Submit Completed Work" option</li>
        <li>Mark the project as completed when you're done</li>
      </ol>
      
      <p><strong>Important:</strong> You'll receive payment in your wallet once the client verifies and approves your completed work.</p>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}" class="button">View Order Details</a>
      
      <p style="margin-top: 20px;">Need help? Join our Discord community:</p>
      <a href="https://discord.com/invite/YWFD72HV" class="discord-button">Join Discord</a>
    `)
  }),

  paymentConfirmation: (order: Order) => ({
    subject: 'Payment Confirmation',
    html: baseTemplate(`
      <h2>Payment Successful</h2>
      <p>Hello ${order.client.full_name},</p>
      <p>Your payment for "${order.work.title}" has been processed successfully.</p>
      <p><strong>Amount:</strong> ₹${order.total_amount}</p>
      <p>The artist has been notified and will start working on your order.</p>
      <p>You can communicate with the artist through the order chat if you have any specific instructions or questions.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}" class="button">View Order Details</a>
    `)
  }),

  // Order Completion
  orderCompleted: (order: Order) => ({
    subject: 'Order Completed',
    html: baseTemplate(`
      <h2>Order Completed</h2>
      <p>Hello ${order.client.full_name},</p>
      <p>The artist has marked your order "${order.work.title}" as completed.</p>
      <p>Please review the work and provide your feedback.</p>
      <p><strong>Next Steps:</strong></p>
      <ul>
        <li>Review the completed work</li>
        <li>Provide feedback and rating</li>
        <li>Request revisions if needed</li>
      </ul>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}" class="button">Review Work</a>
    `)
  }),

  // Revision Request
  revisionRequested: (order: Order, issues: string) => ({
    subject: 'Revision Requested',
    html: baseTemplate(`
      <h2>Revision Requested</h2>
      <p>Hello ${order.artist.full_name},</p>
      <p>The client has requested revisions for order "${order.work.title}".</p>
      <p><strong>Issues Reported:</strong></p>
      <p>${issues}</p>
      <p>Please review the feedback and make the necessary revisions.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}" class="button">View Feedback</a>
    `)
  }),

  // Final Completion
  finalCompletion: (order: Order) => ({
    subject: 'Order Successfully Completed',
    html: baseTemplate(`
      <h2>Order Successfully Completed</h2>
      <p>Hello ${order.client.full_name},</p>
      <p>Your order "${order.work.title}" has been successfully completed!</p>
      <p>Thank you for using our platform. We hope you're satisfied with the work.</p>
      <p>Please consider:</p>
      <ul>
        <li>Leaving a review for the artist</li>
        <li>Sharing your experience</li>
        <li>Browsing more works from this artist</li>
      </ul>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}" class="button">Leave a Review</a>
      <p style="margin-top: 20px;">Share your experience with our community:</p>
      <a href="https://discord.com/invite/YWFD72HV" class="discord-button">Join Our Discord</a>
    `)
  })
} 