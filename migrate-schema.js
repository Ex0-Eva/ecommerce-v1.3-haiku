const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(url, key);

async function createTables() {
  console.log('Creating tables programmatically...');

  try {
    // Create products table
    console.log('Creating products table...');
    const { error: productsError } = await supabase.rpc('create_products_table');
    if (productsError && !productsError.message.includes('already exists')) {
      console.log('Products table creation attempted (may already exist)');
    }

    // Create orders table
    console.log('Creating orders table...');
    const { error: ordersError } = await supabase.rpc('create_orders_table');
    if (ordersError && !ordersError.message.includes('already exists')) {
      console.log('Orders table creation attempted (may already exist)');
    }

    // Insert sample products
    console.log('Inserting sample products...');
    const { error: insertError } = await supabase
      .from('products')
      .upsert([
        {
          id: 'p1',
          name: 'สินค้าสำหรับลองระบบ',
          description: 'คำอธิบายสินค้า เบื้องต้นเตรียมไว้สำหรับเชื่อมต่อกับฐานข้อมูลต่อไป',
          price: 1290.00,
          stock: 12,
          is_active: true
        },
        {
          id: 'p2',
          name: 'สินค้าเพิ่มยอด',
          description: 'สินค้าที่ช่วยเพิ่มยอดขายได้ดี',
          price: 1590.00,
          stock: 8,
          is_active: true
        },
        {
          id: 'p3',
          name: 'สินค้าแนะนำ',
          description: 'สินค้าที่ลูกค้าชื่นชอบมากที่สุด',
          price: 1890.00,
          stock: 4,
          is_active: true
        }
      ], { onConflict: 'id' });

    if (insertError) {
      console.error('Insert products error:', insertError);
    } else {
      console.log('Sample products inserted');
    }

    // Test queries
    console.log('Testing queries...');
    const { data: products, error: queryError } = await supabase
      .from('products')
      .select('*')
      .limit(5);

    if (queryError) {
      console.error('Query error:', queryError);
    } else {
      console.log(`Found ${products?.length || 0} products`);
      console.log('Sample product:', products?.[0]);
    }

  } catch (error) {
    console.error('Table creation failed:', error.message);
    console.log('\nPlease run the following SQL in Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/YOUR_PROJECT/sql');
    console.log('\nCopy and paste the contents of supabase-schema.sql');
  }
}

createTables();