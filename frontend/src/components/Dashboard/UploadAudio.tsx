import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  FileAudio,
  CheckCircle,
  Clock,
  MapPin,
  Download,
  Eye,
  Plus,
  X,
  AlertCircle
} from 'lucide-react';

export const UploadAudio = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesAdded = (files: File[]) => {
    setError('');
    setSuccessMessage('');
    const audioFiles = files.filter(file =>
      file.type.startsWith('audio/') ||
      file.name.toLowerCase().endsWith('.mp3') ||
      file.name.toLowerCase().endsWith('.wav') ||
      file.name.toLowerCase().endsWith('.m4a') ||
      file.name.toLowerCase().endsWith('.flac')
    );

    if (audioFiles.length !== files.length) {
      setError('Some files were rejected. Only audio files (MP3, WAV, M4A, FLAC) are supported.');
    }

    setUploadedFiles(prev => [...prev, ...audioFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    handleFilesAdded(files);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleFilesAdded(files);
  };

  const processingStages = [
    { id: 1, name: "Uploading", status: isProcessing && uploadProgress > 25 ? "completed" : uploadProgress > 0 ? "processing" : "pending" },
    { id: 2, name: "Transcribing", status: isProcessing && uploadProgress > 50 ? "completed" : uploadProgress > 25 ? "processing" : "pending" },
    { id: 3, name: "Processing", status: isProcessing && uploadProgress > 75 ? "completed" : uploadProgress > 50 ? "processing" : "pending" },
    { id: 4, name: "Complete", status: uploadProgress === 100 ? "completed" : uploadProgress > 75 ? "processing" : "pending" }
  ];

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) {
      setError('Please select at least one audio file to upload.');
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);
    setError('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      uploadedFiles.forEach((file) => {
        formData.append('files', file);
      });

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90; // Stop at 90%, let the actual response complete it
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('http://164.52.196.116:8000/transcribe', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.text();

      setUploadProgress(100);
      setSuccessMessage(result || 'Files processed successfully!');

      // Clear uploaded files after successful processing
      setTimeout(() => {
        setUploadedFiles([]);
        setUploadProgress(0);
        setIsProcessing(false);
      }, 2000);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setUploadProgress(0);
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Upload 112 Call Recordings
        </h2>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Audio File Upload</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 cursor-pointer border-gray-300 dark:border-gray-600 hover:border-blue-400"
            onClick={handleFileSelect}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="audio/*,.mp3,.wav,.m4a,.flac"
              onChange={handleFileChange}
              className="hidden"
            />

            <FileAudio className="h-12 w-12 mx-auto mb-4 text-gray-400" />

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Drop your audio files here or click to select
            </h3>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Supports MP3, WAV, M4A, FLAC files
            </p>

            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={(e) => {
                e.stopPropagation();
                handleFileSelect();
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700 dark:text-red-400">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-700 dark:text-green-400">{successMessage}</span>
            </div>
          )}

          {/* File List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Selected Files ({uploadedFiles.length})
              </h4>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileAudio className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleUpload}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Process Files'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Progress */}
      {isProcessing && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {processingStages.map((stage) => (
                  <div key={stage.id} className="flex items-center space-x-2">
                    {stage.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : stage.status === 'processing' ? (
                      <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-400" />
                    )}
                    <span className={`text-sm ${stage.status === 'completed'
                        ? 'text-green-600'
                        : stage.status === 'processing'
                          ? 'text-blue-600'
                          : 'text-gray-600'
                      }`}>
                      {stage.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start space-x-2">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
              <span>Upload your 112 call recordings in supported audio formats</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
              <span>Files are automatically transcribed and translated to English</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
              <span>AI extracts key information like caller details, crime type, and location</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">4</span>
              <span>Data is processed and ready for analysis and ticket creation</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};