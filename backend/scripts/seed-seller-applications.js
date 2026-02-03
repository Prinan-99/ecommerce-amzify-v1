import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';

async function seedSellerApplications() {
  console.log('🌱 Seeding seller applications...');

  const applications = [
    {
      first_name: 'Rajesh',
      last_name: 'Kumar',
      email: 'rajesh@techstore.com',
      phone: '+91-9876543210',
      password_hash: await bcrypt.hash('TechStore@123', 10),
      company_name: 'Tech Store India',
      business_type: 'Electronics',
      business_description: 'High-quality electronics and gadgets',
      business_address: '123 Tech Plaza',
      city: 'Bangalore',
      state: 'Karnataka',
      postal_code: '560001',
      gst_number: '27AAPFU0055K1ZO',
      pan_number: 'AAAPF5055K',
      bank_name: 'HDFC Bank',
      account_number: '1234567890123456',
      ifsc_code: 'HDFC0000001',
      account_holder_name: 'Rajesh Kumar',
      status: 'pending',
      created_at: new Date(Date.now() - 2*24*60*60*1000),
      updated_at: new Date(Date.now() - 2*24*60*60*1000)
    },
    {
      first_name: 'Priya',
      last_name: 'Sharma',
      email: 'priya@fashionhub.in',
      phone: '+91-9123456789',
      password_hash: await bcrypt.hash('FashionHub@123', 10),
      company_name: 'Fashion Hub',
      business_type: 'Clothing & Fashion',
      business_description: 'Trendy clothing and accessories for men and women',
      business_address: '45 MG Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      postal_code: '400001',
      gst_number: '27BBCDE1234F1Z5',
      pan_number: 'BBCDE1234F',
      bank_name: 'ICICI Bank',
      account_number: '9876543210987654',
      ifsc_code: 'ICIC0000123',
      account_holder_name: 'Priya Sharma',
      status: 'pending',
      created_at: new Date(Date.now() - 5*24*60*60*1000),
      updated_at: new Date(Date.now() - 5*24*60*60*1000)
    },
    {
      first_name: 'Amit',
      last_name: 'Patel',
      email: 'amit@organicfresh.co',
      phone: '+91-9988776655',
      password_hash: await bcrypt.hash('OrganicFresh@123', 10),
      company_name: 'Organic Fresh',
      business_type: 'Food & Beverages',
      business_description: 'Organic fruits, vegetables, and health foods',
      business_address: '78 Green Valley',
      city: 'Pune',
      state: 'Maharashtra',
      postal_code: '411001',
      gst_number: '27CDEFG5678H1Z9',
      pan_number: 'CDEFG5678H',
      bank_name: 'SBI',
      account_number: '1122334455667788',
      ifsc_code: 'SBIN0001234',
      account_holder_name: 'Amit Patel',
      status: 'approved',
      reviewed_at: new Date(Date.now() - 10*24*60*60*1000),
      created_at: new Date(Date.now() - 15*24*60*60*1000),
      updated_at: new Date(Date.now() - 10*24*60*60*1000)
    },
    {
      first_name: 'Sneha',
      last_name: 'Reddy',
      email: 'sneha@homeessentials.com',
      phone: '+91-9876501234',
      password_hash: await bcrypt.hash('HomeEssentials@123', 10),
      company_name: 'Home Essentials',
      business_type: 'Home & Kitchen',
      business_description: 'Quality home decor, kitchen appliances, and furniture',
      business_address: '234 Jubilee Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      postal_code: '500033',
      gst_number: '36FGHIJ9012K1Z3',
      pan_number: 'FGHIJ9012K',
      bank_name: 'Axis Bank',
      account_number: '2233445566778899',
      ifsc_code: 'UTIB0000567',
      account_holder_name: 'Sneha Reddy',
      status: 'pending',
      created_at: new Date(Date.now() - 1*24*60*60*1000),
      updated_at: new Date(Date.now() - 1*24*60*60*1000)
    },
    {
      first_name: 'Vikram',
      last_name: 'Singh',
      email: 'vikram@sportsgear.net',
      phone: '+91-9812345678',
      password_hash: await bcrypt.hash('SportsGear@123', 10),
      company_name: 'Sports Gear Pro',
      business_type: 'Sports & Fitness',
      business_description: 'Professional sports equipment and fitness gear',
      business_address: '56 Stadium Road',
      city: 'Delhi',
      state: 'Delhi',
      postal_code: '110001',
      gst_number: '07HIJKL3456M1Z7',
      pan_number: 'HIJKL3456M',
      bank_name: 'HDFC Bank',
      account_number: '3344556677889900',
      ifsc_code: 'HDFC0000789',
      account_holder_name: 'Vikram Singh',
      status: 'rejected',
      rejection_reason: 'Incomplete business documents',
      reviewed_at: new Date(Date.now() - 18*24*60*60*1000),
      created_at: new Date(Date.now() - 20*24*60*60*1000),
      updated_at: new Date(Date.now() - 18*24*60*60*1000)
    },
    {
      first_name: 'Anita',
      last_name: 'Desai',
      email: 'anita@beautycare.in',
      phone: '+91-9765432109',
      password_hash: await bcrypt.hash('BeautyCare@123', 10),
      company_name: 'Beauty Care Hub',
      business_type: 'Beauty & Personal Care',
      business_description: 'Premium skincare, cosmetics, and beauty products',
      business_address: '89 Park Street',
      city: 'Kolkata',
      state: 'West Bengal',
      postal_code: '700016',
      gst_number: '19JKLMN7890P1Z1',
      pan_number: 'JKLMN7890P',
      bank_name: 'Kotak Mahindra Bank',
      account_number: '4455667788990011',
      ifsc_code: 'KKBK0000234',
      account_holder_name: 'Anita Desai',
      status: 'approved',
      reviewed_at: new Date(Date.now() - 25*24*60*60*1000),
      created_at: new Date(Date.now() - 30*24*60*60*1000),
      updated_at: new Date(Date.now() - 25*24*60*60*1000)
    },
    {
      first_name: 'Karthik',
      last_name: 'Rao',
      email: 'karthik@bookworld.co',
      phone: '+91-9654321098',
      password_hash: await bcrypt.hash('BookWorld@123', 10),
      company_name: 'Book World',
      business_type: 'Books & Media',
      business_description: 'Wide collection of books, magazines, and educational materials',
      business_address: '123 Gandhi Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postal_code: '600020',
      gst_number: '33MNOPQ1234R1Z5',
      pan_number: 'MNOPQ1234R',
      bank_name: 'SBI',
      account_number: '5566778899001122',
      ifsc_code: 'SBIN0005678',
      account_holder_name: 'Karthik Rao',
      status: 'pending',
      created_at: new Date(Date.now() - 7*24*60*60*1000),
      updated_at: new Date(Date.now() - 7*24*60*60*1000)
    },
    {
      first_name: 'Meera',
      last_name: 'Iyer',
      email: 'meera@handicrafts.com',
      phone: '+91-9543210987',
      password_hash: await bcrypt.hash('Handicrafts@123', 10),
      company_name: 'Artisan Handicrafts',
      business_type: 'Handicrafts & Art',
      business_description: 'Handmade crafts, pottery, and traditional Indian art',
      business_address: '67 Heritage Lane',
      city: 'Jaipur',
      state: 'Rajasthan',
      postal_code: '302001',
      gst_number: '08PQRST5678U1Z9',
      pan_number: 'PQRST5678U',
      bank_name: 'Punjab National Bank',
      account_number: '6677889900112233',
      ifsc_code: 'PUNB0012340',
      account_holder_name: 'Meera Iyer',
      status: 'approved',
      reviewed_at: new Date(Date.now() - 40*24*60*60*1000),
      created_at: new Date(Date.now() - 45*24*60*60*1000),
      updated_at: new Date(Date.now() - 40*24*60*60*1000)
    },
    {
      first_name: 'Rohan',
      last_name: 'Mehta',
      email: 'rohan@petcare.in',
      phone: '+91-9432109876',
      password_hash: await bcrypt.hash('PetCare@123', 10),
      company_name: 'Pet Care Plus',
      business_type: 'Pet Supplies',
      business_description: 'Complete pet care solutions, food, toys, and accessories',
      business_address: '234 Pet Street',
      city: 'Ahmedabad',
      state: 'Gujarat',
      postal_code: '380001',
      gst_number: '24STUVW9012X1Z3',
      pan_number: 'STUVW9012X',
      bank_name: 'ICICI Bank',
      account_number: '7788990011223344',
      ifsc_code: 'ICIC0000890',
      account_holder_name: 'Rohan Mehta',
      status: 'pending',
      created_at: new Date(Date.now() - 3*24*60*60*1000),
      updated_at: new Date(Date.now() - 3*24*60*60*1000)
    },
    {
      first_name: 'Divya',
      last_name: 'Nair',
      email: 'divya@jewelrybox.com',
      phone: '+91-9321098765',
      password_hash: await bcrypt.hash('Jewelry@123', 10),
      company_name: 'Jewelry Box',
      business_type: 'Jewelry & Accessories',
      business_description: 'Designer jewelry, gold, silver, and fashion accessories',
      business_address: '45 Gems Plaza',
      city: 'Surat',
      state: 'Gujarat',
      postal_code: '395001',
      gst_number: '24VWXYZ3456A1Z7',
      pan_number: 'VWXYZ3456A',
      bank_name: 'HDFC Bank',
      account_number: '8899001122334455',
      ifsc_code: 'HDFC0001234',
      account_holder_name: 'Divya Nair',
      status: 'rejected',
      rejection_reason: 'GST verification failed',
      reviewed_at: new Date(Date.now() - 10*24*60*60*1000),
      created_at: new Date(Date.now() - 12*24*60*60*1000),
      updated_at: new Date(Date.now() - 10*24*60*60*1000)
    }
  ];

  try {
    // Clear existing applications (optional - comment out if you want to keep existing data)
    await prisma.seller_applications.deleteMany({});
    console.log('✓ Cleared existing seller applications');

    // Insert applications
    for (const app of applications) {
      await prisma.seller_applications.create({
        data: app
      });
    }

    console.log(`✓ Seeded ${applications.length} seller applications`);
    
    // Show stats
    const stats = await Promise.all([
      prisma.seller_applications.count({ where: { status: 'pending' } }),
      prisma.seller_applications.count({ where: { status: 'approved' } }),
      prisma.seller_applications.count({ where: { status: 'rejected' } }),
    ]);

    console.log(`  - Pending: ${stats[0]}`);
    console.log(`  - Approved: ${stats[1]}`);
    console.log(`  - Rejected: ${stats[2]}`);

  } catch (error) {
    console.error('Error seeding seller applications:', error);
    throw error;
  }
}

// Run the seed function
seedSellerApplications()
  .then(() => {
    console.log('✅ Seller applications seeded successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
