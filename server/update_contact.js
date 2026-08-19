require('dotenv').config({ path: '../client/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const { data: contactData } = await supabase.from('pages').select('content').eq('slug', 'contact').single();
  const content = contactData.content;
  content.support_hours = [
    { days: 'Mon - Wed', hours: '09:00 - 16:00' },
    { days: 'Thursday', hours: '10:00 - 18:00' },
    { days: 'Friday', hours: '09:00 - 13:00' },
    { days: 'Sat - Sun', hours: 'Closed' }
  ];
  content.map_image = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxJSBZ5swU6O-pxAPkBC33Pht88stsl5tYhpsl25sgozLaSirU-tUKqZJ1KgOR-Du93L4vJ9KOKYReCF568w2pM0S0w410CY81lOv8EMxq2ber0GXUupfIaXOpqmTH2DgBqMsSPWREhocUDThrcyK9ZggitmhujJRGV0hLUxfL9-Jam2dva2QVcDCMnSVZ81zcu-ClBzLFhhMeuKvUIvJtiVMzEkw7npyWSc4k3_HbTfpWF7VbJxjH';
  await supabase.from('pages').update({ content }).eq('slug', 'contact');
  console.log('Contact updated');
}
main();
