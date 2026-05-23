// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Categories
  const categories = [
    { name: 'Politics', slug: 'politics', description: 'Political news, elections, and government affairs' },
    { name: 'Technology', slug: 'technology', description: 'Tech news, gadgets, AI, and innovation' },
    { name: 'Sports', slug: 'sports', description: 'Sports news, scores, and highlights' },
    { name: 'Business', slug: 'business', description: 'Business, finance, and economy' },
    { name: 'Entertainment', slug: 'entertainment', description: 'Movies, music, and celebrity news' },
    { name: 'World', slug: 'world', description: 'International news and global affairs' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log('✅ Categories created');

  // 2. Create Users (Admin, Author, Reader)
  const salt = await bcrypt.genSalt(10);
  
  const users = [
    {
      name: 'System Administrator',
      email: 'admin@newsportal.com',
      password: await bcrypt.hash('Admin@123', salt),
      role: 'ADMIN',
      isActive: true,
      bio: 'System Administrator with full control',
    },
    {
      name: 'Sarah Johnson',
      email: 'author@newsportal.com',
      password: await bcrypt.hash('Author@123', salt),
      role: 'AUTHOR',
      isActive: true,
      bio: 'Senior Technology Journalist',
    },
    {
      name: 'Mike Reader',
      email: 'reader@newsportal.com',
      password: await bcrypt.hash('Reader@123', salt),
      role: 'USER',
      isActive: true,
      bio: 'Daily news enthusiast',
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }
  console.log('✅ Users created (Admin, Author, Reader)');

  // 3. Create Sample Articles
  const categoriesFromDb = await prisma.category.findMany();
  const author = await prisma.user.findUnique({ where: { email: 'author@newsportal.com' } });
  const admin = await prisma.user.findUnique({ where: { email: 'admin@newsportal.com' } });

  if (author && admin) {
    const techCategory = categoriesFromDb.find(c => c.slug === 'technology');
    const politicsCategory = categoriesFromDb.find(c => c.slug === 'politics');
    const businessCategory = categoriesFromDb.find(c => c.slug === 'business');
    const sportsCategory = categoriesFromDb.find(c => c.slug === 'sports');
    
    // Draft article (Author working on it)
    await prisma.article.create({
      data: {
        title: 'The Future of AI in Journalism',
        content: 'Artificial intelligence is revolutionizing how news is gathered and reported. From automated fact-checking to personalized news delivery, AI is transforming every aspect of journalism. Newsrooms worldwide are adopting AI tools to enhance their reporting capabilities.',
        summary: 'Exploring how AI tools are transforming newsrooms worldwide',
        status: 'DRAFT',
        authorId: author.id,
        categoryId: techCategory.id,
      },
    });

    // Pending approval article (Waiting for admin review)
    await prisma.article.create({
      data: {
        title: 'Breaking: Quantum Computing Breakthrough Announced',
        content: 'A major breakthrough in quantum computing was announced today by researchers at the National Quantum Computing Centre. This development could revolutionize computing as we know it, with potential applications in cryptography, drug discovery, and climate modeling.',
        summary: 'Quantum computing breakthrough promises 10x faster processing speeds',
        status: 'PENDING_APPROVAL',
        authorId: author.id,
        categoryId: techCategory.id,
      },
    });

    // Published article - Technology (Live on portal)
    await prisma.article.create({
      data: {
        title: 'How to Start a Career in Web Development in 2025',
        content: 'Full-stack development remains one of the most in-demand skills in the tech industry. This comprehensive guide covers the essential technologies you need to learn: HTML, CSS, JavaScript, React, Node.js, and databases. With dedication and the right resources, you can land your first developer job within 6-12 months.',
        summary: 'Complete guide for beginners looking to enter web development',
        status: 'PUBLISHED',
        publishedAt: new Date('2025-03-15'),
        authorId: author.id,
        categoryId: techCategory.id,
        reviewedBy: admin.id,
        reviewedAt: new Date('2025-03-14'),
        viewCount: 1520,
      },
    });

    // Published article - Politics
    await prisma.article.create({
      data: {
        title: '2025 Election Results: Key Takeaways and What They Mean',
        content: 'The recent national election has brought significant changes to the political landscape. Voter turnout reached an all-time high of 67%, with young voters playing a crucial role. Key issues driving the vote included the economy, healthcare, and climate change policies.',
        summary: 'Key highlights and analysis from the latest election results',
        status: 'PUBLISHED',
        publishedAt: new Date('2025-03-10'),
        authorId: author.id,
        categoryId: politicsCategory.id,
        reviewedBy: admin.id,
        reviewedAt: new Date('2025-03-09'),
        viewCount: 3420,
      },
    });

    // Published article - Business
    await prisma.article.create({
      data: {
        title: 'Tech Stocks Rally as AI Sector Shows Strong Growth',
        content: 'Major technology companies reported better-than-expected quarterly earnings, driven by strong demand for AI-related products and services. Investors are increasingly optimistic about the sector\'s growth prospects, with several analysts raising their price targets.',
        summary: 'AI boom continues to drive tech sector performance',
        status: 'PUBLISHED',
        publishedAt: new Date('2025-03-05'),
        authorId: author.id,
        categoryId: businessCategory.id,
        reviewedBy: admin.id,
        reviewedAt: new Date('2025-03-04'),
        viewCount: 2100,
      },
    });

    // Published article - Sports
    await prisma.article.create({
      data: {
        title: 'Championship Final: Underdog Team Claims Victory',
        content: 'In a stunning upset, the underdog team defeated the defending champions 3-1 in the championship final. The match saw record-breaking attendance and thrilling moments that will be remembered for years to come.',
        summary: 'Historic victory as underdogs take the championship title',
        status: 'PUBLISHED',
        publishedAt: new Date('2025-03-01'),
        authorId: author.id,
        categoryId: sportsCategory.id,
        reviewedBy: admin.id,
        reviewedAt: new Date('2025-02-28'),
        viewCount: 5100,
      },
    });
  }
  console.log('✅ Sample articles created');

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔴 ADMIN:   admin@newsportal.com / Admin@123');
  console.log('🟡 AUTHOR:  author@newsportal.com / Author@123');
  console.log('🔵 READER:  reader@newsportal.com / Reader@123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });