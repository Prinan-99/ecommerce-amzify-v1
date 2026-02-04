import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

async function approveAllSellers() {
  try {
    console.log('=== Approving All Sellers ===\n');
    
    // Get all seller profiles that are not approved
    const unapprovedProfiles = await prisma.seller_profiles.findMany({
      where: {
        is_approved: false
      },
      include: {
        users: {
          select: {
            email: true,
            first_name: true,
            last_name: true
          }
        }
      }
    });
    
    if (unapprovedProfiles.length === 0) {
      console.log('✓ No unapproved sellers found. All sellers are already approved!');
      return;
    }
    
    console.log(`Found ${unapprovedProfiles.length} unapproved seller(s):\n`);
    
    unapprovedProfiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.users.email} - ${profile.company_name}`);
    });
    
    console.log('\nApproving all sellers...\n');
    
    // Approve all sellers
    const result = await prisma.seller_profiles.updateMany({
      where: {
        is_approved: false
      },
      data: {
        is_approved: true,
        approval_date: new Date()
      }
    });
    
    console.log(`✅ SUCCESS! Approved ${result.count} seller(s)\n`);
    
    // Show all approved sellers
    const allSellers = await prisma.users.findMany({
      where: { role: 'seller' },
      include: { 
        seller_profiles: {
          select: {
            company_name: true,
            is_approved: true
          }
        }
      }
    });
    
    console.log('=== All Sellers Status ===\n');
    allSellers.forEach((seller, index) => {
      const profile = seller.seller_profiles[0];
      console.log(`${index + 1}. ${seller.email}`);
      console.log(`   Company: ${profile?.company_name || 'No profile'}`);
      console.log(`   Approved: ${profile?.is_approved ? '✅ YES' : '❌ NO'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error approving sellers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

approveAllSellers();
