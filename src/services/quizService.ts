
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface QuizQuestion {
  id?: string;
  text: string;
  type: string;
  options: any;
  order_position: number;
  correct_answer?: any;
}

export interface Quiz {
  id?: string;
  title: string;
  description?: string;
  published: boolean;
  invitation_code?: string;
  questions?: QuizQuestion[];
  created_at?: string;
  user_id?: string;
}

// Get a list of quizzes for the current user
export const getUserQuizzes = async () => {
  const { data: quizzes, error } = await supabase
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching quizzes:", error);
    throw error;
  }
  
  return quizzes;
};

// Get a specific quiz with its questions
export const getQuizWithQuestions = async (quizId: string) => {
  // Fetch the quiz
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', quizId)
    .single();
    
  if (quizError) {
    console.error("Error fetching quiz:", quizError);
    throw quizError;
  }
  
  // Fetch the questions for this quiz
  const { data: questions, error: questionsError } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('order_position', { ascending: true });
    
  if (questionsError) {
    console.error("Error fetching questions:", questionsError);
    throw questionsError;
  }
  
  return { ...quiz, questions };
};

// Generate quiz questions from a file
export const generateQuestionsFromFile = async (file: File, numQuestions: number, difficulty: string, questionTypes: string[]): Promise<QuizQuestion[]> => {
  // In a real implementation, this would upload the file to a service
  // and use AI to generate questions based on the content
  
  // para sa demo purposes, we'll simulate reading the file and generating questions
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate different question generation based on difficulty
      const questions: QuizQuestion[] = [];
      
      // Sample text for simulation - this would be extracted from the file in a real implementation dito iintegrate yung QGM
      const topics = [
        "Neural Networks", "Deep Learning", "Machine Learning", 
        "Artificial Intelligence", "Data Science", "Natural Language Processing",
        "Computer Vision", "Reinforcement Learning", "Statistical Analysis",
        "Big Data", "Quantum Computing", "Blockchain"
      ];
      
      // Generate questions based on the requested number
      for (let i = 0; i < numQuestions; i++) {
        // Randomly select a question type from the allowed types
        const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        
        // Generate a random topic
        const topic = topics[Math.floor(Math.random() * topics.length)];
        
        let question: QuizQuestion;
        
        if (type === 'multiple_choice') {
          question = {
            text: generateQuestionText(topic, difficulty),
            type: 'multiple_choice',
            options: generateOptions(topic, difficulty),
            correct_answer: 'a', // Always set the first option as correct for demo
            order_position: i
          };
        } else if (type === 'true_false') {
          question = {
            text: generateTrueFalseQuestion(topic, difficulty),
            type: 'true_false',
            options: [
              { id: 'a', text: 'True' },
              { id: 'b', text: 'False' }
            ],
            correct_answer: Math.random() > 0.5 ? 'a' : 'b',
            order_position: i
          };
        } else {
          // Essay question
          question = {
            text: generateEssayQuestion(topic, difficulty),
            type: 'essay',
            options: [],
            order_position: i
          };
        }
        
        questions.push(question);
      }
      
      resolve(questions);
    }, 2000); // Simulate processing time
  });
};

// Helper function to generate question text
const generateQuestionText = (topic: string, difficulty: string): string => {
  const easyPrefixes = ["What is", "Define", "Explain", "Describe"];
  const mediumPrefixes = ["How does", "Compare and contrast", "Analyze"];
  const hardPrefixes = ["Critically evaluate", "Synthesize", "Hypothesize about"];
  
  let prefixes;
  switch (difficulty) {
    case 'easy':
      prefixes = easyPrefixes;
      break;
    case 'hard':
      prefixes = hardPrefixes;
      break;
    default:
      prefixes = mediumPrefixes;
  }
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return `${prefix} ${topic}?`;
};

// Helper function to generate true/false question
const generateTrueFalseQuestion = (topic: string, difficulty: string): string => {
  const statements = [
    `${topic} is a fundamental concept in computer science.`,
    `${topic} can only be implemented using Python.`,
    `${topic} has applications in healthcare.`,
    `${topic} requires specialized hardware.`,
    `${topic} was invented in the 1950s.`
  ];
  
  return statements[Math.floor(Math.random() * statements.length)];
};

// Helper function to generate essay question
const generateEssayQuestion = (topic: string, difficulty: string): string => {
  const templates = [
    `Explain the importance of ${topic} in modern technology.`,
    `Discuss the ethical implications of ${topic}.`,
    `How might ${topic} evolve over the next decade?`,
    `Compare the approaches to ${topic} in different industries.`,
    `What are the limitations of current ${topic} technologies?`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
};

// Helper function to generate options for multiple choice
const generateOptions = (topic: string, difficulty: string): any[] => {
  return [
    { id: 'a', text: `The primary framework for implementing ${topic}` },
    { id: 'b', text: `A methodology for analyzing ${topic} systems` },
    { id: 'c', text: `The process of optimizing ${topic} algorithms` },
    { id: 'd', text: `An application of ${topic} in real-world scenarios` }
  ];
};

// Save a quiz with its questions
export const saveQuiz = async (quiz: Quiz, questions: QuizQuestion[]) => {
  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User must be authenticated to save a quiz");
  }
  
  // Generate invitation code if the quiz is published
  const invitationCode = quiz.published ? generateInvitationCode() : null;
  
  // Insert/update the quiz
  const { data: savedQuiz, error: quizError } = await supabase
    .from('quizzes')
    .upsert({
      id: quiz.id || undefined,
      title: quiz.title,
      description: quiz.description,
      published: quiz.published,
      invitation_code: invitationCode,
      user_id: user.id // Add the required user_id field
    })
    .select()
    .single();
    
  if (quizError) {
    console.error("Error saving quiz:", quizError);
    throw quizError;
  }
  
  // Prepare questions with the quiz ID and proper UUID for each question
  const questionsToSave = questions.map((question, index) => ({
    id: question.id && question.id.length > 10 ? question.id : uuidv4(), // Use existing UUID or create new one
    quiz_id: savedQuiz.id,
    text: question.text,
    type: question.type,
    options: question.options,
    correct_answer: question.correct_answer,
    order_position: question.order_position || index
  }));
  
  // Insert/update all questions
  const { data: savedQuestions, error: questionsError } = await supabase
    .from('quiz_questions')
    .upsert(questionsToSave)
    .select();
    
  if (questionsError) {
    console.error("Error saving questions:", questionsError);
    throw questionsError;
  }
  
  return { ...savedQuiz, questions: savedQuestions };
};

// Publish a quiz
export const publishQuiz = async (quizId: string) => {
  const invitationCode = generateInvitationCode();
  
  const { data, error } = await supabase
    .from('quizzes')
    .update({ published: true, invitation_code: invitationCode })
    .eq('id', quizId)
    .select()
    .single();
    
  if (error) {
    console.error("Error publishing quiz:", error);
    throw error;
  }
  
  return data;
};

// Generate a random invitation code
export const generateInvitationCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};
