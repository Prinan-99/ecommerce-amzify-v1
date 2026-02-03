import { PrismaClient } from '../generated/prisma/index.js';
const prisma = new PrismaClient();

async function checkSellers() {
  try {
    const sellers = await prisma.users.findMany({
      where: { role: 'seller' },
      include: { seller_profiles: true }
    });
    
    console.log('=== SELLERS IN DATABASE ===');
    console.log('Total sellers found:', sellers.length);
    console.log('');
    
    if (sellers.length === 0) {
      console.log('No sellers found in database');
    } else {
      sellers.forEach((seller, index) => {
        console.log(`Seller ${index + 1}:`);
        console.log('  Email:', seller.email);
        console.log('  Name:', seller.first_name, seller.last_name);
        console.log('  Role:', seller.role);
        console.log('  Active:', seller.is_active);
        console.log('  Profile:', seller.seller_profiles.length > 0 ? 'Yes' : 'No');
        if (seller.seller_profiles.length > 0) {
          console.log('  Company:', seller.seller_profiles[0].company_name);
          console.log('  Approved:', seller.seller_profiles[0].is_approved);
        }
        console.log('');
      });
    }
  } catch (error) {
    console.error('Error checking sellers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSellers();
