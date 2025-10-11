'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  Shield,
  Zap,
  Brain,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { Card, CardHeader, CardBody, Badge, Skeleton, Button } from '@/components/ui';
import { ForecastInsight, ForecastSummary } from '@/lib/api/forecasts';
import { cn } from '@/lib/utils';

interface ForecastInsightsProps {
  insights: ForecastInsight[];
  summary: ForecastSummary;
  isLoading?: boolean;
  className?: string;
}

const ForecastInsights: React.FC<ForecastInsightsProps> = ({
  insights,
  summary,
  isLoading = false,
  className,
}) => {
  const groupedInsights = useMemo(() => {
    return insights.reduce((acc, insight) => {
      if (!acc[insight.type]) {
        acc[insight.type] = [];
      }
      acc[insight.type].push(insight);
      return acc;
    }, {} as Record<string, ForecastInsight[]>);
  }, [insights]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction':
        return Target;
      case 'risk':
        return AlertTriangle;
      case 'opportunity':
        return TrendingUp;
      case 'recommendation':
        return Lightbulb;
      default:
        return Brain;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'prediction':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'risk':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'opportunity':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'recommendation':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTimeframeColor = (timeframe: string) => {
    switch (timeframe) {
      case 'short':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medium':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'long':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardBody className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("space-y-4", className)}
    >
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Forecast Summary</h3>
            <Badge className={cn("text-xs", getRiskLevelColor(summary.riskLevel))}>
              {summary.riskLevel.toUpperCase()} RISK
            </Badge>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalPredictedIncome)}
              </div>
              <div className="text-sm text-green-700">Predicted Income</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.totalPredictedExpenses)}
              </div>
              <div className="text-sm text-red-700">Predicted Expenses</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary.netWorthProjection)}
              </div>
              <div className="text-sm text-blue-700">Net Worth Projection</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Confidence Score</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-20 h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${summary.confidenceScore}%` }}
                />
              </div>
              <span className="text-sm font-bold text-foreground">{summary.confidenceScore}%</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Key Trends */}
      <Card>
        <CardHeader>
          <h4 className="text-md font-medium text-foreground flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Key Trends
          </h4>
        </CardHeader>
        <CardBody>
          <ul className="space-y-2">
            {summary.keyTrends.map((trend, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-2"
              >
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{trend}</span>
              </motion.li>
            ))}
          </ul>
        </CardBody>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <h4 className="text-md font-medium text-foreground flex items-center">
            <Brain className="h-4 w-4 mr-2" />
            AI Recommendations
          </h4>
        </CardHeader>
        <CardBody>
          <ul className="space-y-2">
            {summary.recommendations.map((recommendation, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-2"
              >
                <Zap className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{recommendation}</span>
              </motion.li>
            ))}
          </ul>
        </CardBody>
      </Card>

      {/* Insights by Category */}
      {Object.entries(groupedInsights).map(([type, typeInsights]) => {
        const IconComponent = getInsightIcon(type);
        const colorClass = getInsightColor(type);
        
        return (
          <Card key={type}>
            <CardHeader>
              <h4 className="text-md font-medium text-foreground flex items-center">
                <div className={cn("p-1 rounded mr-2", colorClass)}>
                  <IconComponent className="h-4 w-4" />
                </div>
                {type.charAt(0).toUpperCase() + type.slice(1)}s
              </h4>
            </CardHeader>
            <CardBody className="space-y-3">
              {typeInsights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-foreground">{insight.title}</h5>
                    <div className="flex items-center space-x-2">
                      <Badge className={cn("text-xs", getImpactColor(insight.impact))}>
                        {insight.impact}
                      </Badge>
                      <Badge className={cn("text-xs", getTimeframeColor(insight.timeframe))}>
                        {insight.timeframe}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">Confidence:</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-16 h-1.5 bg-muted-foreground/20 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${insight.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-foreground">{insight.confidence}%</span>
                      </div>
                    </div>
                    
                    {insight.actionable && (
                      <Button variant="outline" size="sm" className="text-xs">
                        Take Action
                        <ArrowUpRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                  
                  {insight.category && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {insight.category}
                      </Badge>
                    </div>
                  )}
                </motion.div>
              ))}
            </CardBody>
          </Card>
        );
      })}

      {/* Risk Indicators */}
      <Card>
        <CardHeader>
          <h4 className="text-md font-medium text-foreground flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
            Risk Assessment
          </h4>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Market Volatility</span>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Liquidity Risk</span>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">Low</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Expense Growth</span>
              </div>
              <Badge className="bg-red-100 text-red-800 border-red-200">High</Badge>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default ForecastInsights;
