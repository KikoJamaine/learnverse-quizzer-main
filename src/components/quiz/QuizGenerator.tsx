
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TabUploadContent from './TabUploadContent';
import TabCustomizeContent from './TabCustomizeContent';
import TabPreviewContent from './TabPreviewContent';
import { QuizQuestion } from '@/services/quizService';
import { toast } from 'sonner';

interface QuizGeneratorProps {
  onPublish?: (quizData: any) => void;
  isPublishing?: boolean;
}

const QuizGenerator = ({ onPublish, isPublishing = false }: QuizGeneratorProps) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [quizGenerated, setQuizGenerated] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  
  // Settings from customize tab
  const [numQuestions, setNumQuestions] = useState(10);
  const [questionTypes, setQuestionTypes] = useState<string[]>(['multiple_choice', 'true_false', 'essay']);
  const [difficulty, setDifficulty] = useState('medium');
  
  // Track generation progress
  const [isGenerating, setIsGenerating] = useState(false);

  const handleContinueToCustomize = () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }
    
    if (!quizTitle) {
      toast.error("Please enter a quiz title");
      return;
    }
    
    setActiveTab('customize');
  };

  const handleGenerateQuiz = async () => {
    if (!selectedFile) {
      toast.error("No file selected");
      return;
    }
    
    try {
      setIsGenerating(true);
      
      // In a real implementation, this would send the file to a service
      // and use AI to generate questions based on the content
      const { generateQuestionsFromFile } = await import('@/services/quizService');
      
      // Generate questions based on the file and settings
      const generatedQuestions = await generateQuestionsFromFile(
        selectedFile,
        numQuestions,
        difficulty,
        questionTypes.filter(type => type !== '')
      );
      
      setQuizQuestions(generatedQuestions);
      setQuizGenerated(true);
      setActiveTab('preview');
      toast.success("Quiz questions generated successfully!");
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error("Failed to generate quiz questions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBackToCustomize = () => {
    setActiveTab('customize');
  };

  const handlePublishQuiz = () => {
    if (onPublish) {
      onPublish({
        title: quizTitle,
        description: quizDescription,
        questions: quizQuestions
      });
    }
  };

  const handleQuestionsUpdated = (questions: QuizQuestion[]) => {
    setQuizQuestions(questions);
  };
  
  const handleCustomizeSettingsChanged = (
    newNumQuestions: number,
    newQuestionTypes: string[],
    newDifficulty: string
  ) => {
    setNumQuestions(newNumQuestions);
    setQuestionTypes(newQuestionTypes);
    setDifficulty(newDifficulty);
  };

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Quiz Generator</h1>
          <p className="text-muted-foreground mt-1">Create AI-powered quizzes from your teaching materials</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="upload">Upload Content</TabsTrigger>
          <TabsTrigger value="customize" disabled={!selectedFile}>
            Customize Quiz
          </TabsTrigger>
          <TabsTrigger value="preview" disabled={!quizGenerated}>
            Preview & Save
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <TabUploadContent 
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            quizTitle={quizTitle}
            setQuizTitle={setQuizTitle}
            quizDescription={quizDescription}
            setQuizDescription={setQuizDescription}
            onContinue={handleContinueToCustomize}
          />
        </TabsContent>

        <TabsContent value="customize">
          <TabCustomizeContent 
            onGenerateQuiz={handleGenerateQuiz}
            isGenerating={isGenerating}
            numQuestions={numQuestions}
            questionTypes={questionTypes}
            difficulty={difficulty}
            onSettingsChanged={handleCustomizeSettingsChanged}
          />
        </TabsContent>

        <TabsContent value="preview">
          <TabPreviewContent 
            quizTitle={quizTitle}
            onBack={handleBackToCustomize}
            onPublish={handlePublishQuiz}
            isPublishing={isPublishing}
            onQuestionsUpdated={handleQuestionsUpdated}
            initialQuestions={quizQuestions}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuizGenerator;
