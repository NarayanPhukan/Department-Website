const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://wczihxegjvyjgvkixoel.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjemloeGVnanZ5amd2a2l4b2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxMjQ2OTYsImV4cCI6MjEwMjcwMDY5Nn0.QlFpkTW3MltYCiO6X8QG7LW4vxZ_TEWFHhPFqZXPMA4');

async function test() {
  const { data: subs } = await supabase.from('subjects').select('id').limit(1);
  const subId = subs[0].id;
  
  const { data, error } = await supabase.from('applications').insert([
    {
      full_name: 'Test Student',
      enrollment_id: 'CS-2024-001',
      phone_num: '123',
      email: 'test2@test.com',
      current_program: 'Bsc',
      current_semester: 'Semester 1',
      current_major: 'computer_science',
      subject_id: subId
    }
  ]);
  console.log('Error:', error);
}
test();
