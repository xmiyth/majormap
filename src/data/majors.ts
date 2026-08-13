import { Major } from '../types';

export const majors: Major[] = [
  {
    id: 'cs',
    title: 'Computer Science',
    subtitle: 'Study of computing, programming, and software systems.',
    category: 'Technology',
    difficulty: 'High',
    salary: '$95k',
    description:
      'Computer Science is about solving real-world problems with software, systems, and algorithms. Students learn to think like builders, designers, and analytical problem solvers.',
    courses: ['Programming fundamentals', 'Data structures', 'Algorithms', 'Computer systems', 'AI and machine learning'],
    skills: ['Problem solving', 'Logical reasoning', 'Coding', 'Systems thinking', 'Collaboration'],
    careers: ['Software Engineer', 'Data Scientist', 'AI Engineer'],
    highSchoolSubjects: ['Math', 'Computer Science', 'Physics'],
    apCourses: ['AP CSA', 'AP Calculus', 'AP Statistics'],
    related: ['engineering', 'business', 'animation'],
    color: '#2E6DE6',
  },
  {
    id: 'economics',
    title: 'Economics',
    subtitle: 'Study of markets, incentives, and decision-making.',
    category: 'Business',
    difficulty: 'High',
    salary: '$78k',
    description:
      'Economics explores how people and organizations make choices, how markets work, and how policy shapes business and society.',
    courses: ['Microeconomics', 'Macroeconomics', 'Statistics', 'Public policy', 'Finance'],
    skills: ['Critical thinking', 'Quantitative analysis', 'Research', 'Communication'],
    careers: ['Economist', 'Consultant', 'Investment Analyst'],
    highSchoolSubjects: ['Math', 'History', 'English'],
    apCourses: ['AP Microeconomics', 'AP Statistics', 'AP English'],
    related: ['business', 'political-science', 'psychology'],
    color: '#E69A12',
  },
  {
    id: 'psychology',
    title: 'Psychology',
    subtitle: 'Study of human behavior and mental processes.',
    category: 'Health',
    difficulty: 'Low',
    salary: '$62k',
    description:
      'Psychology examines how people think, feel, and act, with a focus on human development, cognition, and mental health.',
    courses: ['Developmental psychology', 'Cognitive science', 'Social psychology', 'Research methods'],
    skills: ['Empathy', 'Observation', 'Research', 'Communication', 'Problem solving'],
    careers: ['Psychologist', 'Counselor', 'HR Specialist'],
    highSchoolSubjects: ['Biology', 'English', 'Math'],
    apCourses: ['AP Psychology', 'AP Biology', 'AP Statistics'],
    related: ['education', 'business', 'health'],
    color: '#8F4BFF',
  },
  {
    id: 'business',
    title: 'Business',
    subtitle: 'Study of management, entrepreneurship, and organizations.',
    category: 'Business',
    difficulty: 'Medium',
    salary: '$72k',
    description:
      'Business majors explore leadership, strategy, finance, and the skills required to launch companies, manage teams, and lead growth.',
    courses: ['Management', 'Marketing', 'Finance', 'Entrepreneurship', 'Business analytics'],
    skills: ['Leadership', 'Communication', 'Strategy', 'Organization'],
    careers: ['Entrepreneur', 'Manager', 'Consultant'],
    highSchoolSubjects: ['Economics', 'Math', 'English'],
    apCourses: ['AP Microeconomics', 'AP Statistics', 'AP English'],
    related: ['economics', 'political-science', 'psychology'],
    color: '#E08A1F',
  },
  {
    id: 'engineering',
    title: 'Engineering',
    subtitle: 'Study of designing and building physical systems.',
    category: 'Technology',
    difficulty: 'High',
    salary: '$88k',
    description:
      'Engineering teaches how to create structures, machines, and systems that solve practical problems at scale.',
    courses: ['Calculus', 'Physics', 'Materials', 'Design', 'Systems engineering'],
    skills: ['Math', 'Problem solving', 'Design', 'Teamwork'],
    careers: ['Mechanical Engineer', 'Civil Engineer', 'Systems Engineer'],
    highSchoolSubjects: ['Math', 'Physics', 'Chemistry'],
    apCourses: ['AP Calculus', 'AP Physics', 'AP Chemistry'],
    related: ['computer-science', 'architecture', 'business'],
    color: '#1A9D8F',
  },
  {
    id: 'architecture',
    title: 'Architecture',
    subtitle: 'Study of spaces, buildings, and design.',
    category: 'Arts',
    difficulty: 'Medium',
    salary: '$71k',
    description:
      'Architecture blends creativity with engineering, teaching how to shape buildings and environments that people love to use.',
    courses: ['Design studio', 'History of architecture', 'Structures', 'Digital modeling'],
    skills: ['Creativity', 'Spatial thinking', 'Drawing', 'Presentation'],
    careers: ['Architect', 'Urban Designer', 'Interior Designer'],
    highSchoolSubjects: ['Art', 'Math', 'History'],
    apCourses: ['AP Studio Art', 'AP Calculus', 'AP Art History'],
    related: ['engineering', 'business', 'animation'],
    color: '#D95A4A',
  },
  {
    id: 'biology',
    title: 'Biology',
    subtitle: 'Study of living systems, health, and the natural world.',
    category: 'Science',
    difficulty: 'Medium',
    salary: '$68k',
    description:
      'Biology explores living organisms, ecosystems, genetics, and the skills needed to work in medicine, research, and conservation.',
    courses: ['Cell biology', 'Genetics', 'Ecology', 'Human anatomy'],
    skills: ['Observation', 'Analysis', 'Research', 'Collaboration'],
    careers: ['Biologist', 'Lab Researcher', 'Healthcare Specialist'],
    highSchoolSubjects: ['Biology', 'Chemistry', 'Math'],
    apCourses: ['AP Biology', 'AP Chemistry', 'AP Environmental Science'],
    related: ['psychology', 'health', 'engineering'],
    color: '#3AA76D',
  },
  {
    id: 'animation',
    title: 'Animation',
    subtitle: 'Study of storytelling through motion and design.',
    category: 'Arts',
    difficulty: 'Medium',
    salary: '$64k',
    description:
      'Animation combines art, storytelling, and technology to bring characters, films, games, and experiences to life.',
    courses: ['Character design', 'Storyboarding', 'Motion graphics', 'Visual effects'],
    skills: ['Creativity', 'Storytelling', 'Design', 'Animation software'],
    careers: ['Animator', 'Motion Designer', 'Visual Effects Artist'],
    highSchoolSubjects: ['Art', 'Computer Science', 'English'],
    apCourses: ['AP Studio Art', 'AP Computer Science', 'AP English'],
    related: ['business', 'computer-science', 'architecture'],
    color: '#D63F7D',
  },
  {
    id: 'nursing', title: 'Nursing', subtitle: 'Prepare to provide compassionate, evidence-based patient care.', category: 'Health', difficulty: 'High', salary: '$81k',
    description: 'Nursing blends science, communication, and clinical judgment to care for people across every stage of life.', courses: ['Anatomy', 'Pharmacology', 'Patient care', 'Public health'], skills: ['Empathy', 'Attention to detail', 'Communication', 'Resilience'], careers: ['Registered Nurse', 'Nurse Practitioner', 'Public Health Nurse'], highSchoolSubjects: ['Biology', 'Chemistry', 'Psychology'], apCourses: ['AP Biology', 'AP Chemistry', 'AP Psychology'], related: ['biology', 'psychology'], color: '#D94D67',
  },
  {
    id: 'environmental-science', title: 'Environmental Science', subtitle: 'Study ecosystems, climate, and solutions for a changing planet.', category: 'Science', difficulty: 'Medium', salary: '$71k',
    description: 'Environmental science combines biology, chemistry, and policy to understand and protect the natural world.', courses: ['Ecology', 'Climate science', 'Environmental policy', 'GIS'], skills: ['Research', 'Data analysis', 'Fieldwork', 'Systems thinking'], careers: ['Environmental Scientist', 'Conservation Specialist', 'Sustainability Analyst'], highSchoolSubjects: ['Biology', 'Chemistry', 'Geography'], apCourses: ['AP Environmental Science', 'AP Biology', 'AP Statistics'], related: ['biology', 'engineering'], color: '#3C9B71',
  },
  {
    id: 'data-science', title: 'Data Science', subtitle: 'Turn data into insights, predictions, and better decisions.', category: 'Technology', difficulty: 'High', salary: '$108k',
    description: 'Data science combines programming, statistics, and storytelling to uncover useful patterns in complex information.', courses: ['Statistics', 'Python', 'Machine learning', 'Data visualization'], skills: ['Math', 'Coding', 'Curiosity', 'Communication'], careers: ['Data Analyst', 'Data Scientist', 'Machine Learning Engineer'], highSchoolSubjects: ['Math', 'Computer Science', 'Science'], apCourses: ['AP Statistics', 'AP Calculus', 'AP Computer Science'], related: ['cs', 'economics'], color: '#386FEA',
  },
  {
    id: 'marketing', title: 'Marketing', subtitle: 'Connect people with ideas, brands, products, and stories.', category: 'Business', difficulty: 'Medium', salary: '$69k',
    description: 'Marketing explores consumer behavior, communication, and strategy to help organizations reach the right audience.', courses: ['Consumer behavior', 'Brand strategy', 'Digital marketing', 'Market research'], skills: ['Creativity', 'Writing', 'Strategy', 'Research'], careers: ['Marketing Manager', 'Brand Strategist', 'Social Media Manager'], highSchoolSubjects: ['English', 'Business', 'Art'], apCourses: ['AP English', 'AP Psychology', 'AP Statistics'], related: ['business', 'psychology'], color: '#E48228',
  },
  {
    id: 'graphic-design', title: 'Graphic Design', subtitle: 'Communicate visually through type, color, images, and layout.', category: 'Arts', difficulty: 'Medium', salary: '$58k',
    description: 'Graphic design develops visual problem-solving skills for brands, products, publications, and digital experiences.', courses: ['Typography', 'Visual identity', 'Layout', 'Digital design'], skills: ['Creativity', 'Design software', 'Feedback', 'Storytelling'], careers: ['Graphic Designer', 'Art Director', 'Brand Designer'], highSchoolSubjects: ['Art', 'English', 'Computer Science'], apCourses: ['AP Art and Design', 'AP English'], related: ['animation', 'marketing'], color: '#B64F9C',
  },
  {
    id: 'mechanical-engineering', title: 'Mechanical Engineering', subtitle: 'Design machines, products, and systems that move the world.', category: 'Technology', difficulty: 'High', salary: '$96k',
    description: 'Mechanical engineering applies physics, math, and design to create everything from medical devices to clean-energy systems.', courses: ['Mechanics', 'Thermodynamics', 'CAD', 'Materials science'], skills: ['Math', 'Design', 'Problem solving', 'Teamwork'], careers: ['Mechanical Engineer', 'Product Engineer', 'Robotics Engineer'], highSchoolSubjects: ['Physics', 'Math', 'Chemistry'], apCourses: ['AP Physics', 'AP Calculus', 'AP Chemistry'], related: ['engineering', 'cs'], color: '#258C94',
  },
  {
    id: 'political-science', title: 'Political Science', subtitle: 'Understand government, public policy, and civic life.', category: 'Science', difficulty: 'Medium', salary: '$65k',
    description: 'Political science studies institutions, power, law, and the choices that shape communities and countries.', courses: ['Comparative politics', 'Public policy', 'International relations', 'Research methods'], skills: ['Writing', 'Research', 'Debate', 'Critical thinking'], careers: ['Policy Analyst', 'Campaign Manager', 'Legislative Assistant'], highSchoolSubjects: ['History', 'English', 'Government'], apCourses: ['AP Government', 'AP History', 'AP English'], related: ['economics', 'business'], color: '#5772A8',
  },
  {
    id: 'education', title: 'Education', subtitle: 'Help learners grow through teaching, mentoring, and leadership.', category: 'Humanities', difficulty: 'Medium', salary: '$61k',
    description: 'Education focuses on how people learn and how supportive classrooms and communities can help them thrive.', courses: ['Learning theory', 'Child development', 'Curriculum design', 'Classroom practice'], skills: ['Communication', 'Patience', 'Leadership', 'Empathy'], careers: ['Teacher', 'School Counselor', 'Education Coordinator'], highSchoolSubjects: ['English', 'Psychology', 'History'], apCourses: ['AP Psychology', 'AP English'], related: ['psychology', 'political-science'], color: '#8A64C5',
  },
  {
    id: 'finance', title: 'Finance', subtitle: 'Learn how money, investments, and organizations grow.', category: 'Business', difficulty: 'High', salary: '$79k',
    description: 'Finance uses numbers and strategy to guide investments, manage risk, and plan for the future.', courses: ['Accounting', 'Investments', 'Corporate finance', 'Financial modeling'], skills: ['Quantitative analysis', 'Decision making', 'Research', 'Organization'], careers: ['Financial Analyst', 'Investment Banker', 'Financial Planner'], highSchoolSubjects: ['Math', 'Economics', 'English'], apCourses: ['AP Calculus', 'AP Statistics', 'AP Microeconomics'], related: ['economics', 'business'], color: '#2670B7',
  },
  {
    id: 'chemistry', title: 'Chemistry', subtitle: 'Explore matter, molecules, reactions, and new materials.', category: 'Science', difficulty: 'High', salary: '$72k',
    description: 'Chemistry explains how substances behave and provides foundations for medicine, energy, food, and materials.', courses: ['Organic chemistry', 'Analytical chemistry', 'Physical chemistry', 'Lab methods'], skills: ['Lab work', 'Analysis', 'Precision', 'Problem solving'], careers: ['Chemist', 'Forensic Scientist', 'Materials Scientist'], highSchoolSubjects: ['Chemistry', 'Math', 'Physics'], apCourses: ['AP Chemistry', 'AP Calculus', 'AP Physics'], related: ['biology', 'engineering'], color: '#7864D8',
  },
  {
    id: 'journalism', title: 'Journalism', subtitle: 'Research and tell meaningful stories for the public.', category: 'Arts', difficulty: 'Medium', salary: '$56k',
    description: 'Journalism builds reporting, interviewing, and media skills for informing communities with clarity and care.', courses: ['News writing', 'Media ethics', 'Investigative reporting', 'Digital storytelling'], skills: ['Writing', 'Curiosity', 'Interviewing', 'Editing'], careers: ['Reporter', 'Editor', 'Content Producer'], highSchoolSubjects: ['English', 'History', 'Government'], apCourses: ['AP English', 'AP History'], related: ['marketing', 'political-science'], color: '#C45D5D',
  },
  {
    id: 'cybersecurity', title: 'Cybersecurity', subtitle: 'Protect systems, networks, and people in a digital world.', category: 'Technology', difficulty: 'High', salary: '$102k',
    description: 'Cybersecurity applies computing and investigative thinking to defend information from digital threats.', courses: ['Network security', 'Ethical hacking', 'Cryptography', 'Digital forensics'], skills: ['Coding', 'Attention to detail', 'Analysis', 'Ethics'], careers: ['Security Analyst', 'Penetration Tester', 'Security Engineer'], highSchoolSubjects: ['Computer Science', 'Math', 'Physics'], apCourses: ['AP Computer Science', 'AP Calculus'], related: ['cs', 'data-science'], color: '#304CB0',
  },
  {
    id: 'public-health', title: 'Public Health', subtitle: 'Improve wellbeing through prevention, research, and community action.', category: 'Health', difficulty: 'Medium', salary: '$70k',
    description: 'Public health looks beyond individual care to improve health outcomes for whole communities and populations.', courses: ['Epidemiology', 'Health policy', 'Biostatistics', 'Community health'], skills: ['Research', 'Communication', 'Empathy', 'Data analysis'], careers: ['Health Educator', 'Epidemiologist', 'Program Coordinator'], highSchoolSubjects: ['Biology', 'Math', 'Psychology'], apCourses: ['AP Biology', 'AP Statistics', 'AP Psychology'], related: ['nursing', 'biology'], color: '#D55278',
  },
  {
    id: 'ux-design', title: 'UX Design', subtitle: 'Create useful, intuitive digital products for real people.', category: 'Arts', difficulty: 'Medium', salary: '$85k',
    description: 'UX design brings together research, visual design, and technology to make digital experiences easier to use.', courses: ['User research', 'Interaction design', 'Prototyping', 'Information architecture'], skills: ['Empathy', 'Creativity', 'Research', 'Communication'], careers: ['UX Designer', 'Product Designer', 'UX Researcher'], highSchoolSubjects: ['Art', 'Computer Science', 'Psychology'], apCourses: ['AP Art and Design', 'AP Psychology', 'AP Computer Science'], related: ['graphic-design', 'cs'], color: '#C3439A',
  },
  {
    id: 'software-engineering', title: 'Software Engineering', subtitle: 'Build reliable apps, platforms, and large-scale software.', category: 'Technology', difficulty: 'High', salary: '$105k',
    description: 'Software engineering focuses on designing, testing, and maintaining dependable software products with collaborative development practices.', courses: ['Software design', 'Web development', 'Databases', 'Software testing'], skills: ['Programming', 'System design', 'Teamwork', 'Debugging'], careers: ['Software Engineer', 'Mobile Developer', 'Platform Engineer'], highSchoolSubjects: ['Computer Science', 'Math', 'Physics'], apCourses: ['AP Computer Science A', 'AP Calculus', 'AP Statistics'], related: ['cs', 'cybersecurity', 'data-science'], color: '#3568D4',
  },
  {
    id: 'artificial-intelligence', title: 'Artificial Intelligence', subtitle: 'Create systems that learn, reason, and solve complex problems.', category: 'Technology', difficulty: 'High', salary: '$118k',
    description: 'Artificial intelligence combines computing, mathematics, and data to build intelligent tools such as language, vision, and robotics systems.', courses: ['Machine learning', 'Neural networks', 'Computer vision', 'AI ethics'], skills: ['Python', 'Statistics', 'Modeling', 'Critical thinking'], careers: ['AI Engineer', 'Machine Learning Engineer', 'AI Researcher'], highSchoolSubjects: ['Math', 'Computer Science', 'Physics'], apCourses: ['AP Calculus', 'AP Statistics', 'AP Computer Science A'], related: ['cs', 'data-science', 'robotics'], color: '#5A58D6',
  },
  {
    id: 'information-systems', title: 'Information Systems', subtitle: 'Connect business needs with technology and data.', category: 'Technology', difficulty: 'Medium', salary: '$88k',
    description: 'Information systems majors learn to select, design, and manage technology that helps organizations work more effectively.', courses: ['Databases', 'Business analytics', 'Systems analysis', 'IT management'], skills: ['Analysis', 'Communication', 'Technology planning', 'Project management'], careers: ['Systems Analyst', 'IT Consultant', 'Product Manager'], highSchoolSubjects: ['Computer Science', 'Business', 'Math'], apCourses: ['AP Computer Science', 'AP Statistics', 'AP Microeconomics'], related: ['business', 'cs', 'data-science'], color: '#3977A8',
  },
  {
    id: 'game-design', title: 'Game Design', subtitle: 'Design interactive worlds, systems, and player experiences.', category: 'Technology', difficulty: 'Medium', salary: '$74k',
    description: 'Game design blends storytelling, visual creativity, programming, and psychology to create meaningful interactive experiences.', courses: ['Game mechanics', 'Level design', 'Game programming', 'Interactive storytelling'], skills: ['Creativity', 'Prototyping', 'Coding', 'Collaboration'], careers: ['Game Designer', 'Level Designer', 'Gameplay Programmer'], highSchoolSubjects: ['Computer Science', 'Art', 'English'], apCourses: ['AP Computer Science', 'AP Art and Design', 'AP English'], related: ['animation', 'cs', 'ux-design'], color: '#7A4BC2',
  },
  {
    id: 'electrical-engineering', title: 'Electrical Engineering', subtitle: 'Design electronics, circuits, power, and communication systems.', category: 'Technology', difficulty: 'High', salary: '$101k',
    description: 'Electrical engineering applies physics and mathematics to technologies ranging from microchips and medical devices to renewable energy.', courses: ['Circuit analysis', 'Electronics', 'Signals and systems', 'Digital logic'], skills: ['Math', 'Circuit design', 'Problem solving', 'Experimentation'], careers: ['Electrical Engineer', 'Hardware Engineer', 'Power Systems Engineer'], highSchoolSubjects: ['Physics', 'Math', 'Computer Science'], apCourses: ['AP Physics C', 'AP Calculus', 'AP Computer Science'], related: ['engineering', 'robotics', 'cs'], color: '#D99022',
  },
  {
    id: 'civil-engineering', title: 'Civil Engineering', subtitle: 'Plan and build infrastructure for thriving communities.', category: 'Technology', difficulty: 'High', salary: '$89k',
    description: 'Civil engineering focuses on safe, sustainable structures and infrastructure such as bridges, roads, transit, and water systems.', courses: ['Statics', 'Structural analysis', 'Geotechnical engineering', 'Transportation'], skills: ['Design', 'Math', 'Project planning', 'Teamwork'], careers: ['Civil Engineer', 'Structural Engineer', 'Transportation Planner'], highSchoolSubjects: ['Math', 'Physics', 'Environmental Science'], apCourses: ['AP Calculus', 'AP Physics', 'AP Environmental Science'], related: ['engineering', 'architecture', 'environmental-science'], color: '#A56843',
  },
  {
    id: 'biomedical-engineering', title: 'Biomedical Engineering', subtitle: 'Create technology that improves healthcare and human life.', category: 'Health', difficulty: 'High', salary: '$97k',
    description: 'Biomedical engineering combines biology, medicine, and engineering to develop devices, implants, diagnostics, and treatments.', courses: ['Biomechanics', 'Human physiology', 'Medical imaging', 'Biomaterials'], skills: ['Design', 'Research', 'Biology', 'Problem solving'], careers: ['Biomedical Engineer', 'Medical Device Designer', 'Clinical Engineer'], highSchoolSubjects: ['Biology', 'Physics', 'Math'], apCourses: ['AP Biology', 'AP Physics', 'AP Calculus'], related: ['engineering', 'biology', 'nursing'], color: '#CF5575',
  },
  {
    id: 'robotics', title: 'Robotics', subtitle: 'Build intelligent machines that sense, decide, and move.', category: 'Technology', difficulty: 'High', salary: '$103k',
    description: 'Robotics integrates mechanical design, electronics, programming, and artificial intelligence to create autonomous systems.', courses: ['Mechatronics', 'Control systems', 'Robot programming', 'Computer vision'], skills: ['Coding', 'Electronics', 'Mechanical design', 'Testing'], careers: ['Robotics Engineer', 'Automation Engineer', 'Controls Engineer'], highSchoolSubjects: ['Physics', 'Computer Science', 'Math'], apCourses: ['AP Physics', 'AP Computer Science A', 'AP Calculus'], related: ['artificial-intelligence', 'mechanical-engineering', 'electrical-engineering'], color: '#287D89',
  },
  {
    id: 'mathematics', title: 'Mathematics', subtitle: 'Explore patterns, logic, abstraction, and quantitative reasoning.', category: 'Science', difficulty: 'High', salary: '$82k',
    description: 'Mathematics develops powerful ways to model problems, prove ideas, analyze uncertainty, and support nearly every technical field.', courses: ['Calculus', 'Linear algebra', 'Discrete mathematics', 'Real analysis'], skills: ['Logical reasoning', 'Proof writing', 'Modeling', 'Precision'], careers: ['Mathematician', 'Actuary', 'Operations Analyst'], highSchoolSubjects: ['Math', 'Computer Science', 'Physics'], apCourses: ['AP Calculus BC', 'AP Statistics', 'AP Computer Science'], related: ['data-science', 'physics', 'economics'], color: '#416CC1',
  },
  {
    id: 'physics', title: 'Physics', subtitle: 'Understand the fundamental rules governing matter and energy.', category: 'Science', difficulty: 'High', salary: '$86k',
    description: 'Physics uses experiments and mathematics to explain motion, forces, light, energy, and the structure of the universe.', courses: ['Classical mechanics', 'Electromagnetism', 'Quantum physics', 'Thermodynamics'], skills: ['Mathematical modeling', 'Experimentation', 'Analysis', 'Problem solving'], careers: ['Physicist', 'Research Scientist', 'Optical Engineer'], highSchoolSubjects: ['Physics', 'Math', 'Computer Science'], apCourses: ['AP Physics C', 'AP Calculus BC', 'AP Computer Science'], related: ['mathematics', 'astronomy', 'engineering'], color: '#5A61B8',
  },
  {
    id: 'astronomy', title: 'Astronomy', subtitle: 'Study planets, stars, galaxies, and the universe.', category: 'Science', difficulty: 'High', salary: '$79k',
    description: 'Astronomy combines physics, mathematics, observation, and computing to investigate the origin and behavior of the cosmos.', courses: ['Astrophysics', 'Observational astronomy', 'Planetary science', 'Cosmology'], skills: ['Data analysis', 'Math', 'Programming', 'Research'], careers: ['Astronomer', 'Planetary Scientist', 'Observatory Analyst'], highSchoolSubjects: ['Physics', 'Math', 'Computer Science'], apCourses: ['AP Physics', 'AP Calculus', 'AP Computer Science'], related: ['physics', 'mathematics', 'data-science'], color: '#343A91',
  },
  {
    id: 'neuroscience', title: 'Neuroscience', subtitle: 'Investigate the brain, nervous system, and human behavior.', category: 'Health', difficulty: 'High', salary: '$78k',
    description: 'Neuroscience brings together biology, psychology, chemistry, and computation to understand how the brain works.', courses: ['Neurobiology', 'Cognitive neuroscience', 'Research methods', 'Behavioral science'], skills: ['Research', 'Data analysis', 'Lab work', 'Critical thinking'], careers: ['Neuroscientist', 'Clinical Researcher', 'Neurotechnology Specialist'], highSchoolSubjects: ['Biology', 'Chemistry', 'Psychology'], apCourses: ['AP Biology', 'AP Chemistry', 'AP Psychology'], related: ['psychology', 'biology', 'biomedical-engineering'], color: '#8A4CB5',
  },
  {
    id: 'biochemistry', title: 'Biochemistry', subtitle: 'Explore the chemistry that powers living organisms.', category: 'Science', difficulty: 'High', salary: '$76k',
    description: 'Biochemistry examines molecules, cells, proteins, and metabolism to support discoveries in health, biotechnology, and agriculture.', courses: ['Organic chemistry', 'Molecular biology', 'Genetics', 'Protein chemistry'], skills: ['Lab technique', 'Analysis', 'Precision', 'Research'], careers: ['Biochemist', 'Biotechnology Researcher', 'Quality Scientist'], highSchoolSubjects: ['Chemistry', 'Biology', 'Math'], apCourses: ['AP Chemistry', 'AP Biology', 'AP Calculus'], related: ['chemistry', 'biology', 'pharmacy'], color: '#3A9B83',
  },
  {
    id: 'pre-medicine', title: 'Pre-Medicine', subtitle: 'Build a scientific foundation for medical school and patient care.', category: 'Health', difficulty: 'High', salary: '$95k+',
    description: 'Pre-medicine prepares students for medical training through rigorous science, research, ethics, and healthcare experiences.', courses: ['Biology', 'General chemistry', 'Organic chemistry', 'Human physiology'], skills: ['Scientific reasoning', 'Empathy', 'Discipline', 'Communication'], careers: ['Physician', 'Medical Researcher', 'Healthcare Consultant'], highSchoolSubjects: ['Biology', 'Chemistry', 'Physics'], apCourses: ['AP Biology', 'AP Chemistry', 'AP Physics'], related: ['biology', 'biochemistry', 'public-health'], color: '#CB405A',
  },
  {
    id: 'pharmacy', title: 'Pharmacy', subtitle: 'Study medicines and help patients use them safely.', category: 'Health', difficulty: 'High', salary: '$126k',
    description: 'Pharmacy combines chemistry, biology, and patient care to understand medications, interactions, and effective treatment.', courses: ['Pharmacology', 'Medicinal chemistry', 'Pharmacy practice', 'Human physiology'], skills: ['Precision', 'Communication', 'Chemistry', 'Patient care'], careers: ['Pharmacist', 'Clinical Pharmacist', 'Pharmaceutical Scientist'], highSchoolSubjects: ['Chemistry', 'Biology', 'Math'], apCourses: ['AP Chemistry', 'AP Biology', 'AP Calculus'], related: ['chemistry', 'biochemistry', 'public-health'], color: '#3C9A76',
  },
  {
    id: 'nutrition', title: 'Nutrition', subtitle: 'Understand how food supports health, performance, and wellbeing.', category: 'Health', difficulty: 'Medium', salary: '$67k',
    description: 'Nutrition studies the relationship between food, metabolism, disease prevention, and healthy communities.', courses: ['Human nutrition', 'Biochemistry', 'Food science', 'Community health'], skills: ['Health coaching', 'Science', 'Communication', 'Planning'], careers: ['Registered Dietitian', 'Nutrition Educator', 'Food Science Specialist'], highSchoolSubjects: ['Biology', 'Chemistry', 'Health'], apCourses: ['AP Biology', 'AP Chemistry', 'AP Psychology'], related: ['public-health', 'biology', 'nursing'], color: '#66A348',
  },
  {
    id: 'accounting', title: 'Accounting', subtitle: 'Measure, explain, and guide financial decisions.', category: 'Business', difficulty: 'Medium', salary: '$77k',
    description: 'Accounting teaches how to organize financial information, evaluate performance, manage compliance, and support strategy.', courses: ['Financial accounting', 'Managerial accounting', 'Auditing', 'Taxation'], skills: ['Accuracy', 'Analysis', 'Ethics', 'Organization'], careers: ['Accountant', 'Auditor', 'Controller'], highSchoolSubjects: ['Math', 'Business', 'Economics'], apCourses: ['AP Statistics', 'AP Microeconomics', 'AP Calculus'], related: ['finance', 'business', 'economics'], color: '#3377A6',
  },
  {
    id: 'entrepreneurship', title: 'Entrepreneurship', subtitle: 'Turn ideas into products, organizations, and impact.', category: 'Business', difficulty: 'Medium', salary: 'Varies',
    description: 'Entrepreneurship develops the creativity, strategy, finance, and leadership needed to launch and grow new ventures.', courses: ['Venture creation', 'Marketing', 'Startup finance', 'Product strategy'], skills: ['Leadership', 'Creativity', 'Selling', 'Risk management'], careers: ['Founder', 'Product Manager', 'Innovation Consultant'], highSchoolSubjects: ['Business', 'Economics', 'English'], apCourses: ['AP Microeconomics', 'AP Statistics', 'AP English'], related: ['business', 'marketing', 'finance'], color: '#E47D25',
  },
  {
    id: 'supply-chain', title: 'Supply Chain Management', subtitle: 'Move products and resources efficiently around the world.', category: 'Business', difficulty: 'Medium', salary: '$80k',
    description: 'Supply chain management coordinates sourcing, production, logistics, technology, and risk across global networks.', courses: ['Operations management', 'Logistics', 'Procurement', 'Business analytics'], skills: ['Planning', 'Negotiation', 'Data analysis', 'Problem solving'], careers: ['Supply Chain Analyst', 'Logistics Manager', 'Operations Planner'], highSchoolSubjects: ['Business', 'Math', 'Geography'], apCourses: ['AP Statistics', 'AP Microeconomics', 'AP Human Geography'], related: ['business', 'information-systems', 'economics'], color: '#B07732',
  },
  {
    id: 'international-business', title: 'International Business', subtitle: 'Understand organizations, markets, and cultures across borders.', category: 'Business', difficulty: 'Medium', salary: '$76k',
    description: 'International business combines management, economics, language, and cultural awareness for work in a connected global economy.', courses: ['Global strategy', 'International finance', 'Cross-cultural management', 'Trade'], skills: ['Communication', 'Cultural fluency', 'Strategy', 'Negotiation'], careers: ['Global Business Analyst', 'Trade Specialist', 'International Marketing Manager'], highSchoolSubjects: ['Economics', 'World Languages', 'Geography'], apCourses: ['AP Macroeconomics', 'AP Human Geography', 'AP World History'], related: ['business', 'economics', 'international-relations'], color: '#3D83A6',
  },
  {
    id: 'law', title: 'Legal Studies', subtitle: 'Explore law, justice, rights, and legal institutions.', category: 'Humanities', difficulty: 'High', salary: '$83k',
    description: 'Legal studies develops close reading, research, writing, and reasoning skills for understanding legal systems and public policy.', courses: ['Constitutional law', 'Legal research', 'Ethics', 'Civil rights'], skills: ['Argumentation', 'Writing', 'Research', 'Critical reading'], careers: ['Attorney', 'Paralegal', 'Compliance Analyst'], highSchoolSubjects: ['Government', 'History', 'English'], apCourses: ['AP Government', 'AP U.S. History', 'AP English'], related: ['political-science', 'criminal-justice', 'philosophy'], color: '#715448',
  },
  {
    id: 'criminal-justice', title: 'Criminal Justice', subtitle: 'Study law, public safety, courts, and corrections.', category: 'Humanities', difficulty: 'Medium', salary: '$63k',
    description: 'Criminal justice examines how societies prevent crime, administer justice, protect rights, and improve public safety.', courses: ['Criminology', 'Criminal law', 'Policing', 'Justice policy'], skills: ['Ethical reasoning', 'Research', 'Communication', 'Decision making'], careers: ['Crime Analyst', 'Federal Agent', 'Victim Advocate'], highSchoolSubjects: ['Government', 'Psychology', 'History'], apCourses: ['AP Government', 'AP Psychology', 'AP Statistics'], related: ['law', 'psychology', 'political-science'], color: '#59677C',
  },
  {
    id: 'sociology', title: 'Sociology', subtitle: 'Study communities, institutions, culture, and social change.', category: 'Humanities', difficulty: 'Medium', salary: '$64k',
    description: 'Sociology investigates how groups, identities, institutions, and inequality shape individual lives and society.', courses: ['Social theory', 'Research methods', 'Culture and identity', 'Social inequality'], skills: ['Research', 'Writing', 'Data interpretation', 'Empathy'], careers: ['Social Researcher', 'Community Program Manager', 'Policy Analyst'], highSchoolSubjects: ['History', 'English', 'Psychology'], apCourses: ['AP Psychology', 'AP Statistics', 'AP Government'], related: ['psychology', 'anthropology', 'social-work'], color: '#8B627E',
  },
  {
    id: 'anthropology', title: 'Anthropology', subtitle: 'Explore human cultures, societies, biology, and history.', category: 'Humanities', difficulty: 'Medium', salary: '$63k',
    description: 'Anthropology studies the diversity of human experience through culture, archaeology, language, and biological evolution.', courses: ['Cultural anthropology', 'Archaeology', 'Human evolution', 'Ethnography'], skills: ['Observation', 'Research', 'Cultural awareness', 'Writing'], careers: ['Anthropologist', 'Museum Curator', 'User Researcher'], highSchoolSubjects: ['History', 'Biology', 'Geography'], apCourses: ['AP World History', 'AP Biology', 'AP Human Geography'], related: ['sociology', 'history', 'psychology'], color: '#A2674C',
  },
  {
    id: 'history', title: 'History', subtitle: 'Investigate the people, ideas, and events that shaped our world.', category: 'Humanities', difficulty: 'Medium', salary: '$61k',
    description: 'History develops the ability to evaluate evidence, understand change over time, and communicate complex stories clearly.', courses: ['World history', 'Historical research', 'Political history', 'Public history'], skills: ['Research', 'Critical reading', 'Writing', 'Source evaluation'], careers: ['Historian', 'Archivist', 'Museum Educator'], highSchoolSubjects: ['History', 'English', 'Government'], apCourses: ['AP World History', 'AP U.S. History', 'AP English'], related: ['political-science', 'anthropology', 'law'], color: '#9A693C',
  },
  {
    id: 'english', title: 'English Literature', subtitle: 'Study stories, language, culture, and powerful communication.', category: 'Humanities', difficulty: 'Medium', salary: '$60k',
    description: 'English literature builds close-reading, writing, interpretation, and storytelling skills through works from many periods and cultures.', courses: ['Literary analysis', 'Creative writing', 'World literature', 'Rhetoric'], skills: ['Writing', 'Editing', 'Interpretation', 'Communication'], careers: ['Editor', 'Writer', 'Content Strategist'], highSchoolSubjects: ['English', 'History', 'World Languages'], apCourses: ['AP English Literature', 'AP English Language', 'AP World History'], related: ['journalism', 'history', 'communications'], color: '#A14E67',
  },
  {
    id: 'philosophy', title: 'Philosophy', subtitle: 'Examine knowledge, ethics, logic, and life’s biggest questions.', category: 'Humanities', difficulty: 'High', salary: '$66k',
    description: 'Philosophy trains students to analyze arguments, challenge assumptions, reason ethically, and express ideas with precision.', courses: ['Logic', 'Ethics', 'Philosophy of mind', 'Political philosophy'], skills: ['Reasoning', 'Argumentation', 'Writing', 'Ethical analysis'], careers: ['Policy Analyst', 'Ethics Specialist', 'Legal Professional'], highSchoolSubjects: ['English', 'History', 'Math'], apCourses: ['AP English', 'AP Government', 'AP Calculus'], related: ['law', 'political-science', 'psychology'], color: '#67528F',
  },
  {
    id: 'international-relations', title: 'International Relations', subtitle: 'Understand diplomacy, conflict, cooperation, and global affairs.', category: 'Humanities', difficulty: 'Medium', salary: '$72k',
    description: 'International relations explores how countries, institutions, and communities respond to global political and economic challenges.', courses: ['Diplomacy', 'International law', 'Global security', 'Political economy'], skills: ['Research', 'Negotiation', 'Writing', 'Cultural awareness'], careers: ['Diplomat', 'Foreign Policy Analyst', 'NGO Program Officer'], highSchoolSubjects: ['History', 'Government', 'World Languages'], apCourses: ['AP World History', 'AP Government', 'AP Macroeconomics'], related: ['political-science', 'economics', 'international-business'], color: '#3C6694',
  },
  {
    id: 'communications', title: 'Communications', subtitle: 'Shape messages, media, relationships, and public understanding.', category: 'Arts', difficulty: 'Medium', salary: '$65k',
    description: 'Communications examines how people and organizations create meaning through media, speaking, writing, and digital platforms.', courses: ['Media studies', 'Public relations', 'Public speaking', 'Digital communication'], skills: ['Writing', 'Presentation', 'Strategy', 'Audience analysis'], careers: ['Communications Specialist', 'Public Relations Manager', 'Media Planner'], highSchoolSubjects: ['English', 'Speech', 'Media'], apCourses: ['AP English Language', 'AP Psychology', 'AP Seminar'], related: ['journalism', 'marketing', 'english'], color: '#C0546F',
  },
  {
    id: 'film', title: 'Film and Media Production', subtitle: 'Tell stories through directing, cinematography, sound, and editing.', category: 'Arts', difficulty: 'Medium', salary: '$63k',
    description: 'Film production combines visual storytelling, technical craft, teamwork, and media history to create compelling screen experiences.', courses: ['Directing', 'Cinematography', 'Screenwriting', 'Post-production'], skills: ['Storytelling', 'Collaboration', 'Editing', 'Visual composition'], careers: ['Filmmaker', 'Video Editor', 'Cinematographer'], highSchoolSubjects: ['Art', 'English', 'Technology'], apCourses: ['AP Art and Design', 'AP English', 'AP Computer Science'], related: ['animation', 'communications', 'graphic-design'], color: '#9B3F58',
  },
  {
    id: 'music', title: 'Music', subtitle: 'Develop artistry through performance, composition, and sound.', category: 'Arts', difficulty: 'Medium', salary: '$55k',
    description: 'Music majors deepen creative and technical skills in performance, theory, composition, production, and music history.', courses: ['Music theory', 'Ear training', 'Performance', 'Composition'], skills: ['Discipline', 'Creativity', 'Listening', 'Collaboration'], careers: ['Musician', 'Composer', 'Music Producer'], highSchoolSubjects: ['Music', 'Art', 'Math'], apCourses: ['AP Music Theory', 'AP Art History'], related: ['film', 'animation', 'education'], color: '#A8428F',
  },
  {
    id: 'interior-design', title: 'Interior Design', subtitle: 'Create functional, expressive spaces for living and working.', category: 'Arts', difficulty: 'Medium', salary: '$62k',
    description: 'Interior design combines spatial planning, materials, lighting, human behavior, and visual storytelling.', courses: ['Space planning', 'Materials and finishes', 'Lighting design', 'Digital modeling'], skills: ['Spatial thinking', 'Creativity', 'Client communication', 'CAD'], careers: ['Interior Designer', 'Exhibition Designer', 'Space Planner'], highSchoolSubjects: ['Art', 'Math', 'Technology'], apCourses: ['AP Art and Design', 'AP Calculus', 'AP Art History'], related: ['architecture', 'graphic-design', 'ux-design'], color: '#C46A52',
  },
  {
    id: 'social-work', title: 'Social Work', subtitle: 'Support individuals, families, and communities through change.', category: 'Health', difficulty: 'Medium', salary: '$58k',
    description: 'Social work blends psychology, advocacy, policy, and practical support to help people navigate challenges and access resources.', courses: ['Human behavior', 'Social welfare policy', 'Counseling skills', 'Community practice'], skills: ['Empathy', 'Advocacy', 'Communication', 'Problem solving'], careers: ['Social Worker', 'Case Manager', 'Community Advocate'], highSchoolSubjects: ['Psychology', 'English', 'Government'], apCourses: ['AP Psychology', 'AP Government', 'AP English'], related: ['psychology', 'sociology', 'public-health'], color: '#4A9A83',
  },
  {
    id: 'special-education', title: 'Special Education', subtitle: 'Help diverse learners access meaningful, supportive education.', category: 'Humanities', difficulty: 'Medium', salary: '$63k',
    description: 'Special education prepares educators to design inclusive instruction and collaborate with students, families, and support teams.', courses: ['Inclusive teaching', 'Learning differences', 'Behavior support', 'Assessment'], skills: ['Patience', 'Adaptability', 'Communication', 'Lesson planning'], careers: ['Special Education Teacher', 'Learning Support Specialist', 'Education Advocate'], highSchoolSubjects: ['Psychology', 'English', 'Biology'], apCourses: ['AP Psychology', 'AP English', 'AP Biology'], related: ['education', 'psychology', 'social-work'], color: '#7386C4',
  },
];

