require('dotenv').config({ path: './client/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function main() {
  const homeContent = {
    hero: {
      title: 'Pioneering the Future of Computation',
      subtitle: 'Dedicated to rigorous academic research and cutting-edge software engineering. Join a community where theoretical mathematics meets practical innovation.',
      bg_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBT5uuZvx2jMjhLWrrhyuEYtbnrIXBC8BVX2O8osHmPbJ_2zD_pDNSoBGrOjmuR9elUyxTHF-EUlTnnKn7G9PZWT5f5ikAvJpy99TaDdFyeOZIHGBbWUE8nfldEMzK37FupNlJ9dsKwjH3NaWRU6DOYuM2wprMj2o3KuNwqEV52sGw9OSEcrGbxHRQ8iwgNwQfgKOGyydY7ykqMioTKDttK1Nfwx9YG49fCO0JNRBAJXvyvhmbeDZ0y'
    },
    highlights_title: 'Department Highlights',
    large_highlight: {
      title: 'Advanced Research Computing',
      description: 'Access to state-of-the-art supercomputing facilities for AI, machine learning, and complex system simulations. Our infrastructure supports groundbreaking theoretical and applied research.',
      bg_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqbYPOJLqwMsmLVYSeE4meNMMXb6Wpjg5bWk6TQBRvfC4WGHgJP1UYd4MW1r2XBbJe3VD3_iiX6jFBJQ0Q-dEHBw7Bb8IcFr0mjMdTKkV6Fag4q4GBngWokghOaHyVF5xLRGhiVgdesbnFuQBTF8EgG54_Kp8S6fa65JvYZsGBrxnoUjLoyyp9Y2eYd1HjQXArLy6sbp_FcNgKgDkw4Bggw2PvVnoy5Bo36_dUVrcF33n89kaaYhgq'
    },
    small_highlight_1: {
      title: 'Award-Winning Faculty',
      description: 'Learn from Turing Award winners and industry pioneers who are actively shaping the future of computer science.',
      icon: 'workspace_premium'
    },
    small_highlight_2: {
      title: 'Industry Partnerships',
      description: 'Direct pipelines to top tech companies in Silicon Valley and beyond for internships and collaborative projects.',
      icon: 'handshake'
    },
    medium_highlight: {
      title: 'Student Innovation Lab',
      description: 'A dedicated 24/7 maker space equipped with hardware dev kits, VR rigs, and collaborative workstations.',
      bg_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAc0mVhCcSiqhQlV8xprwaO7ZEQE1bgzW-m4ye6c5s-6u0fY18un_sV2WVpCnu6HkfajChpM--H2i0l1GjGrtXrRmOiGKvvhLHpu1i2iYPt3P-csOztkqszbn0HNE59I18WXpYcWgdMo8fOsPlS18W3zYhtKlrFEBQ4TI68Nzv3kAQyW5yInqU5AA6w7bEsHIdAlc56hRoot5QGXWtAwhfl1ZOgTGgbThjg0v6nVb3J89pW2GGifb9-'
    },
    news: [
      {
        title: 'Breakthrough in Quantum Error Correction Algorithms',
        category_date: 'Research • Oct 12, 2024',
        bg_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHvkd9HmXJXvlA6HsNFFSguZXEdLtIOrO_nTKrCAYGcFDWZ-YvKg4bBiV9LppoxwWk8JTKTOwN7SgwzLuuo8yCZUjI6Vn7bQBDO-YY9mJ9lkPkdGQgq3Z4uzD_INspulPJ-XlbaHp4rSOn9sH92ni1zBlKhK51s_aH1xiE64JhAFbWzi5iGyB7m-vGLS3tfqSrZLzGbbeNL5VSApVS1XJjVfKAlNfLv3SbXPE6_lZVBqgHJiHzwj5h'
      },
      {
        title: 'Undergraduate Team Wins National Hackathon',
        category_date: 'Student Life • Oct 05, 2024',
        bg_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiAoDedecY2_J1xedCyGKwnYhh3M-MYgBxsKDTO8yNWXUqhaVD5htvY-jtPwbN96bDW7tEwLhfgAZDKa1s6hZ9-YUta3um-m5KBBE-X-9VKuAK6Oj-246rDPrKheAhrJJZXf1ki3lrKKTztT3lkonSgyD3cwMKWNvt32__wJHuIWAC-ez5vhxaG94swRpjsDCLqHZQtuQxSmyEmyB3_iz4Go8GuyLFl6xP6_deVh8R_2jrf11xhOyj'
      },
      {
        title: 'New Grant Awarded for AI Ethics Research Initiative',
        category_date: 'Faculty • Sep 28, 2024',
        bg_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrIBOEeEAkU527hCzY39nM9SYKSuHeRk3iYvILvkxACmJ2FpFc20nIat0QdE2hr0XxXRsPPmWQcJqZDPlzY_yGehFy2M4n6_Uu3sW-vDgJjicgEss7SWd-JBXFir_jXD3Bn4E-xktBi2vzm0065MNwG3DDiZ1G166eszKiI4w__E5zGr9hbqrDAyAYIEoyuXdsDfgk-FEXNoIun348UByQ8HGqvYfe0gTUoHKrYa4r95oZm2hc0fK6'
      }
    ],
    events: [
      {
        title: 'Tech Industry Career Fair',
        month: 'Oct',
        day: '18',
        time: '10:00 AM - 4:00 PM',
        location: 'Main Campus Student Center'
      },
      {
        title: 'Distinguished Speaker Series: The Future of Cloud Architecture',
        month: 'Oct',
        day: '22',
        time: '6:00 PM - 7:30 PM',
        location: 'Turing Auditorium'
      },
      {
        title: 'Spring Registration Deadline',
        month: 'Nov',
        day: '05',
        time: 'All Undergraduate CS Majors',
        location: ''
      }
    ]
  };

  const aboutContent = {
    hero: {
      title: 'Advancing the Frontiers of Computation',
      description: 'The Computer Science Department is dedicated to pioneering research and transformative education. Our mission is to cultivate theoretical understanding and practical engineering skills, empowering the next generation of technologists to solve complex global challenges.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfP-miMQXuCRYqmwCVKIL1Uzhq5XZq1YtSjcjNKecMvFdt3HDgECsOuohyT79RE-ljuubEs4PzE9vhMy7q4kEg3ziQUVPcP2W-TiszsYGGT6pBxGBliODd7MudS60Ie4eVvZwZuAUFDevpnGTVkVzVNlD__NaM0jmzsMNugzNo5cnNeLK40OAmo3cILVIcjLDLYyosqxwY1dDTV_6fTpm26cVezTyuEO-snDzqL2O2eeu9dOzJ0EMc'
    },
    history_title: 'Our History',
    history: [
      {
        title: 'Founding Principles',
        description: 'Established in 1968, our department was among the first to integrate formal logic with hardware engineering, setting a precedent for rigorous academic computing.',
        year: '1968 - Inception',
        isLarge: true
      },
      {
        title: 'AI Lab',
        description: 'Pioneering early machine learning paradigms.',
        year: '1985 - Milestone',
        isLarge: false
      },
      {
        title: 'Cybersecurity Center',
        description: 'Responding to the growing need for digital infrastructure protection.',
        year: '2005 - Expansion',
        isLarge: false
      },
      {
        title: 'Modern Era',
        description: 'Today, we lead in quantum computing research and distributed systems, maintaining a commitment to open-source contribution and ethical technology development.',
        year: 'Present',
        isLarge: true
      }
    ]
  };

  const contactContent = {
    hero: {
      title: 'Get in Touch',
      description: 'Whether you have a question about admissions, research opportunities, or industry partnerships, our team is ready to assist you.'
    },
    contact_info: {
      title: 'Contact Information',
      description: 'Our administrative offices are open Monday through Friday, 9:00 AM to 5:00 PM.',
      address: 'Computer Science Department\\n123 Innovation Drive\\nTech University\\nCityville, State 12345',
      phone: '+1 (555) 123-4567',
      email: 'admissions@cs.techu.edu',
      hours: 'Mon-Fri: 9am - 5pm'
    },
    socials: {
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com',
      github: 'https://github.com'
    }
  };

  const pages = [
    { slug: 'home', content: homeContent },
    { slug: 'about', content: aboutContent },
    { slug: 'contact', content: contactContent }
  ];

  const { error } = await supabase.from('pages').upsert(pages);
  if (error) console.error('Error inserting pages:', error);
  else console.log('Pages inserted successfully');
}
main();
