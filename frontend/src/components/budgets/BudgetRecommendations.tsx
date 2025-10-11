'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  BarChart3,
  PiggyBank,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Skeleton,
  Badge,
} from '@/components/ui';
import { BudgetRecommendation } from '@/lib/api/budgets';
import { cn } from '@/lib/utils';

interface BudgetRecommendationsProps {
  recommendations: BudgetRecommendation[];
  isLoading?: boolean;
  onApplyRecommendation?: (recommendationId: string) => void;
  onDismissRecommendation?: (recommendationId: string) => void;
}

const BudgetRecommendations: React.FC<BudgetRecommendationsProps> = ({
  recommendations,
  isLoading = false,
  onApplyRecommendation,
  onDismissRecommendation,
}) => {
  const [dismissedRecommendations, setDismissedRecommendations] = useState<Set<string>>(new Set());

  // Filter out dismissed recommendations
  const activeRecommendations = useMemo(() => {
    return recommendations.filter(rec => !dismissedRecommendations.has(rec.id));
  }, [recommendations, dismissedRecommendations]);

  // Group recommendations by type
  const groupedRecommendations = useMemo(() => {
    const groups = {
      optimization: activeRecommendations.filter(rec => rec.type === 'optimization'),
      allocation: activeRecommendations.filter(rec => rec.type === 'allocation'),
      savings: activeRecommendations.filter(rec => rec.type === 'savings'),
      spending: activeRecommendations.filter(rec => rec.type === 'spending'),
    };
    return groups;
  }, [activeRecommendations]);

  // Get recommendation icon
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'optimization':
        return <BarChart3 className="h-5 w-5" />;
      case 'allocation':
        return <Target className="h-5 w-5" />;
      case 'savings':
        return <PiggyBank className="h-5 w-5" />;
      case 'spending':
        return <DollarSign className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  // Get impact color
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'optimization':
        return 'text-blue-600 bg-blue-100';
      case 'allocation':
        return 'text-purple-600 bg-purple-100';
      case 'savings':
        return 'text-green-600 bg-green-100';
      case 'spending':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Handle dismiss recommendation
  const handleDismiss = (recommendationId: string) => {
    setDismissedRecommendations(prev => new Set([...prev, recommendationId]));
    onDismissRecommendation?.(recommendationId);
  };

  // Handle apply recommendation
  const handleApply = (recommendationId: string) => {
    onApplyRecommendation?.(recommendationId);
  };

  if (isLoading) {
    return (
      <Card className="h-96">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardBody className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardBody>
      </Card>
    );
  }

  if (activeRecommendations.length === 0) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <CardBody className="text-center space-y-4">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Great Job!</h3>
            <p className="text-muted-foreground">
              Your budget is well-optimized. No recommendations at this time.
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Budget Recommendations</h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            {activeRecommendations.length} recommendations
          </span>
        </div>
      </div>

      {/* High Priority Recommendations */}
      {groupedRecommendations.optimization.filter(rec => rec.impact === 'high').length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span>High Priority</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupedRecommendations.optimization
              .filter(rec => rec.impact === 'high')
              .map((recommendation) => (
                <motion.div
                  key={recommendation.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-red-200 bg-red-50/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          {getRecommendationIcon(recommendation.type)}
                          <h4 className="font-semibold text-foreground">{recommendation.title}</h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getImpactColor(recommendation.impact)}>
                            {recommendation.impact} impact
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDismiss(recommendation.id)}
                            className="h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardBody className="pt-0">
                      <p className="text-sm text-muted-foreground mb-4">
                        {recommendation.description}
                      </p>
                      {recommendation.potentialSavings && (
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium text-green-600">
                            Potential Savings: ${recommendation.potentialSavings.toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDismiss(recommendation.id)}
                        >
                          Dismiss
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApply(recommendation.id)}
                        >
                          Apply
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
          </div>
        </div>
      )}

      {/* Optimization Recommendations */}
      {groupedRecommendations.optimization.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <span>Optimization</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupedRecommendations.optimization.map((recommendation) => (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getRecommendationIcon(recommendation.type)}
                        <h4 className="font-semibold text-foreground">{recommendation.title}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getImpactColor(recommendation.impact)}>
                          {recommendation.impact} impact
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismiss(recommendation.id)}
                          className="h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4">
                      {recommendation.description}
                    </p>
                    {recommendation.potentialSavings && (
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-green-600">
                          Potential Savings: ${recommendation.potentialSavings.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDismiss(recommendation.id)}
                      >
                        Dismiss
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApply(recommendation.id)}
                      >
                        Apply
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Allocation Recommendations */}
      {groupedRecommendations.allocation.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-500" />
            <span>Budget Allocation</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupedRecommendations.allocation.map((recommendation) => (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getRecommendationIcon(recommendation.type)}
                        <h4 className="font-semibold text-foreground">{recommendation.title}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getImpactColor(recommendation.impact)}>
                          {recommendation.impact} impact
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismiss(recommendation.id)}
                          className="h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4">
                      {recommendation.description}
                    </p>
                    {recommendation.categoryName && (
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-purple-600">
                          Category: {recommendation.categoryName}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDismiss(recommendation.id)}
                      >
                        Dismiss
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApply(recommendation.id)}
                      >
                        Apply
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Savings Recommendations */}
      {groupedRecommendations.savings.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground flex items-center space-x-2">
            <PiggyBank className="h-5 w-5 text-green-500" />
            <span>Savings Opportunities</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupedRecommendations.savings.map((recommendation) => (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getRecommendationIcon(recommendation.type)}
                        <h4 className="font-semibold text-foreground">{recommendation.title}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getImpactColor(recommendation.impact)}>
                          {recommendation.impact} impact
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismiss(recommendation.id)}
                          className="h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4">
                      {recommendation.description}
                    </p>
                    {recommendation.potentialSavings && (
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-green-600">
                          Potential Savings: ${recommendation.potentialSavings.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDismiss(recommendation.id)}
                      >
                        Dismiss
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApply(recommendation.id)}
                      >
                        Apply
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Spending Recommendations */}
      {groupedRecommendations.spending.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-orange-500" />
            <span>Spending Insights</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupedRecommendations.spending.map((recommendation) => (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getRecommendationIcon(recommendation.type)}
                        <h4 className="font-semibold text-foreground">{recommendation.title}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getImpactColor(recommendation.impact)}>
                          {recommendation.impact} impact
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismiss(recommendation.id)}
                          className="h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4">
                      {recommendation.description}
                    </p>
                    {recommendation.categoryName && (
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-orange-600">
                          Category: {recommendation.categoryName}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDismiss(recommendation.id)}
                      >
                        Dismiss
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApply(recommendation.id)}
                      >
                        Apply
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BudgetRecommendations;
