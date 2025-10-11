'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Save, 
  Trash2, 
  Edit, 
  Copy, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Target,
  PiggyBank,
  Calculator,
  BarChart3,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import { useDebounce } from 'use-debounce';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Slider,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Badge,
  Skeleton,
  Progress,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import { ForecastScenario } from '@/lib/api/forecasts';
import { cn } from '@/lib/utils';

interface ScenarioPlannerProps {
  scenarios: ForecastScenario[];
  selectedScenarioId?: string;
  onScenarioSelect: (scenarioId: string) => void;
  onScenarioCreate: (scenario: Omit<ForecastScenario, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onScenarioUpdate: (id: string, updates: Partial<Omit<ForecastScenario, 'id' | 'createdAt'>>) => void;
  onScenarioDelete: (id: string) => void;
  onScenarioDuplicate: (scenario: ForecastScenario) => void;
  isLoading?: boolean;
  className?: string;
}

interface ScenarioFormData {
  name: string;
  description: string;
  incomeAdjustment: number;
  expenseAdjustment: number;
  savingsGoal?: number;
  investmentRate?: number;
  emergencyFundGoal?: number;
}

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string;
  currentAmount: number;
  monthlyContribution: number;
}

const ScenarioPlanner: React.FC<ScenarioPlannerProps> = ({
  scenarios,
  selectedScenarioId,
  onScenarioSelect,
  onScenarioCreate,
  onScenarioUpdate,
  onScenarioDelete,
  onScenarioDuplicate,
  isLoading = false,
  className,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingScenario, setEditingScenario] = useState<ForecastScenario | null>(null);
  const [activeTab, setActiveTab] = useState('adjustments');
  const [formData, setFormData] = useState<ScenarioFormData>({
    name: '',
    description: '',
    incomeAdjustment: 0,
    expenseAdjustment: 0,
    savingsGoal: 0,
    investmentRate: 0,
    emergencyFundGoal: 0,
  });

  // Debounce form data for real-time updates
  const [debouncedFormData] = useDebounce(formData, 300);

  const selectedScenario = useMemo(() => {
    return scenarios.find(s => s.id === selectedScenarioId);
  }, [scenarios, selectedScenarioId]);

  // Mock savings goals - in real app, this would come from API
  const savingsGoals: SavingsGoal[] = [
    {
      id: 'goal-1',
      name: 'Emergency Fund',
      targetAmount: 10000,
      targetDate: '2024-12-31',
      currentAmount: 3500,
      monthlyContribution: 500,
    },
    {
      id: 'goal-2',
      name: 'Vacation Fund',
      targetAmount: 5000,
      targetDate: '2024-08-15',
      currentAmount: 2000,
      monthlyContribution: 300,
    },
    {
      id: 'goal-3',
      name: 'Home Down Payment',
      targetAmount: 50000,
      targetDate: '2025-06-30',
      currentAmount: 15000,
      monthlyContribution: 2000,
    },
  ];

  const handleFormChange = useCallback((field: keyof ScenarioFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCreateScenario = useCallback(() => {
    if (!formData.name.trim()) return;
    
    onScenarioCreate({
      name: formData.name,
      description: formData.description,
      incomeAdjustment: formData.incomeAdjustment,
      expenseAdjustment: formData.expenseAdjustment,
      isDefault: false,
    });
    
    setFormData({
      name: '',
      description: '',
      incomeAdjustment: 0,
      expenseAdjustment: 0,
      savingsGoal: 0,
      investmentRate: 0,
      emergencyFundGoal: 0,
    });
    setIsCreating(false);
  }, [formData, onScenarioCreate]);

  const handleUpdateScenario = useCallback(() => {
    if (!editingScenario || !formData.name.trim()) return;
    
    onScenarioUpdate(editingScenario.id, {
      name: formData.name,
      description: formData.description,
      incomeAdjustment: formData.incomeAdjustment,
      expenseAdjustment: formData.expenseAdjustment,
    });
    
    setEditingScenario(null);
    setFormData({
      name: '',
      description: '',
      incomeAdjustment: 0,
      expenseAdjustment: 0,
      savingsGoal: 0,
      investmentRate: 0,
      emergencyFundGoal: 0,
    });
  }, [editingScenario, formData, onScenarioUpdate]);

  const handleEditScenario = useCallback((scenario: ForecastScenario) => {
    setEditingScenario(scenario);
    setFormData({
      name: scenario.name,
      description: scenario.description || '',
      incomeAdjustment: scenario.incomeAdjustment,
      expenseAdjustment: scenario.expenseAdjustment,
      savingsGoal: 0,
      investmentRate: 0,
      emergencyFundGoal: 0,
    });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingScenario(null);
    setIsCreating(false);
    setFormData({
      name: '',
      description: '',
      incomeAdjustment: 0,
      expenseAdjustment: 0,
      savingsGoal: 0,
      investmentRate: 0,
      emergencyFundGoal: 0,
    });
  }, []);

  const formatPercentage = useCallback((value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value}%`;
  }, []);

  const getAdjustmentColor = useCallback((value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-muted-foreground';
  }, []);

  const getAdjustmentIcon = useCallback((value: number) => {
    if (value > 0) return TrendingUp;
    if (value < 0) return TrendingDown;
    return DollarSign;
  }, []);

  const calculateProjectedSavings = useCallback(() => {
    const baseIncome = 5000; // Mock base income
    const baseExpenses = 3000; // Mock base expenses
    
    const adjustedIncome = baseIncome * (1 + formData.incomeAdjustment / 100);
    const adjustedExpenses = baseExpenses * (1 + formData.expenseAdjustment / 100);
    
    return Math.max(0, adjustedIncome - adjustedExpenses);
  }, [formData.incomeAdjustment, formData.expenseAdjustment]);

  if (isLoading) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardBody className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardBody>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("space-y-4", className)}
    >
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Scenario Planning</h3>
            <p className="text-sm text-muted-foreground">
              Model different financial scenarios and their outcomes
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreating(true)}
            disabled={isCreating || !!editingScenario}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Scenario
          </Button>
        </CardHeader>
      </Card>

      {/* Scenario List */}
      <Card>
        <CardHeader>
          <h4 className="text-md font-medium text-foreground">Saved Scenarios</h4>
        </CardHeader>
        <CardBody className="space-y-3">
          <AnimatePresence>
            {scenarios.map((scenario) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "p-4 border rounded-lg cursor-pointer transition-all duration-200",
                  selectedScenarioId === scenario.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => onScenarioSelect(scenario.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h5 className="font-medium text-foreground">{scenario.name}</h5>
                      {scenario.isDefault && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </div>
                    {scenario.description && (
                      <p className="text-sm text-muted-foreground mt-1">{scenario.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-muted-foreground">Income:</span>
                        <span className={cn("text-xs font-medium", getAdjustmentColor(scenario.incomeAdjustment))}>
                          {formatPercentage(scenario.incomeAdjustment)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingDown className="h-3 w-3 text-red-600" />
                        <span className="text-xs text-muted-foreground">Expenses:</span>
                        <span className={cn("text-xs font-medium", getAdjustmentColor(scenario.expenseAdjustment))}>
                          {formatPercentage(scenario.expenseAdjustment)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        ⋯
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleEditScenario(scenario);
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onScenarioDuplicate(scenario);
                      }}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      {!scenario.isDefault && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onScenarioDelete(scenario.id);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </CardBody>
      </Card>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {(isCreating || editingScenario) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <h4 className="text-md font-medium text-foreground">
                  {editingScenario ? 'Edit Scenario' : 'Create New Scenario'}
                </h4>
              </CardHeader>
              <CardBody>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
                    <TabsTrigger value="goals">Goals</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>

                  <TabsContent value="adjustments" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Scenario Name"
                        value={formData.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        placeholder="e.g., Optimistic Growth"
                      />
                      
                      <Input
                        label="Description (Optional)"
                        value={formData.description}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        placeholder="Brief description of this scenario"
                      />
                    </div>

                    <div className="space-y-6">
                      {/* Income Adjustment */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-foreground">
                            Income Adjustment
                          </label>
                          <div className="flex items-center space-x-2">
                            <span className={cn("text-sm font-medium", getAdjustmentColor(formData.incomeAdjustment))}>
                              {formatPercentage(formData.incomeAdjustment)}
                            </span>
                            {React.createElement(getAdjustmentIcon(formData.incomeAdjustment), {
                              className: cn("h-4 w-4", getAdjustmentColor(formData.incomeAdjustment))
                            })}
                          </div>
                        </div>
                        <Slider
                          value={[formData.incomeAdjustment]}
                          onValueChange={([value]) => handleFormChange('incomeAdjustment', value)}
                          min={-50}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>-50%</span>
                          <span>0%</span>
                          <span>+100%</span>
                        </div>
                      </div>

                      {/* Expense Adjustment */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-foreground">
                            Expense Adjustment
                          </label>
                          <div className="flex items-center space-x-2">
                            <span className={cn("text-sm font-medium", getAdjustmentColor(formData.expenseAdjustment))}>
                              {formatPercentage(formData.expenseAdjustment)}
                            </span>
                            {React.createElement(getAdjustmentIcon(formData.expenseAdjustment), {
                              className: cn("h-4 w-4", getAdjustmentColor(formData.expenseAdjustment))
                            })}
                          </div>
                        </div>
                        <Slider
                          value={[formData.expenseAdjustment]}
                          onValueChange={([value]) => handleFormChange('expenseAdjustment', value)}
                          min={-50}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>-50%</span>
                          <span>0%</span>
                          <span>+100%</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="goals" className="space-y-4">
                    <div className="space-y-4">
                      <h5 className="text-sm font-medium text-foreground">Savings Goals</h5>
                      
                      {savingsGoals.map((goal) => (
                        <Card key={goal.id}>
                          <CardBody className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <PiggyBank className="h-4 w-4 text-blue-500" />
                                <span className="font-medium text-foreground">{goal.name}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {goal.targetDate}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">
                                  ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                                </span>
                              </div>
                              <Progress 
                                value={(goal.currentAmount / goal.targetAmount) * 100} 
                                className="h-2" 
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Monthly: ${goal.monthlyContribution}</span>
                                <span>{((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)}%</span>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Investment Rate (%)"
                          type="number"
                          value={formData.investmentRate || ''}
                          onChange={(e) => handleFormChange('investmentRate', Number(e.target.value))}
                          placeholder="e.g., 10"
                          min={0}
                          max={100}
                        />
                        
                        <Input
                          label="Emergency Fund Goal ($)"
                          type="number"
                          value={formData.emergencyFundGoal || ''}
                          onChange={(e) => handleFormChange('emergencyFundGoal', Number(e.target.value))}
                          placeholder="e.g., 10000"
                          min={0}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="preview" className="space-y-4">
                    <div className="space-y-4">
                      <h5 className="text-sm font-medium text-foreground">Scenario Preview</h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardBody className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">
                              ${(5000 * (1 + formData.incomeAdjustment / 100)).toLocaleString()}
                            </div>
                            <div className="text-sm text-green-700">Projected Income</div>
                          </CardBody>
                        </Card>
                        
                        <Card>
                          <CardBody className="p-4 text-center">
                            <div className="text-2xl font-bold text-red-600">
                              ${(3000 * (1 + formData.expenseAdjustment / 100)).toLocaleString()}
                            </div>
                            <div className="text-sm text-red-700">Projected Expenses</div>
                          </CardBody>
                        </Card>
                        
                        <Card>
                          <CardBody className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              ${calculateProjectedSavings().toLocaleString()}
                            </div>
                            <div className="text-sm text-blue-700">Monthly Savings</div>
                          </CardBody>
                        </Card>
                      </div>

                      <div className="space-y-2">
                        <h6 className="text-sm font-medium text-foreground">Key Insights</h6>
                        <div className="space-y-2">
                          {calculateProjectedSavings() > 0 ? (
                            <div className="flex items-center space-x-2 text-green-600">
                              <Lightbulb className="h-4 w-4" />
                              <span className="text-sm">Positive cash flow - great for savings!</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 text-red-600">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="text-sm">Negative cash flow - consider expense reduction</span>
                            </div>
                          )}
                          
                          {formData.incomeAdjustment > 20 && (
                            <div className="flex items-center space-x-2 text-blue-600">
                              <TrendingUp className="h-4 w-4" />
                              <span className="text-sm">High income growth - consider investment opportunities</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex items-center justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button
                    onClick={editingScenario ? handleUpdateScenario : handleCreateScenario}
                    disabled={!formData.name.trim()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingScenario ? 'Update Scenario' : 'Create Scenario'}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      {selectedScenario && (
        <Card>
          <CardHeader>
            <h4 className="text-md font-medium text-foreground">Quick Adjustments</h4>
            <p className="text-sm text-muted-foreground">
              Make quick changes to the selected scenario
            </p>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onScenarioUpdate(selectedScenario.id, {
                  incomeAdjustment: Math.min(selectedScenario.incomeAdjustment + 10, 100)
                })}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                +10% Income
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onScenarioUpdate(selectedScenario.id, {
                  incomeAdjustment: Math.max(selectedScenario.incomeAdjustment - 10, -50)
                })}
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                -10% Income
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onScenarioUpdate(selectedScenario.id, {
                  expenseAdjustment: Math.min(selectedScenario.expenseAdjustment + 10, 100)
                })}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                +10% Expenses
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onScenarioUpdate(selectedScenario.id, {
                  expenseAdjustment: Math.max(selectedScenario.expenseAdjustment - 10, -50)
                })}
              >
                <TrendingDown className="h-4 w-4 mr-2" />
                -10% Expenses
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </motion.div>
  );
};

export default ScenarioPlanner;
