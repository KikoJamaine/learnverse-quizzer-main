
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

interface TabCustomizeContentProps {
  onGenerateQuiz: () => void;
  isGenerating?: boolean;
  numQuestions: number;
  questionTypes: string[];
  difficulty: string;
  onSettingsChanged: (numQuestions: number, questionTypes: string[], difficulty: string) => void;
}

const TabCustomizeContent = ({ 
  onGenerateQuiz, 
  isGenerating = false,
  numQuestions,
  questionTypes,
  difficulty,
  onSettingsChanged
}: TabCustomizeContentProps) => {
  const [localNumQuestions, setLocalNumQuestions] = useState(numQuestions);
  const [localQuestionTypes, setLocalQuestionTypes] = useState<{ [key: string]: boolean }>({
    multiple_choice: questionTypes.includes('multiple_choice'),
    true_false: questionTypes.includes('true_false'),
    essay: questionTypes.includes('essay')
  });
  const [localDifficulty, setLocalDifficulty] = useState(difficulty);

  // Update parent component when settings change
  useEffect(() => {
    const types = Object.entries(localQuestionTypes)
      .filter(([_, isSelected]) => isSelected)
      .map(([type]) => type);
      
    onSettingsChanged(localNumQuestions, types, localDifficulty);
  }, [localNumQuestions, localQuestionTypes, localDifficulty, onSettingsChanged]);

  const handleNumQuestionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setLocalNumQuestions(isNaN(value) ? 10 : Math.min(Math.max(value, 1), 50));
  };

  const handleQuestionTypeChange = (type: string, checked: boolean) => {
    // Ensure at least one question type is selected
    const updatedTypes = { ...localQuestionTypes, [type]: checked };
    if (Object.values(updatedTypes).some(value => value)) {
      setLocalQuestionTypes(updatedTypes);
    }
  };

  const handleDifficultyChange = (level: string) => {
    setLocalDifficulty(level);
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Customize Quiz Settings</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Configure how the AI should generate questions from your content
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="numQuestions">Number of Questions</Label>
                    <Input
                      id="numQuestions"
                      type="number"
                      value={localNumQuestions}
                      onChange={handleNumQuestionsChange}
                      min={1}
                      max={50}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Question Types</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="multiple-choice" 
                          checked={localQuestionTypes.multiple_choice}
                          onCheckedChange={(checked) => handleQuestionTypeChange('multiple_choice', checked === true)}
                        />
                        <label
                          htmlFor="multiple-choice"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Multiple Choice
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="true-false" 
                          checked={localQuestionTypes.true_false}
                          onCheckedChange={(checked) => handleQuestionTypeChange('true_false', checked === true)}
                        />
                        <label
                          htmlFor="true-false"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          True/False
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="essay" 
                          checked={localQuestionTypes.essay}
                          onCheckedChange={(checked) => handleQuestionTypeChange('essay', checked === true)}
                        />
                        <label
                          htmlFor="essay"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Essay
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Difficulty Level</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        className={`text-sm ${localDifficulty === 'easy' ? 'bg-primary/10 border-primary/20' : ''}`}
                        size="sm"
                        onClick={() => handleDifficultyChange('easy')}
                      >
                        Easy
                      </Button>
                      <Button
                        variant="outline"
                        className={`text-sm ${localDifficulty === 'medium' ? 'bg-primary/10 border-primary/20' : ''}`}
                        size="sm"
                        onClick={() => handleDifficultyChange('medium')}
                      >
                        Medium
                      </Button>
                      <Button 
                        variant="outline" 
                        className={`text-sm ${localDifficulty === 'hard' ? 'bg-primary/10 border-primary/20' : ''}`}
                        size="sm"
                        onClick={() => handleDifficultyChange('hard')}
                      >
                        Hard
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Quiz Features</Label>
                    <div className="space-y-3 mt-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="time-limit" className="text-sm cursor-pointer">
                            Time Limit
                          </Label>
                          <p className="text-muted-foreground text-xs">
                            Set a time limit for completing the quiz
                          </p>
                        </div>
                        <Switch id="time-limit" />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="randomize" className="text-sm cursor-pointer">
                            Randomize Questions
                          </Label>
                          <p className="text-muted-foreground text-xs">
                            Present questions in random order
                          </p>
                        </div>
                        <Switch id="randomize" defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="adaptive" className="text-sm cursor-pointer">
                            Adaptive Learning
                          </Label>
                          <p className="text-muted-foreground text-xs">
                            Adjust question difficulty based on performance
                          </p>
                        </div>
                        <Switch id="adaptive" defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="certificate" className="text-sm cursor-pointer">
                            Issue Certificate
                          </Label>
                          <p className="text-muted-foreground text-xs">
                            Generate completion certificate automatically
                          </p>
                        </div>
                        <Switch id="certificate" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="pt-2">
                <Button 
                  onClick={onGenerateQuiz} 
                  className="w-full"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Quiz...
                    </>
                  ) : (
                    'Generate Quiz'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TabCustomizeContent;
