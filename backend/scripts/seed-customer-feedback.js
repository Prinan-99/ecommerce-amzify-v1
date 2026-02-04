import prisma from '../config/prisma.js';

async function seedCustomerFeedback() {
  console.log('🌱 Seeding customer feedback...');

  const feedbackData = [
    {
      customer_name: 'Rajesh Kumar',
      customer_email: 'rajesh.kumar@email.com',
      type: 'complaint',
      rating: 2,
      message: 'I received a damaged product. The packaging was torn and the item inside was broken. Very disappointed with the delivery service. Expected better quality control from Amzify.',
      status: 'new',
      created_at: new Date(Date.now() - 2*60*60*1000) // 2 hours ago
    },
    {
      customer_name: 'Priya Sharma',
      customer_email: 'priya.sharma@email.com',
      type: 'suggestion',
      rating: 4,
      message: 'The platform is great overall. Would love to see more payment options like UPI and digital wallets. Also, a wishlist feature would be really helpful for future purchases.',
      status: 'new',
      created_at: new Date(Date.now() - 5*60*60*1000) // 5 hours ago
    },
    {
      customer_name: 'Amit Patel',
      customer_email: 'amit.patel@email.com',
      type: 'product',
      rating: 5,
      message: 'Excellent product quality! The electronics I ordered arrived in perfect condition and work flawlessly. Fast delivery and great customer service. Highly recommended!',
      status: 'reviewed',
      created_at: new Date(Date.now() - 1*24*60*60*1000) // 1 day ago
    },
    {
      customer_name: 'Sneha Reddy',
      customer_email: 'sneha.reddy@email.com',
      type: 'service',
      rating: 3,
      message: 'Customer support was okay but took too long to respond. The issue was resolved eventually but the wait time was frustrating. Could improve response times.',
      status: 'reviewed',
      created_at: new Date(Date.now() - 2*24*60*60*1000) // 2 days ago
    },
    {
      customer_name: 'Vikram Singh',
      customer_email: 'vikram.singh@email.com',
      type: 'complaint',
      rating: 1,
      message: 'Wrong product delivered! I ordered a blue shirt size M but received a red shirt size L. This is completely unacceptable. Need immediate replacement.',
      status: 'responded',
      admin_response: 'We sincerely apologize for this error. We have initiated a replacement order with the correct product (blue shirt size M) and it will be delivered within 2 business days. You can keep the incorrect item. We have also issued a 20% discount coupon for your next purchase as an apology.',
      responded_at: new Date(Date.now() - 1*24*60*60*1000),
      created_at: new Date(Date.now() - 3*24*60*60*1000) // 3 days ago
    },
    {
      customer_name: 'Anita Desai',
      customer_email: 'anita.desai@email.com',
      type: 'product',
      rating: 5,
      message: 'Amazing shopping experience! The beauty products are authentic and reasonably priced. The website is easy to navigate. Will definitely shop again!',
      status: 'new',
      created_at: new Date(Date.now() - 8*60*60*1000) // 8 hours ago
    },
    {
      customer_name: 'Karthik Rao',
      customer_email: 'karthik.rao@email.com',
      type: 'suggestion',
      rating: 4,
      message: 'Please add a feature to track order history and reorder previous purchases easily. Also, email notifications for order updates would be helpful.',
      status: 'reviewed',
      created_at: new Date(Date.now() - 4*24*60*60*1000) // 4 days ago
    },
    {
      customer_name: 'Meera Iyer',
      customer_email: 'meera.iyer@email.com',
      type: 'service',
      rating: 5,
      message: 'Exceptional customer service! The support team helped me with my query within minutes. Very professional and friendly. Thank you!',
      status: 'responded',
      admin_response: 'Thank you so much for your kind words! We are thrilled to hear that our customer service team was able to assist you promptly. Customer satisfaction is our top priority, and feedback like yours motivates us to continue delivering excellent service.',
      responded_at: new Date(Date.now() - 2*24*60*60*1000),
      created_at: new Date(Date.now() - 5*24*60*60*1000) // 5 days ago
    },
    {
      customer_name: 'Rohan Mehta',
      customer_email: 'rohan.mehta@email.com',
      type: 'complaint',
      rating: 2,
      message: 'The product description was misleading. The actual product does not match what was shown in the images. Quality is also subpar for the price.',
      status: 'new',
      created_at: new Date(Date.now() - 12*60*60*1000) // 12 hours ago
    },
    {
      customer_name: 'Divya Nair',
      customer_email: 'divya.nair@email.com',
      type: 'product',
      rating: 4,
      message: 'Good product overall but delivery took longer than expected. The packaging was good and the product quality met expectations. Would order again.',
      status: 'reviewed',
      created_at: new Date(Date.now() - 6*24*60*60*1000) // 6 days ago
    },
    {
      customer_name: 'Arjun Pillai',
      customer_email: 'arjun.pillai@email.com',
      type: 'general',
      rating: 5,
      message: 'Love the variety of products available! The search functionality works great and filters are very helpful. The checkout process is smooth and secure.',
      status: 'responded',
      admin_response: 'We truly appreciate your positive feedback! It is wonderful to know that you are enjoying our product variety and user-friendly interface. We continuously work to enhance our platform and your comments encourage us to keep improving.',
      responded_at: new Date(Date.now() - 3*24*60*60*1000),
      created_at: new Date(Date.now() - 7*24*60*60*1000) // 7 days ago
    },
    {
      customer_name: 'Kavya Menon',
      customer_email: 'kavya.menon@email.com',
      type: 'suggestion',
      rating: 4,
      message: 'The mobile app would be a great addition. Also, consider adding product comparison feature to help customers make better decisions.',
      status: 'new',
      created_at: new Date(Date.now() - 18*60*60*1000) // 18 hours ago
    },
    {
      customer_name: 'Sanjay Gupta',
      customer_email: 'sanjay.gupta@email.com',
      type: 'service',
      rating: 3,
      message: 'Return process is complicated. Had difficulty initiating a return and the instructions were not clear. Please simplify the return/refund process.',
      status: 'reviewed',
      created_at: new Date(Date.now() - 8*24*60*60*1000) // 8 days ago
    },
    {
      customer_name: 'Neha Kapoor',
      customer_email: 'neha.kapoor@email.com',
      type: 'product',
      rating: 5,
      message: 'Perfect purchase! The product arrived exactly as described. Great quality, reasonable price, and fast delivery. Very satisfied customer!',
      status: 'responded',
      admin_response: 'Thank you for choosing Amzify! We are delighted that you had a perfect shopping experience with us. Your satisfaction means the world to us. Looking forward to serving you again!',
      responded_at: new Date(Date.now() - 4*24*60*60*1000),
      created_at: new Date(Date.now() - 9*24*60*60*1000) // 9 days ago
    },
    {
      customer_name: 'Aditya Verma',
      customer_email: 'aditya.verma@email.com',
      type: 'complaint',
      rating: 1,
      message: 'Worst experience ever! Order was delayed by a week without any notification. Customer service was unresponsive. Will not order again.',
      status: 'new',
      created_at: new Date(Date.now() - 3*60*60*1000) // 3 hours ago
    }
  ];

  try {
    // Clear existing feedback (optional - comment out if you want to keep existing data)
    await prisma.customer_feedback.deleteMany({});
    console.log('✓ Cleared existing customer feedback');

    // Insert feedback records
    for (const feedback of feedbackData) {
      await prisma.customer_feedback.create({
        data: feedback
      });
    }

    console.log(`✓ Seeded ${feedbackData.length} customer feedback records`);
    
    // Show stats
    const stats = await Promise.all([
      prisma.customer_feedback.count({ where: { status: 'new' } }),
      prisma.customer_feedback.count({ where: { status: 'reviewed' } }),
      prisma.customer_feedback.count({ where: { status: 'responded' } }),
    ]);

    console.log(`  - New: ${stats[0]}`);
    console.log(`  - Under Review: ${stats[1]}`);
    console.log(`  - Responded: ${stats[2]}`);

    // Calculate average rating
    const allFeedback = await prisma.customer_feedback.findMany({
      select: { rating: true }
    });
    const avgRating = allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length;
    console.log(`  - Average Rating: ${avgRating.toFixed(2)}/5`);

  } catch (error) {
    console.error('Error seeding customer feedback:', error);
    throw error;
  }
}

// Run the seed function
seedCustomerFeedback()
  .then(() => {
    console.log('✅ Customer feedback seeded successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
