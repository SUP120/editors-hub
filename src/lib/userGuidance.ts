// User guidance messages for various scenarios
export const userGuidance = {
  // Order Status Messages
  orderStatus: {
    pending: {
      client: "Your order is pending. Please wait for the artist to accept your order. This usually takes 2-4 hours.",
      artist: "You have a new order! Please review and accept/decline within 24 hours."
    },
    accepted: {
      client: "Great news! The artist has accepted your order. They will start working on it soon.",
      artist: "You've accepted this order. Please start working on it and maintain communication with the client."
    },
    inProgress: {
      client: "Your order is in progress. The artist is working on your request.",
      artist: "You're currently working on this order. Keep the client updated on your progress."
    },
    completed: {
      client: "Your order is complete! Please review the work and provide feedback.",
      artist: "Order completed! The client will review your work. Earnings will be available after review."
    },
    cancelled: {
      client: "This order has been cancelled. The refund will be processed within 3-5 business days.",
      artist: "This order has been cancelled. Please check your dashboard for new orders."
    }
  },

  // Payment Messages
  payment: {
    pending: "Payment pending. Your order will be confirmed once payment is completed.",
    processing: "Payment is being processed. This may take a few moments.",
    success: "Payment successful! The artist has been notified and will start working soon.",
    failed: "Payment failed. Please try again or use a different payment method.",
    refund: "Refund initiated. It will be credited to your account within 3-5 business days."
  },

  // Artist Earnings
  earnings: {
    transferAvailable: "You can transfer this amount to your earnings now.",
    payoutRequested: "Your payout request has been received. You will receive the amount within 2-3 working days.",
    minimumPayout: "Minimum withdrawal amount is ₹200.",
    maximumPayout: "Maximum withdrawal amount is ₹50,000 per transaction.",
    paymentDetails: "Please add your payment details before requesting a payout."
  },

  // Communication
  communication: {
    messageClient: "Keep your client updated! Regular communication leads to better reviews.",
    messageArtist: "Feel free to discuss your requirements with the artist.",
    responseTime: "Average response time is 2 hours during business hours.",
    support: "Need help? Our support team is available 24/7."
  },

  // Reviews
  reviews: {
    leaveReview: "Please share your experience by leaving a review. This helps the artist grow!",
    reviewReminder: "Don't forget to review your completed order within 7 days.",
    thankReview: "Thank you for your review! It helps our community grow."
  },

  // Profile
  profile: {
    incomplete: "Complete your profile to increase visibility and trust.",
    portfolioTip: "Add your best works to your portfolio to attract more clients.",
    verificationNeeded: "Verify your account to unlock all features.",
    pricingTip: "Set competitive prices while ensuring quality work."
  },

  // Loading States
  loading: {
    initial: "Loading your personalized experience...",
    orders: "Fetching your orders...",
    portfolio: "Loading portfolio items...",
    profile: "Loading profile information...",
    payment: "Processing your request...",
    upload: "Uploading your files..."
  },

  // Error States
  error: {
    general: "Something went wrong. Please try again.",
    network: "Network error. Please check your connection.",
    upload: "File upload failed. Please try again.",
    validation: "Please check the highlighted fields.",
    permission: "You don't have permission to perform this action."
  },

  // Success States
  success: {
    profileUpdate: "Profile updated successfully!",
    orderCreate: "Order created successfully!",
    messagesSent: "Message sent successfully!",
    settingsSaved: "Settings saved successfully!"
  }
} 