const specializationMap: Record<string, string[]> = {
  cs: ['Software Engineering', 'Artificial Intelligence', 'Cybersecurity', 'Data Science', 'Game Design'],
  engineering: ['Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Biomedical Engineering', 'Robotics', 'Aerospace Engineering'],
  business: ['Finance', 'Marketing', 'Accounting', 'Entrepreneurship', 'International Business', 'Supply Chain Management'],
  economics: ['Behavioral Economics', 'Financial Economics', 'International Economics', 'Public Policy', 'Econometrics'],
  psychology: ['Clinical Psychology', 'Cognitive Psychology', 'Developmental Psychology', 'Social Psychology', 'Neuroscience'],
  biology: ['Molecular Biology', 'Genetics', 'Ecology', 'Microbiology', 'Marine Biology', 'Biochemistry'],
  nursing: ['Pediatric Nursing', 'Emergency Nursing', 'Public Health Nursing', 'Mental Health Nursing', 'Nurse Practitioner'],
  architecture: ['Urban Design', 'Landscape Architecture', 'Interior Design', 'Sustainable Architecture', 'Historic Preservation'],
  animation: ['2D Animation', '3D Animation', 'Visual Effects', 'Character Animation', 'Motion Graphics'],
  'data-science': ['Machine Learning', 'Data Analytics', 'Data Engineering', 'Business Intelligence', 'Data Visualization'],
  marketing: ['Digital Marketing', 'Brand Strategy', 'Market Research', 'Advertising', 'Social Media Marketing'],
  'mechanical-engineering': ['Robotics', 'Automotive Engineering', 'Aerospace Systems', 'Energy Systems', 'Product Design'],
  'political-science': ['International Relations', 'Public Policy', 'Comparative Politics', 'Political Theory', 'Public Administration'],
  education: ['Special Education', 'Elementary Education', 'Secondary Education', 'Curriculum Design', 'Education Leadership'],
  finance: ['Investment Banking', 'Corporate Finance', 'Financial Planning', 'Risk Management', 'Fintech'],
  chemistry: ['Organic Chemistry', 'Analytical Chemistry', 'Materials Chemistry', 'Biochemistry', 'Medicinal Chemistry'],
  journalism: ['Investigative Journalism', 'Broadcast Journalism', 'Sports Journalism', 'Photojournalism', 'Digital Media'],
  cybersecurity: ['Network Security', 'Ethical Hacking', 'Digital Forensics', 'Cloud Security', 'Security Engineering'],
  'public-health': ['Epidemiology', 'Global Health', 'Health Policy', 'Community Health', 'Biostatistics'],
  'graphic-design': ['Brand Design', 'Typography', 'Editorial Design', 'Packaging Design', 'Motion Design'],
  'artificial-intelligence': ['Machine Learning', 'Natural Language Processing', 'Computer Vision', 'Robotics', 'AI Ethics'],
  'electrical-engineering': ['Computer Engineering', 'Power Systems', 'Telecommunications', 'Microelectronics', 'Control Systems'],
  mathematics: ['Applied Mathematics', 'Pure Mathematics', 'Statistics', 'Actuarial Science', 'Operations Research'],
  physics: ['Astrophysics', 'Quantum Physics', 'Nuclear Physics', 'Optics', 'Computational Physics'],
  'pre-medicine': ['Surgery', 'Pediatrics', 'Internal Medicine', 'Psychiatry', 'Emergency Medicine'],
  law: ['Corporate Law', 'Criminal Law', 'International Law', 'Human Rights Law', 'Environmental Law'],
  communications: ['Public Relations', 'Media Studies', 'Advertising', 'Corporate Communication', 'Digital Media'],
  film: ['Directing', 'Screenwriting', 'Cinematography', 'Editing', 'Sound Design'],
  music: ['Performance', 'Composition', 'Music Production', 'Music Education', 'Music Business'],
};

majors.forEach((major) => { major.specializations = specializationMap[major.id]; });
