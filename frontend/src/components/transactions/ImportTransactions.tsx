'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  Check, 
  X, 
  AlertCircle,
  Download,
  Eye,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { ImportResult, ImportTransaction } from '@/lib/api/transactions';

interface ImportTransactionsProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<ImportResult>;
  isLoading?: boolean;
}

interface PreviewData {
  file: File;
  data: ImportTransaction[];
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

const ImportTransactions: React.FC<ImportTransactionsProps> = ({
  isOpen,
  onClose,
  onImport,
  isLoading = false,
}) => {
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      parseCSVFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const parseCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const data: ImportTransaction[] = [];
      const errors: Array<{ row: number; field: string; message: string }> = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row = i + 1;

        try {
          const transaction: ImportTransaction = {
            date: values[0] || '',
            description: values[1] || '',
            amount: parseFloat(values[2]) || 0,
            category: values[3] || '',
            type: (values[4]?.toLowerCase() === 'income' ? 'income' : 'expense') as 'income' | 'expense',
            tags: values[5] ? values[5].split(';').map(t => t.trim()) : [],
            notes: values[6] || '',
          };

          // Validate required fields
          if (!transaction.date) {
            errors.push({ row, field: 'date', message: 'Date is required' });
          }
          if (!transaction.description) {
            errors.push({ row, field: 'description', message: 'Description is required' });
          }
          if (transaction.amount <= 0) {
            errors.push({ row, field: 'amount', message: 'Amount must be greater than 0' });
          }
          if (!transaction.category) {
            errors.push({ row, field: 'category', message: 'Category is required' });
          }

          data.push(transaction);
        } catch (error) {
          errors.push({ row, field: 'general', message: 'Invalid row format' });
        }
      }

      setPreviewData({ file, data, errors });
      setStep('preview');
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!previewData) return;

    try {
      const result = await onImport(previewData.file);
      setImportResult(result);
      setStep('result');
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setPreviewData(null);
    setImportResult(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US');
    } catch {
      return dateString;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Import Transactions
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Upload a CSV file to import multiple transactions
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {step === 'upload' && (
                <div className="space-y-6">
                  {/* Upload Area */}
                  <div
                    {...getRootProps()}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                      isDragActive
                        ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                    )}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {isDragActive ? 'Drop the file here' : 'Drag & drop your CSV file here'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      or click to browse files
                    </p>
                    <Button variant="outline">
                      Choose File
                    </Button>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                      Supported formats: CSV, XLS, XLSX (max 10MB)
                    </p>
                  </div>

                  {/* CSV Format Info */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Expected CSV Format
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>Required columns: Date, Description, Amount, Category, Type</p>
                      <p>Optional columns: Tags, Notes</p>
                      <p>Type should be &quot;income&quot; or &quot;expense&quot;</p>
                      <p>Tags should be separated by semicolons (;)</p>
                    </div>
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Create sample CSV
                          const sampleCSV = 'Date,Description,Amount,Category,Type,Tags,Notes\n2024-01-20,Salary Deposit,5000,Income,income,work;salary,Monthly salary\n2024-01-19,Grocery Shopping,150.75,Food & Dining,expense,food;groceries,Weekly groceries';
                          const blob = new Blob([sampleCSV], { type: 'text/csv' });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = 'sample-transactions.csv';
                          link.click();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Sample CSV
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {step === 'preview' && previewData && (
                <div className="space-y-6">
                  {/* File Info */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {previewData.file.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {previewData.data.length} transactions found
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove File
                    </Button>
                  </div>

                  {/* Validation Errors */}
                  {previewData.errors.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        <h4 className="font-medium text-red-800 dark:text-red-200">
                          Validation Errors ({previewData.errors.length})
                        </h4>
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {previewData.errors.slice(0, 10).map((error, index) => (
                          <p key={index} className="text-sm text-red-700 dark:text-red-300">
                            Row {error.row}: {error.field} - {error.message}
                          </p>
                        ))}
                        {previewData.errors.length > 10 && (
                          <p className="text-sm text-red-600 dark:text-red-400">
                            ... and {previewData.errors.length - 10} more errors
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Preview Table */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      Preview Data
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-3 py-2 text-left">Date</th>
                            <th className="px-3 py-2 text-left">Description</th>
                            <th className="px-3 py-2 text-left">Amount</th>
                            <th className="px-3 py-2 text-left">Category</th>
                            <th className="px-3 py-2 text-left">Type</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {previewData.data.slice(0, 10).map((transaction, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="px-3 py-2">{formatDate(transaction.date)}</td>
                              <td className="px-3 py-2">{transaction.description}</td>
                              <td className="px-3 py-2">
                                <span className={cn(
                                  transaction.type === 'income' 
                                    ? 'text-green-600 dark:text-green-400' 
                                    : 'text-red-600 dark:text-red-400'
                                )}>
                                  {formatCurrency(transaction.amount)}
                                </span>
                              </td>
                              <td className="px-3 py-2">{transaction.category}</td>
                              <td className="px-3 py-2 capitalize">{transaction.type}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {previewData.data.length > 10 && (
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                          ... and {previewData.data.length - 10} more transactions
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleImport}
                      disabled={isLoading || previewData.errors.length > 0}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Importing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Upload className="h-4 w-4" />
                          <span>Import {previewData.data.length} Transactions</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {step === 'result' && importResult && (
                <div className="space-y-6">
                  {/* Result Summary */}
                  <div className="text-center">
                    <div className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                      importResult.success 
                        ? "bg-green-100 dark:bg-green-900" 
                        : "bg-red-100 dark:bg-red-900"
                    )}>
                      {importResult.success ? (
                        <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                      ) : (
                        <X className="h-8 w-8 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {importResult.success ? 'Import Successful!' : 'Import Failed'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {importResult.success 
                        ? `${importResult.imported} transactions imported successfully`
                        : 'There was an error importing your transactions'
                      }
                    </p>
                  </div>

                  {/* Import Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {importResult.imported}
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300">
                        Imported
                      </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {importResult.errors.length}
                      </div>
                      <div className="text-sm text-red-700 dark:text-red-300">
                        Errors
                      </div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {importResult.warnings.length}
                      </div>
                      <div className="text-sm text-yellow-700 dark:text-yellow-300">
                        Warnings
                      </div>
                    </div>
                  </div>

                  {/* Errors and Warnings */}
                  {(importResult.errors.length > 0 || importResult.warnings.length > 0) && (
                    <div className="space-y-4">
                      {importResult.errors.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                          <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                            Errors
                          </h4>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {importResult.errors.map((error, index) => (
                              <p key={index} className="text-sm text-red-700 dark:text-red-300">
                                Row {error.row}: {error.field} - {error.message}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {importResult.warnings.length > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                            Warnings
                          </h4>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {importResult.warnings.map((warning, index) => (
                              <p key={index} className="text-sm text-yellow-700 dark:text-yellow-300">
                                Row {warning.row}: {warning.field} - {warning.message}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="flex-1"
                    >
                      Import Another File
                    </Button>
                    <Button
                      onClick={handleClose}
                      className="flex-1"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImportTransactions;
