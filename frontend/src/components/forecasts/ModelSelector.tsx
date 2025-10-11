'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Zap, 
  Target, 
  Info, 
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  Tooltip as UITooltip,
  Progress,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import { cn } from '@/lib/utils';

export interface ForecastModel {
  id: string;
  name: string;
  description: string;
  type: 'linear' | 'exponential' | 'seasonal' | 'neural' | 'ensemble';
  accuracy: number;
  confidence: number;
  speed: 'fast' | 'medium' | 'slow';
  complexity: 'simple' | 'moderate' | 'complex';
  bestFor: string[];
  limitations: string[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface ModelSelectorProps {
  selectedModelId?: string;
  onModelSelect: (modelId: string) => void;
  onCompareModels?: (modelIds: string[]) => void;
  className?: string;
}

const availableModels: ForecastModel[] = [
  {
    id: 'linear-regression',
    name: 'Linear Regression',
    description: 'Simple trend-based prediction using historical linear patterns',
    type: 'linear',
    accuracy: 78,
    confidence: 85,
    speed: 'fast',
    complexity: 'simple',
    bestFor: ['Short-term predictions', 'Trend analysis', 'Quick insights'],
    limitations: ['Assumes linear trends', 'Limited for volatile data'],
    icon: TrendingUp,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  {
    id: 'exponential-smoothing',
    name: 'Exponential Smoothing',
    description: 'Weighted average method that gives more importance to recent data',
    type: 'exponential',
    accuracy: 82,
    confidence: 80,
    speed: 'fast',
    complexity: 'simple',
    bestFor: ['Recent trend emphasis', 'Smooth predictions', 'Quick forecasts'],
    limitations: ['May lag behind rapid changes', 'Limited seasonality handling'],
    icon: Activity,
    color: 'text-green-600 bg-green-50 border-green-200',
  },
  {
    id: 'seasonal-arima',
    name: 'Seasonal ARIMA',
    description: 'Advanced statistical model that captures seasonal patterns and trends',
    type: 'seasonal',
    accuracy: 88,
    confidence: 90,
    speed: 'medium',
    complexity: 'moderate',
    bestFor: ['Seasonal patterns', 'Medium-term forecasts', 'Statistical accuracy'],
    limitations: ['Requires sufficient data', 'Complex parameter tuning'],
    icon: BarChart3,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  {
    id: 'neural-network',
    name: 'Neural Network',
    description: 'Deep learning model that captures complex non-linear relationships',
    type: 'neural',
    accuracy: 92,
    confidence: 75,
    speed: 'slow',
    complexity: 'complex',
    bestFor: ['Complex patterns', 'Non-linear relationships', 'High accuracy needs'],
    limitations: ['Requires large datasets', 'Black box model', 'Computationally expensive'],
    icon: Brain,
    color: 'text-orange-600 bg-orange-50 border-orange-200',
  },
  {
    id: 'ensemble-model',
    name: 'Ensemble Model',
    description: 'Combines multiple models for improved accuracy and robustness',
    type: 'ensemble',
    accuracy: 95,
    confidence: 88,
    speed: 'slow',
    complexity: 'complex',
    bestFor: ['Maximum accuracy', 'Robust predictions', 'Production systems'],
    limitations: ['High computational cost', 'Complex interpretation'],
    icon: Target,
    color: 'text-red-600 bg-red-50 border-red-200',
  },
];

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModelId,
  onModelSelect,
  onCompareModels,
  className,
}) => {
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const handleModelToggle = useCallback((modelId: string) => {
    if (selectedModels.includes(modelId)) {
      setSelectedModels(prev => prev.filter(id => id !== modelId));
    } else {
      setSelectedModels(prev => [...prev, modelId]);
    }
  }, [selectedModels]);

  const handleCompare = useCallback(() => {
    if (selectedModels.length >= 2 && onCompareModels) {
      onCompareModels(selectedModels);
      setShowComparison(true);
    }
  }, [selectedModels, onCompareModels]);

  const getSpeedIcon = (speed: string) => {
    switch (speed) {
      case 'fast':
        return <Zap className="h-3 w-3 text-green-500" />;
      case 'medium':
        return <Clock className="h-3 w-3 text-yellow-500" />;
      case 'slow':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-500" />;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'complex':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("space-y-4", className)}
    >
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Prediction Models</h3>
              <p className="text-sm text-muted-foreground">
                Choose the best model for your forecasting needs
              </p>
            </div>
            {selectedModels.length >= 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCompare}
              >
                Compare Models ({selectedModels.length})
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Model Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableModels.map((model) => {
          const IconComponent = model.icon;
          const isSelected = selectedModelId === model.id;
          const isInComparison = selectedModels.includes(model.id);
          
          return (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-md",
                  isSelected ? "ring-2 ring-primary shadow-md" : "hover:shadow-sm",
                  isInComparison ? "ring-2 ring-blue-500" : ""
                )}
                onClick={() => onModelSelect(model.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={cn("p-2 rounded-lg", model.color)}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{model.name}</h4>
                        <p className="text-sm text-muted-foreground">{model.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                      {isInComparison && (
                        <Badge variant="secondary" className="text-xs">
                          Compare
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardBody className="pt-0 space-y-4">
                  {/* Accuracy and Confidence */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Accuracy</span>
                        <span className="text-xs font-medium">{model.accuracy}%</span>
                      </div>
                      <Progress value={model.accuracy} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Confidence</span>
                        <span className="text-xs font-medium">{model.confidence}%</span>
                      </div>
                      <Progress value={model.confidence} className="h-2" />
                    </div>
                  </div>

                  {/* Speed and Complexity */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {getSpeedIcon(model.speed)}
                      <span className="text-xs text-muted-foreground capitalize">
                        {model.speed} speed
                      </span>
                    </div>
                    <Badge className={cn("text-xs", getComplexityColor(model.complexity))}>
                      {model.complexity}
                    </Badge>
                  </div>

                  {/* Best For */}
                  <div>
                    <h5 className="text-xs font-medium text-foreground mb-2">Best For:</h5>
                    <div className="flex flex-wrap gap-1">
                      {model.bestFor.slice(0, 2).map((use, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {use}
                        </Badge>
                      ))}
                      {model.bestFor.length > 2 && (
                        <UITooltip content={model.bestFor.slice(2).join(', ')}>
                          <Badge variant="outline" className="text-xs">
                            +{model.bestFor.length - 2} more
                          </Badge>
                        </UITooltip>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <UITooltip content="Add to comparison">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleModelToggle(model.id);
                        }}
                        className={cn(
                          "text-xs",
                          isInComparison ? "text-blue-600" : "text-muted-foreground"
                        )}
                      >
                        {isInComparison ? "Remove from Compare" : "Add to Compare"}
                      </Button>
                    </UITooltip>
                    
                    <UITooltip content="Model details">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Info className="h-3 w-3" />
                      </Button>
                    </UITooltip>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Model Details Modal */}
      <AnimatePresence>
        {showComparison && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowComparison(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Model Comparison</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowComparison(false)}
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardBody className="overflow-y-auto">
                  <Tabs defaultValue="accuracy" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
                      <TabsTrigger value="performance">Performance</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="accuracy" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedModels.map(modelId => {
                          const model = availableModels.find(m => m.id === modelId);
                          if (!model) return null;
                          
                          return (
                            <Card key={modelId}>
                              <CardHeader>
                                <h4 className="font-medium">{model.name}</h4>
                              </CardHeader>
                              <CardBody className="space-y-3">
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm">Accuracy</span>
                                    <span className="text-sm font-medium">{model.accuracy}%</span>
                                  </div>
                                  <Progress value={model.accuracy} className="h-2" />
                                </div>
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm">Confidence</span>
                                    <span className="text-sm font-medium">{model.confidence}%</span>
                                  </div>
                                  <Progress value={model.confidence} className="h-2" />
                                </div>
                              </CardBody>
                            </Card>
                          );
                        })}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="performance" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedModels.map(modelId => {
                          const model = availableModels.find(m => m.id === modelId);
                          if (!model) return null;
                          
                          return (
                            <Card key={modelId}>
                              <CardHeader>
                                <h4 className="font-medium">{model.name}</h4>
                              </CardHeader>
                              <CardBody className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">Speed</span>
                                  <div className="flex items-center space-x-1">
                                    {getSpeedIcon(model.speed)}
                                    <span className="text-sm capitalize">{model.speed}</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">Complexity</span>
                                  <Badge className={cn("text-xs", getComplexityColor(model.complexity))}>
                                    {model.complexity}
                                  </Badge>
                                </div>
                              </CardBody>
                            </Card>
                          );
                        })}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="details" className="space-y-4">
                      {selectedModels.map(modelId => {
                        const model = availableModels.find(m => m.id === modelId);
                        if (!model) return null;
                        
                        return (
                          <Card key={modelId}>
                            <CardHeader>
                              <h4 className="font-medium">{model.name}</h4>
                              <p className="text-sm text-muted-foreground">{model.description}</p>
                            </CardHeader>
                            <CardBody className="space-y-4">
                              <div>
                                <h5 className="text-sm font-medium mb-2">Best For:</h5>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {model.bestFor.map((use, index) => (
                                    <li key={index}>• {use}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium mb-2">Limitations:</h5>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {model.limitations.map((limitation, index) => (
                                    <li key={index}>• {limitation}</li>
                                  ))}
                                </ul>
                              </div>
                            </CardBody>
                          </Card>
                        );
                      })}
                    </TabsContent>
                  </Tabs>
                </CardBody>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ModelSelector;
