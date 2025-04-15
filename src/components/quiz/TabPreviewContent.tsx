
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Check, Loader2, Trash, Edit, Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuizQuestion } from '@/services/quizService';

interface TabPreviewContentProps {
  quizTitle: string;
  onBack: () => void;
  onPublish: () => void;
  isPublishing: boolean;
  onQuestionsUpdated: (questions: QuizQuestion[]) => void;
  initialQuestions?: QuizQuestion[];
}

const TabPreviewContent = ({ 
  quizTitle, 
  onBack, 
  onPublish, 
  isPublishing, 
  onQuestionsUpdated,
  initialQuestions = [] 
}: TabPreviewContentProps) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState<QuizQuestion>({
    text: '',
    type: 'multiple_choice',
    options: [
      { id: 'a', text: '' },
      { id: 'b', text: '' },
      { id: 'c', text: '' },
      { id: 'd', text: '' },
    ],
    correct_answer: 'a',
    order_position: 0,
  });
  
  // Initialize questions from initialQuestions prop
  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      setQuestions(initialQuestions);
    }
  }, [initialQuestions]);

  useEffect(() => {
    // Notify parent component about questions
    onQuestionsUpdated(questions);
  }, [questions, onQuestionsUpdated]);

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    toast.success("Question removed");
  };

  const handleEditQuestion = (question: QuizQuestion) => {
    setEditingQuestion({...question});
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingQuestion) {
      setQuestions(questions.map(q => 
        q.id === editingQuestion.id ? editingQuestion : q
      ));
      setIsEditModalOpen(false);
      toast.success("Question updated");
    }
  };

  const handleOptionChange = (optionId: string, value: string) => {
    if (editingQuestion) {
      setEditingQuestion({
        ...editingQuestion,
        options: editingQuestion.options.map((opt: any) => 
          opt.id === optionId ? { ...opt, text: value } : opt
        )
      });
    }
  };

  const handleAddQuestion = () => {
    setNewQuestion({
      text: '',
      type: 'multiple_choice',
      options: [
        { id: 'a', text: '' },
        { id: 'b', text: '' },
        { id: 'c', text: '' },
        { id: 'd', text: '' },
      ],
      correct_answer: 'a',
      order_position: questions.length,
    });
    setIsAddModalOpen(true);
  };

  const handleQuestionTypeChange = (type: string) => {
    let options;
    
    if (type === 'multiple_choice') {
      options = [
        { id: 'a', text: '' },
        { id: 'b', text: '' },
        { id: 'c', text: '' },
        { id: 'd', text: '' },
      ];
    } else if (type === 'true_false') {
      options = [
        { id: 'a', text: 'True' },
        { id: 'b', text: 'False' },
      ];
    } else if (type === 'essay') {
      options = []; // Essay doesn't have options
    }
    
    if (isAddModalOpen) {
      setNewQuestion({
        ...newQuestion,
        type,
        options,
        correct_answer: type === 'essay' ? '' : 'a'
      });
    } else if (editingQuestion) {
      setEditingQuestion({
        ...editingQuestion,
        type,
        options,
        correct_answer: type === 'essay' ? '' : 'a'
      });
    }
  };

  const handleSaveNewQuestion = () => {
    // Create a new id for the question
    const questionsWithNewOne = [
      ...questions,
      {
        ...newQuestion,
        id: `new-${Date.now()}`, // This will be replaced with UUID when saved
        order_position: questions.length
      }
    ];
    
    setQuestions(questionsWithNewOne);
    setIsAddModalOpen(false);
    toast.success("Question added");
  };

  const handleNewQuestionOptionChange = (optionId: string, value: string) => {
    setNewQuestion({
      ...newQuestion,
      options: newQuestion.options.map((opt: any) => 
        opt.id === optionId ? { ...opt, text: value } : opt
      )
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{quizTitle}</h2>
          <p className="text-muted-foreground mt-1">Preview and edit your generated quiz</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            onClick={onPublish} 
            disabled={questions.length === 0 || isPublishing}
          >
            {isPublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Publish Quiz
              </>
            )}
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Questions ({questions.length})</h3>
          <Button 
            variant="outline"
            onClick={handleAddQuestion}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        {questions.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">No questions generated yet. Go back to customize and generate questions.</p>
            </CardContent>
          </Card>
        ) : (
          questions.map((question, index) => (
            <Card key={question.id || index}>
              <CardContent className="pt-6">
                <div className="flex justify-between">
                  <h4 className="font-medium mb-2">Question {index + 1}</h4>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditQuestion(question)}
                    >
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleRemoveQuestion(question.id || '')}
                    >
                      <Trash className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
                <p className="mb-4">{question.text}</p>
                
                {question.type !== 'essay' && (
                  <div className="space-y-2">
                    {question.options && question.options.map((option: any) => (
                      <div 
                        key={option.id}
                        className={`p-3 border rounded-lg flex items-center ${
                          option.id === question.correct_answer ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700' : ''
                        }`}
                      >
                        <div 
                          className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                            option.id === question.correct_answer ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                          }`}
                        >
                          {option.id === question.correct_answer && <Check className="h-3 w-3" />}
                        </div>
                        <span>{option.text}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {question.type === 'essay' && (
                  <div className="p-3 border rounded-lg bg-muted/30">
                    <p className="text-sm italic text-muted-foreground">Essay question - Students will provide a written response</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Edit Question Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
          </DialogHeader>
          
          {editingQuestion && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="question-type">Question Type</Label>
                <Select 
                  value={editingQuestion.type} 
                  onValueChange={handleQuestionTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a question type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                    <SelectItem value="true_false">True/False</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="question-text">Question Text</Label>
                <Textarea 
                  id="question-text"
                  value={editingQuestion.text}
                  onChange={(e) => setEditingQuestion({...editingQuestion, text: e.target.value})}
                  className="min-h-[80px]"
                />
              </div>
              
              {editingQuestion.type !== 'essay' && editingQuestion.options && (
                <>
                  <div className="space-y-4">
                    <Label>Options</Label>
                    {editingQuestion.options.map((option: any) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroup 
                          value={editingQuestion.correct_answer || ''}
                          onValueChange={(value) => setEditingQuestion({...editingQuestion, correct_answer: value})}
                          className="flex items-center"
                        >
                          <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                        </RadioGroup>
                        <Input 
                          value={option.text} 
                          onChange={(e) => handleOptionChange(option.id, e.target.value)}
                          placeholder={`Option ${option.id.toUpperCase()}`}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Select the radio button next to the correct answer
                  </div>
                </>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Question Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Question</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-question-type">Question Type</Label>
              <Select 
                value={newQuestion.type} 
                onValueChange={handleQuestionTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a question type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="true_false">True/False</SelectItem>
                  <SelectItem value="essay">Essay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-question-text">Question Text</Label>
              <Textarea 
                id="new-question-text"
                value={newQuestion.text}
                onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                className="min-h-[80px]"
                placeholder="Enter your question here"
              />
            </div>
            
            {newQuestion.type !== 'essay' && newQuestion.options && (
              <>
                <div className="space-y-4">
                  <Label>Options</Label>
                  {newQuestion.options.map((option: any) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroup 
                        value={newQuestion.correct_answer || 'a'}
                        onValueChange={(value) => setNewQuestion({...newQuestion, correct_answer: value})}
                        className="flex items-center"
                      >
                        <RadioGroupItem value={option.id} id={`new-option-${option.id}`} />
                      </RadioGroup>
                      <Input 
                        value={option.text} 
                        onChange={(e) => handleNewQuestionOptionChange(option.id, e.target.value)}
                        placeholder={`Option ${option.id.toUpperCase()}`}
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  Select the radio button next to the correct answer
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveNewQuestion}
              disabled={!newQuestion.text || (newQuestion.type !== 'essay' && newQuestion.options && newQuestion.options.some(o => !o.text))}
            >
              Add Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TabPreviewContent;
