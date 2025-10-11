'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Download, 
  Calendar,
  Mail,
  Settings,
  BarChart3,
  PieChart,
  Table,
  Gauge,
  Grid,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  Skeleton,
  Input,
  Label,
  Textarea,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  ModalClose,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import { CustomReport, ReportWidget, ReportFilters } from '@/lib/api/analytics';
import { useCustomReports, useCreateCustomReport, useUpdateCustomReport, useDeleteCustomReport } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';

interface CustomReportsProps {
  startDate: Date;
  endDate: Date;
  selectedCategories: string[];
}

interface WidgetPaletteProps {
  onAddWidget: (type: ReportWidget['type']) => void;
}

const WidgetPalette: React.FC<WidgetPaletteProps> = ({ onAddWidget }) => {
  const widgetTypes = [
    { type: 'chart' as const, label: 'Chart', icon: BarChart3, description: 'Line, bar, or pie charts' },
    { type: 'table' as const, label: 'Table', icon: Table, description: 'Data tables with sorting' },
    { type: 'metric' as const, label: 'Metric', icon: Gauge, description: 'Single value displays' },
    { type: 'gauge' as const, label: 'Gauge', icon: Gauge, description: 'Progress and gauge charts' },
  ];

  return (
    <div className="p-4 border rounded-lg bg-muted/50">
      <h4 className="font-medium mb-3">Widget Palette</h4>
      <div className="grid grid-cols-2 gap-2">
        {widgetTypes.map((widget) => {
          const Icon = widget.icon;
          return (
            <Button
              key={widget.type}
              variant="outline"
              size="sm"
              className="h-auto p-3 flex flex-col items-center space-y-1"
              onClick={() => onAddWidget(widget.type)}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs">{widget.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

interface ReportBuilderProps {
  report: CustomReport;
  onUpdate: (updates: Partial<CustomReport>) => void;
  onSave: () => void;
  onCancel: () => void;
}

const ReportBuilder: React.FC<ReportBuilderProps> = ({ report, onUpdate, onSave, onCancel }) => {
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

  const handleAddWidget = useCallback((type: ReportWidget['type']) => {
    const newWidget: ReportWidget = {
      id: `widget-${Date.now()}`,
      type,
      title: `New ${type}`,
      dataSource: 'spending',
      config: {},
      position: { x: 0, y: 0, width: 300, height: 200 },
    };
    
    onUpdate({
      widgets: [...report.widgets, newWidget],
    });
  }, [report.widgets, onUpdate]);

  const handleUpdateWidget = useCallback((widgetId: string, updates: Partial<ReportWidget>) => {
    const updatedWidgets = report.widgets.map(widget =>
      widget.id === widgetId ? { ...widget, ...updates } : widget
    );
    onUpdate({ widgets: updatedWidgets });
  }, [report.widgets, onUpdate]);

  const handleDeleteWidget = useCallback((widgetId: string) => {
    const updatedWidgets = report.widgets.filter(widget => widget.id !== widgetId);
    onUpdate({ widgets: updatedWidgets });
  }, [report.widgets, onUpdate]);

  const renderWidget = useCallback((widget: ReportWidget) => {
    const isSelected = selectedWidget === widget.id;
    
    return (
      <motion.div
        key={widget.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "relative border rounded-lg p-4 bg-background cursor-pointer transition-all",
          isSelected ? "ring-2 ring-primary" : "hover:border-primary/50"
        )}
        style={{
          width: widget.position.width,
          height: widget.position.height,
        }}
        onClick={() => setSelectedWidget(widget.id)}
      >
        <div className="flex items-center justify-between mb-2">
          <h5 className="font-medium text-sm">{widget.title}</h5>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteWidget(widget.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="h-full flex items-center justify-center text-muted-foreground">
          {widget.type === 'chart' && <BarChart3 className="h-8 w-8" />}
          {widget.type === 'table' && <Table className="h-8 w-8" />}
          {widget.type === 'metric' && <Gauge className="h-8 w-8" />}
          {widget.type === 'gauge' && <Gauge className="h-8 w-8" />}
        </div>
      </motion.div>
    );
  }, [selectedWidget, handleDeleteWidget]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Report Builder</h3>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <WidgetPalette onAddWidget={handleAddWidget} />
        </div>
        
        <div className="lg:col-span-3">
          <div className="border rounded-lg p-4 min-h-[400px] bg-muted/20">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Report Canvas</h4>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Grid className="h-4 w-4 mr-2" />
                  Grid
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.widgets.map(renderWidget)}
            </div>
            
            {report.widgets.length === 0 && (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <Grid className="h-12 w-12 mx-auto mb-4" />
                  <p>No widgets added yet</p>
                  <p className="text-sm">Add widgets from the palette to build your report</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomReports: React.FC<CustomReportsProps> = ({
  startDate,
  endDate,
  selectedCategories,
}) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'builder'>('reports');
  const [editingReport, setEditingReport] = useState<CustomReport | null>(null);
  const [newReport, setNewReport] = useState<Partial<CustomReport>>({
    name: '',
    description: '',
    widgets: [],
    filters: {
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
      categories: selectedCategories,
    },
  });

  const { data: reports = [], isLoading } = useCustomReports();
  const createReport = useCreateCustomReport();
  const updateReport = useUpdateCustomReport();
  const deleteReport = useDeleteCustomReport();

  const handleCreateReport = useCallback(async () => {
    if (!newReport.name) return;
    
    await createReport.mutateAsync(newReport as Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>);
    setNewReport({
      name: '',
      description: '',
      widgets: [],
      filters: {
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0],
        },
        categories: selectedCategories,
      },
    });
    setActiveTab('reports');
  }, [newReport, createReport, startDate, endDate, selectedCategories]);

  const handleUpdateReport = useCallback(async () => {
    if (!editingReport) return;
    
    await updateReport.mutateAsync({
      id: editingReport.id,
      updates: editingReport,
    });
    setEditingReport(null);
    setActiveTab('reports');
  }, [editingReport, updateReport]);

  const handleDeleteReport = useCallback(async (reportId: string) => {
    await deleteReport.mutateAsync(reportId);
  }, [deleteReport]);

  const handleDuplicateReport = useCallback(async (report: CustomReport) => {
    const duplicatedReport = {
      ...report,
      name: `${report.name} (Copy)`,
      widgets: report.widgets.map(widget => ({
        ...widget,
        id: `widget-${Date.now()}-${Math.random()}`,
      })),
    };
    await createReport.mutateAsync(duplicatedReport);
  }, [createReport]);

  if (isLoading) {
    return (
      <Card className="h-96">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardBody>
          <Skeleton className="h-80 w-full" />
        </CardBody>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Custom Reports</h3>
              <p className="text-sm text-muted-foreground">
                Create and manage custom analytics reports
              </p>
            </div>
            <Button onClick={() => setActiveTab('builder')}>
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'reports' | 'builder')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="reports">My Reports</TabsTrigger>
              <TabsTrigger value="builder">Report Builder</TabsTrigger>
            </TabsList>
            
            <TabsContent value="reports" className="space-y-4">
              {reports.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-foreground mb-2">No Reports Yet</h4>
                  <p className="text-muted-foreground mb-4">
                    Create your first custom report to get started with advanced analytics.
                  </p>
                  <Button onClick={() => setActiveTab('builder')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Report
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reports.map((report) => (
                    <Card key={report.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{report.name}</h4>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingReport(report)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateReport(report)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteReport(report.id)} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        {report.description && (
                          <p className="text-sm text-muted-foreground">{report.description}</p>
                        )}
                      </CardHeader>
                      <CardBody className="pt-0">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Widgets:</span>
                            <span className="font-medium">{report.widgets.length}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Created:</span>
                            <span className="font-medium">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {report.schedule && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Schedule:</span>
                              <Badge variant="secondary">
                                {report.schedule.frequency}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="builder" className="space-y-4">
              {editingReport ? (
                <ReportBuilder
                  report={editingReport}
                  onUpdate={(updates) => setEditingReport({ ...editingReport, ...updates })}
                  onSave={handleUpdateReport}
                  onCancel={() => setEditingReport(null)}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Create New Report</h3>
                    <Button variant="outline" onClick={() => setActiveTab('reports')}>
                      Back to Reports
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-1 space-y-4">
                      <div>
                        <Label htmlFor="report-name">Report Name</Label>
                        <Input
                          id="report-name"
                          value={newReport.name || ''}
                          onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                          placeholder="Enter report name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="report-description">Description</Label>
                        <Textarea
                          id="report-description"
                          value={newReport.description || ''}
                          onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                          placeholder="Enter report description"
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Schedule (Optional)</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Daily</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Email reports</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="lg:col-span-2">
                      <ReportBuilder
                        report={newReport as CustomReport}
                        onUpdate={(updates) => setNewReport({ ...newReport, ...updates })}
                        onSave={handleCreateReport}
                        onCancel={() => setActiveTab('reports')}
                      />
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export { CustomReports };
