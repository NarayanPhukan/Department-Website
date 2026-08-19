require('dotenv').config({ path: '../client/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const { data: aboutData } = await supabase.from('pages').select('content').eq('slug', 'about').single();
  const content = aboutData.content;
  content.faculty = [
    { name: 'Dr. Alan Turing', title: 'Distinguished Professor', desc: 'Expert in theoretical computer science and cryptography.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAW-FJJealjhXeDx3KzXt8UcMMNPm9QnaQe_ld2xczx1jW1wGhi4kjH_KCBMInEdZFQJVJgobwzTlYjMwtE65wYOR6dJs1Q4y0R6ho8ZHrxzl1NKvdvTP02ohK-oTR8lpwryh4r-j60pEEB8Y80reyLKO54sz7GpHPH55UuhIjlL3zHuIhhda5BRkA3jPfFFWBrf1wy0WD1TRDrRipZCQTjGiljlz1ntpsjJB1VoR3IBrCOTJcgZrL3' },
    { name: 'Dr. Grace Hopper', title: 'Associate Professor', desc: 'Focuses on compiler design and programming language theory.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBb07Z6HuMyNm5GEZstA3hk_95nTp8Rtd7mgFMnpJg79jyxz08HUmc-kdpVpl3fWYmdINfoyxfaimMUEsGN9UKRmgZNVGeA_YQAy8lyEc194XasyWQU2dAE5QBaLNezJgkwqpz8gLTLIKFwNg1mWCS64aRBo9fAiGY-h2PxtCrEK6dO82lgLwCShDAcCh7i3t7ZjPz3A06XiQdqM6opPSuZNt2BxPHDjZa8f6t2lQ_URnJCxNQ2OBVy' },
    { name: 'Dr. John von Neumann', title: 'Research Director', desc: 'Leading research in computer architecture and game theory.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3KcKpD99qW1Xy0vmFmla1HWi6lgzxC8NQhl-yugOtdjc1nGLpxa8avwhabb1S3QWwha2KB_l-sOXg5BgZjzNtvuAUmKhXopLdimZoJ3uwKJYQEnezph4wW02_RVN4gSMBZMsC1CjJY6dl9t4nAqO8SRxgZ2LkpMaDDP-e-TQssdAmc09kZzbGaA89teXUQXx8NOk6bMCO_HVtBPRekuJzpbfmGasZbo2OnPwWusGwGE0NqjyM86Ru' },
    { name: 'Dr. Ada Lovelace', title: 'Assistant Professor', desc: 'Specializes in algorithm design and computational logic.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlZAFHpl1i0AEUbkBfCGTVTnTh4kEYLJeiIe3_OlVhOnousbn-01H3pXKW7BugxkNyMc_4PHaVImkXLqRd4aCltUOwjcK46djIuL5dsDkfWigl199QLaIAqRhDcdo8pn4pF2y0AIO3vFEb10Z4rOOpVTZT03Z15uVy51VwM11X1ZRWl0cseTgRstWiFvqkopAQbTge8a5e9zXfDdb5Y58lubTeNjSKIRABg56cw-m4JRtWd7iWs0ak' }
  ];
  content.research = [
    { title: 'Artificial Intelligence', icon: 'memory', desc: 'Developing next-generation neural architectures, natural language processing models, and autonomous systems prioritizing ethical alignment.' },
    { title: 'Cybersecurity', icon: 'security', desc: 'Researching cryptographic protocols, zero-trust architectures, and automated threat detection to secure critical digital infrastructure.' },
    { title: 'Software Engineering', icon: 'terminal', desc: 'Improving formal verification methods, distributed systems reliability, and software lifecycle management tools.' }
  ];
  await supabase.from('pages').update({ content }).eq('slug', 'about');
  console.log('About updated');
}
main();
