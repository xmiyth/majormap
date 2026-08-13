export type Major = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  difficulty: string;
  salary: string;
  description: string;
  courses: string[];
  skills: string[];
  careers: string[];
  highSchoolSubjects: string[];
  apCourses: string[];
  related: string[];
  specializations?: string[];
  color: string;
};

export type CategoryKey =
  | 'Technology'
  | 'Business'
  | 'Health'
  | 'Science'
  | 'Arts'
  | 'Psychology'
  | 'Engineering'
  | 'Animation'
  | 'Economics'
  | 'Entrepreneurship'
  | 'Humanities'
  | 'Education';

export type QuizOption = {
  label: string;
  categories: CategoryKey[];
};

export type QuizQuestion = {
  id: string;
  text: string;
  options: QuizOption[];
};
