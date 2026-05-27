const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mculatbcnsowekoryzcy.supabase.co';
const supabaseKey = 'sb_publishable_QHNa-oKfUvYgmBaYm0zUqA_nS71jA-n';
const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  console.log('🔷 ดึงข้อมูลสินค้า...\n');
  
  const { data, error } = await supabase
    .from('v12_products')
    .select('id, name, is_active')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.log('❌ Error:', error.message);
  } else {
    console.log(`📊 จำนวนสินค้าทั้งหมด: ${data.length}`);
    console.log('\n📋 รายชื่อสินค้า:');
    data.forEach((p, i) => {
      const status = p.is_active ? '✅ Active' : '❌ Hidden';
      console.log(`  ${i+1}. ${p.name} [${p.id}] ${status}`);
    });
    
    const p5 = data.find(p => p.id === 'p5');
    if (p5) {
      console.log(`\n⚠️ "Software License Key" (p5) ยังอยู่ในฐานข้อมูล!`);
      console.log(`   is_active: ${p5.is_active}`);
    } else {
      console.log(`\n✅ "Software License Key" (p5) ถูกลบแล้ว!`);
    }
  }
})();
