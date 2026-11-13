// Course guidance checked against the linked College Board pages on 2026-11-02.
// Ratings are editorial MajorMap estimates, not College Board scores or pass-rate rankings.
export type Demand = 'C' | 'B' | 'A' | 'A+';
export type APCourse = { id: string; title: string; summary: string; preparation: string; topics: string[]; ratings: { difficulty: Demand; workload: Demand; math: Demand }; reason: string; source: string };
export const demandLevels: Record<Demand, { label: string; color: string; dark: string; tint: string }> = {
  C: { label: 'Light', color: '#24715B', dark: '#8CDBBE', tint: '#E1F3EA' },
  B: { label: 'Moderate', color: '#4056C6', dark: '#B4BFFF', tint: '#E9EDFF' },
  A: { label: 'Demanding', color: '#925D10', dark: '#F3CB83', tint: '#FFF0D8' },
  'A+': { label: 'Very demanding', color: '#AD3D59', dark: '#FFA4BA', tint: '#FCE5EC' },
};
const none = 'No prior course recommended by College Board. Your school may set its own placement requirements.';
function course(id: string, title: string, summary: string, preparation: string, topics: string[], ratings: [Demand, Demand, Demand], reason: string): APCourse {
  return { id, title, summary, preparation, topics, ratings: { difficulty: ratings[0], workload: ratings[1], math: ratings[2] }, reason, source: `https://apstudents.collegeboard.org/courses/${id}` };
}
export const apCourses: APCourse[] = [
  course('ap-biology', 'AP Biology', 'Explore how living systems work, from cells and DNA to evolution and ecosystems.', 'Take high-school biology and chemistry first.', ['Cells and energy', 'Genetics', 'Evolution and ecology'], ['A', 'A', 'B'], 'A broad set of concepts, lab analysis, and evidence-based explanations require steady review.'),
  course('ap-chemistry', 'AP Chemistry', 'Explain matter and chemical change through experiments, models, and calculations.', 'Take high-school chemistry and Algebra II first.', ['Atomic structure', 'Reactions and equilibrium', 'Acids and bases'], ['A+', 'A+', 'A'], 'Multi-step calculations and abstract molecular models make this especially demanding.'),
  course('ap-environmental-science', 'AP Environmental Science', 'Investigate ecosystems, natural resources, and the environmental effects of human decisions.', 'Two years of lab science covering life and physical science, plus at least one year of algebra, are recommended.', ['Ecosystems', 'Resources and energy', 'Pollution'], ['B', 'B', 'B'], 'The breadth of vocabulary and data analysis calls for regular review and applied practice.'),
  course('ap-calculus-ab', 'AP Calculus AB', 'Use derivatives and integrals to describe change and accumulation.', 'Build a strong foundation in algebra, geometry, trigonometry, analytic geometry, and functions, typically through precalculus.', ['Limits', 'Derivatives', 'Integrals'], ['A', 'A', 'A+'], 'New mathematical ideas build on fluent algebra and trigonometry.'),
  course('ap-calculus-bc', 'AP Calculus BC', 'Study single-variable calculus, including additional integration methods and infinite series.', 'Prepare in algebra, geometry, trigonometry, functions, sequences, series, and polar equations. College Board does not list Calculus AB as a prerequisite.', ['Derivatives and integrals', 'Parametric and polar curves', 'Infinite series'], ['A+', 'A+', 'A+'], 'The added topics and pace require strong foundations and consistent problem solving.'),
  course('ap-statistics', 'AP Statistics', 'Use data, probability, and statistical reasoning to answer real-world questions.', 'A first-year algebra course is recommended by the current College Board course guide. Confirm local placement with your school.', ['Data and experiments', 'Probability', 'Statistical inference'], ['B', 'A', 'B'], 'Choosing methods and explaining conclusions matter as much as carrying out calculations.'),
  course('ap-computer-science-a', 'AP Computer Science A', 'Design, write, and debug programs using Java.', 'High-school English and algebra, including familiarity with functions and function notation, are recommended.', ['Java programming', 'Objects and methods', 'Data collections'], ['A', 'A', 'B'], 'Tracing code and debugging take repeated practice, especially for new programmers.'),
  course('ap-computer-science-principles', 'AP Computer Science Principles', 'Explore programming, data, networks, and the effects of computing on society.', 'A high-school algebra course is recommended.', ['Algorithms', 'Data and networks', 'Computing impacts'], ['B', 'B', 'B'], 'Introductory coding and a project require planning, but the math demand is moderate.'),
  course('ap-physics-1-algebra-based', 'AP Physics 1: Algebra-Based', 'Model motion, forces, energy, and fluids using algebra and experiments.', 'Complete geometry and take Algebra II or an equivalent course alongside physics.', ['Motion and forces', 'Energy and rotation', 'Fluids'], ['A', 'A', 'A'], 'Translating physical situations into models can be challenging even when the algebra is familiar.'),
  course('ap-physics-c-mechanics', 'AP Physics C: Mechanics', 'Use calculus to explain motion, forces, energy, and rotation.', 'Take calculus before or at the same time as this course.', ['Newtonian mechanics', 'Energy and momentum', 'Rotation and oscillations'], ['A+', 'A', 'A+'], 'Combines physical reasoning with calculus-based problem solving.'),
  course('ap-physics-c-electricity-and-magnetism', 'AP Physics C: Electricity and Magnetism', 'Use calculus to investigate electric and magnetic phenomena.', 'Take calculus-based Newtonian physics, such as AP Physics C: Mechanics, first. Calculus should be completed or taken concurrently.', ['Electric fields', 'Circuits', 'Magnetism and induction'], ['A+', 'A+', 'A+'], 'Abstract field models and calculus build on prior mechanics preparation.'),
  course('ap-english-language-and-composition', 'AP English Language and Composition', 'Analyze nonfiction and craft persuasive arguments grounded in evidence.', none, ['Rhetoric', 'Source evaluation', 'Argument writing'], ['A', 'A', 'C'], 'Frequent reading, timed arguments, and revision create a substantial writing workload.'),
  course('ap-english-literature-and-composition', 'AP English Literature and Composition', 'Interpret fiction, poetry, and drama through close reading and analytical writing.', none, ['Poetry', 'Fiction and drama', 'Literary analysis'], ['A', 'A+', 'C'], 'Sustained reading and nuanced literary essays reward careful attention to detail.'),
  course('ap-united-states-government-and-politics', 'AP United States Government and Politics', 'Explore U.S. institutions, civil rights, political behavior, and public policy.', none, ['Constitutional foundations', 'Institutions', 'Rights and participation'], ['B', 'B', 'C'], 'Concepts, court decisions, and evidence-based arguments need regular review.'),
  course('ap-united-states-history', 'AP United States History', 'Investigate U.S. history through documents, competing interpretations, and written arguments.', none, ['Historical evidence', 'Political and social change', 'Document-based writing'], ['A', 'A+', 'C'], 'A long historical span and document-based essays create a heavy reading workload.'),
  course('ap-world-history-modern', 'AP World History: Modern', 'Connect global developments from around 1200 CE to the present.', none, ['Empires and exchange', 'Revolutions', 'Global connections'], ['A', 'A', 'C'], 'Comparing developments across regions requires broad knowledge and strong essay skills.'),
  course('ap-human-geography', 'AP Human Geography', 'Explore how people, cultures, and economies shape places and landscapes.', none, ['Population and migration', 'Culture and politics', 'Cities and land use'], ['B', 'B', 'C'], 'Vocabulary and applying geographic models are the main demands.'),
  course('ap-macroeconomics', 'AP Macroeconomics', 'Explore whole economies, including growth, inflation, employment, and policy.', none, ['Economic indicators', 'Fiscal and monetary policy', 'International trade'], ['B', 'B', 'B'], 'Graph-based models and cause-and-effect reasoning take regular practice.'),
  course('ap-microeconomics', 'AP Microeconomics', 'Study how individuals and firms make decisions and interact in markets.', none, ['Supply and demand', 'Firm behavior', 'Market outcomes'], ['B', 'B', 'B'], 'Interpreting graphs and applying models are more central than advanced mathematics.'),
  course('ap-psychology', 'AP Psychology', 'Explore behavior and mental processes through psychological theories and research.', none, ['Biological foundations', 'Cognition and development', 'Social behavior and health'], ['B', 'B', 'C'], 'The main demands are learning concepts and applying them to studies and everyday situations.'),
  course('ap-art-history', 'AP Art History', 'Interpret art and architecture across cultures and historical periods.', none, ['Visual analysis', 'Cultural context', 'Artistic traditions'], ['A', 'A', 'C'], 'Recognizing works and connecting visual evidence to context requires sustained review.'),
  course('ap-music-theory', 'AP Music Theory', 'Understand musical structure through notation, listening, singing, and composition.', 'Be able to read and write musical notation and have basic singing or instrumental performance skills.', ['Harmony and rhythm', 'Ear training', 'Sight singing'], ['A', 'A', 'C'], 'Listening and sight-singing skills need frequent practice; musical experience strongly affects difficulty.'),
  course('ap-seminar', 'AP Seminar', 'Investigate questions, assess sources, and present evidence-based arguments.', none, ['Research', 'Argument writing', 'Presentations'], ['B', 'A', 'C'], 'Research projects, collaboration, and presentations require careful time management.'),
  course('ap-2-d-art-and-design', 'AP 2-D Art and Design', 'Develop a portfolio that explores ideas through two-dimensional art and design.', 'No prerequisite course. Prior practice making two-dimensional art or design is helpful.', ['Visual inquiry', 'Experimentation', 'Portfolio development'], ['A', 'A+', 'C'], 'Creating, documenting, and revising a portfolio takes sustained independent studio time.'),
];
const groups: Record<string, string[]> = {
  'AP CSA': ['ap-computer-science-a'],
  'AP Computer Science A': ['ap-computer-science-a'],
  'AP Computer Science': ['ap-computer-science-principles', 'ap-computer-science-a'],
  'AP Calculus': ['ap-calculus-ab', 'ap-calculus-bc'],
  'AP English': ['ap-english-language-and-composition', 'ap-english-literature-and-composition'],
  'AP English Language': ['ap-english-language-and-composition'],
  'AP English Literature': ['ap-english-literature-and-composition'],
  'AP Physics': ['ap-physics-1-algebra-based', 'ap-physics-c-mechanics', 'ap-physics-c-electricity-and-magnetism'],
  'AP Physics C': ['ap-physics-c-mechanics', 'ap-physics-c-electricity-and-magnetism'],
  'AP Government': ['ap-united-states-government-and-politics'],
  'AP History': ['ap-world-history-modern', 'ap-united-states-history'],
  'AP U.S. History': ['ap-united-states-history'],
  'AP World History': ['ap-world-history-modern'],
  'AP Art and Design': ['ap-2-d-art-and-design'],
  'AP Studio Art': ['ap-2-d-art-and-design'],
};
export function resolveAPCourses(label: string): APCourse[] {
  const ids = groups[label];
  return ids ? ids.flatMap(id => apCourses.filter(item => item.id === id)) : apCourses.filter(item => item.title === label);
}
