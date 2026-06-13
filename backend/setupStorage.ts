import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Setting up Supabase Storage bucket "uploads"...');

  try {
    // Insert bucket
    await prisma.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('uploads', 'uploads', true)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Create policies
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Public Access" ON storage.objects FOR SELECT TO public USING (bucket_id = 'uploads');
    `).catch(() => console.log('Policy "Public Access" might already exist.'));

    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Public Uploads" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'uploads');
    `).catch(() => console.log('Policy "Public Uploads" might already exist.'));

    console.log('Storage setup complete!');
  } catch (error) {
    console.error('Error setting up storage:', error);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
