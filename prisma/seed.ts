import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

function parseDatabaseUrl(raw: string) {
  const m = raw.match(
    /^mysql:\/\/([^:@]+)(?::(.*))?@([^:/?]+)(?::(\d+))?\/([^?#]+)/
  );
  if (!m) throw new Error(`Invalid DATABASE_URL: ${raw}`);
  return {
    user: decodeURIComponent(m[1]),
    password: m[2] ? decodeURIComponent(m[2]) : undefined,
    host: m[3],
    port: parseInt(m[4] || "3306"),
    database: m[5],
  };
}

const db = parseDatabaseUrl(
  process.env.DATABASE_URL || "mysql://root@localhost:3306/hunegnawpress"
);
const adapter = new PrismaMariaDb({
  host: db.host,
  port: db.port,
  user: db.user,
  password: db.password,
  database: db.database,
  connectionLimit: 5,
  allowPublicKeyRetrieval: true,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding HunegnawPress database...");

  // Create default organization with neutral colors
  const org = await prisma.organization.upsert({
    where: { id: "default-org" },
    update: {},
    create: {
      id: "default-org",
      name: "My Website",
      legalName: "My Company LLC",
      email: "info@example.com",
      website: "http://localhost:3000",
      primaryColor: "#334155",
      secondaryColor: "#2563eb",
      accentColor: "#3b82f6",
      twoFactorPolicy: "optional",
      disclaimer: "All content is for informational purposes only.",
    },
  });
  console.log(`Organization: ${org.name}`);

  // Create default super admin
  const adminPassword = await bcrypt.hash("admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@hunegnawpress.local" },
    update: {},
    create: {
      email: "admin@hunegnawpress.local",
      password: adminPassword,
      name: "System Admin",
      role: "SUPER_ADMIN",
      emailVerified: new Date(),
    },
  });
  console.log(`Admin user: ${admin.email}`);

  // Blog categories
  const blogCategories = [
    { name: "News", slug: "news", color: "#2563eb", sortOrder: 1 },
    { name: "Updates", slug: "updates", color: "#334155", sortOrder: 2 },
    { name: "Insights", slug: "insights", color: "#7c3aed", sortOrder: 3 },
  ];

  for (const cat of blogCategories) {
    await prisma.blogCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`Created ${blogCategories.length} blog categories`);

  // Sample homepage
  const existingHomepage = await prisma.page.findFirst({ where: { isHomepage: true } });
  if (!existingHomepage) {
    const homepage = await prisma.page.create({
      data: {
        title: "Home",
        slug: "home",
        status: "PUBLISHED",
        isHomepage: true,
        metaTitle: "Welcome | My Website",
        metaDescription: "Welcome to our website.",
      },
    });

    const homepageBlocks = [
      {
        type: "hero_image",
        props: {
          imageUrl: "",
          heading: "Welcome to Our Website",
          subheading: "Build something amazing.",
          ctaText: "Get Started",
          ctaUrl: "/contact",
          overlayOpacity: 0.5,
        },
        sortOrder: 0,
      },
      {
        type: "text_section",
        props: {
          content: '<h2 style="text-align: center">About Us</h2><p style="text-align: center">We are dedicated to delivering excellence. Learn more about what we do and how we can help you achieve your goals.</p>',
          maxWidth: "4xl",
          backgroundColor: "transparent",
          textColor: "",
          paddingY: "lg",
        },
        sortOrder: 1,
      },
      {
        type: "cta_banner",
        props: {
          heading: "Ready to Get Started?",
          text: "Contact us today to learn more about what we can do for you.",
          ctaText: "Contact Us",
          ctaUrl: "/contact",
          backgroundColor: "#2563eb",
        },
        sortOrder: 2,
      },
      {
        type: "newsletter_signup",
        props: {
          heading: "Stay Updated",
          description: "Subscribe to our newsletter for the latest news and updates.",
          backgroundColor: "#1e293b",
        },
        sortOrder: 3,
      },
    ];

    for (const block of homepageBlocks) {
      await prisma.pageBlock.create({
        data: {
          pageId: homepage.id,
          type: block.type,
          props: block.props,
          sortOrder: block.sortOrder,
        },
      });
    }
    console.log("Created homepage with blocks");
  }

  // Contact page
  const existingContact = await prisma.page.findFirst({ where: { slug: "contact" } });
  if (!existingContact) {
    const contactPage = await prisma.page.create({
      data: {
        title: "Contact",
        slug: "contact",
        status: "PUBLISHED",
        isHomepage: false,
        showInNav: true,
        navLabel: "Contact",
        navOrder: 10,
        metaTitle: "Contact Us",
        metaDescription: "Get in touch with us.",
      },
    });

    const contactBlocks = [
      {
        type: "hero_image",
        props: {
          imageUrl: "",
          heading: "Contact Us",
          subheading: "We'd love to hear from you.",
          ctaText: "",
          ctaUrl: "",
          overlayOpacity: 0.5,
        },
        sortOrder: 0,
      },
      {
        type: "contact_form",
        props: {
          heading: "Get in Touch",
          description: "Fill out the form below and we'll get back to you shortly.",
          showAddress: true,
          showEmail: true,
        },
        sortOrder: 1,
      },
    ];

    for (const block of contactBlocks) {
      await prisma.pageBlock.create({
        data: {
          pageId: contactPage.id,
          type: block.type,
          props: block.props,
          sortOrder: block.sortOrder,
        },
      });
    }
    console.log("Created contact page with blocks");
  }

  // Sample blog post
  const existingPost = await prisma.blogPost.findFirst({ where: { slug: "welcome" } });
  if (!existingPost) {
    await prisma.blogPost.create({
      data: {
        title: "Welcome to Our Blog",
        slug: "welcome",
        content: "<p>Welcome to our blog! This is a sample post to help you get started. You can edit or delete this post from the admin panel.</p><h2>Getting Started</h2><p>Head over to the admin panel to create new pages, write blog posts, upload media, and customize your site settings.</p>",
        excerpt: "Welcome to our blog! This is a sample post to get you started.",
        authorId: admin.id,
        readTime: 1,
        isPublished: true,
        isDraft: false,
        publishedAt: new Date(),
      },
    });
    console.log("Created sample blog post");
  }

  console.log("\nSeeding completed successfully!");
  console.log("\nDefault Admin Account:");
  console.log("  Email: admin@hunegnawpress.local");
  console.log("  Password: admin123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
