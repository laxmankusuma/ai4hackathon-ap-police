import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mockProcessedData = {
    transcript: {
      telugu: "నమస్కారం, నా పేరు రమేష్. మా ఇంట్లో దొంగతనం జరిగింది.",
      english: "Hello, my name is Ramesh. There has been a theft at my house."
    },
    callerName: "Ramesh Kumar",
    phone: "+91 9876543210",
    crimeType: "Theft",
    subType: "House Breaking",
    location: {
      address: "MG Road, Visakhapatnam, Andhra Pradesh",
      coordinates: { lat: 17.6868, lng: 83.2185 }
    },
    ticketId: "T-2024-001248"
  };

  const handleFilesAdded = (files: File[]) => {
    setError('');
    const audioFiles = files.filter(file => 
      file.type.startsWith('audio/') || 
      file.name.toLowerCase().endsWith('.mp3') || 
      file.name.toLowerCase().endsWith('.wav')
    );
    
    if (audioFiles.length !== files.length) {
      setError('Some files were rejected. Only MP3 and WAV files are supported.');
    }
    
    setUploadedFiles(prev => [...prev, ...audioFiles]);
  };

  const { dragProps, isDragActive } = useDragAndDrop({
    onFilesAdded: handleFilesAdded,
    acceptedTypes: ['audio/', '.mp3', '.wav'],
    maxFileSize: 50 * 1024 * 1024 // 50MB
  });

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
    { id: 1, name: "Transcribing", status: isProcessing && uploadProgress > 25 ? "completed" : uploadProgress > 0 ? "processing" : "pending" },
    { id: 2, name: "Extracting Fields", status: isProcessing && uploadProgress > 50 ? "completed" : uploadProgress > 25 ? "processing" : "pending" },
    { id: 3, name: "Resolving Location", status: isProcessing && uploadProgress > 75 ? "completed" : uploadProgress > 50 ? "processing" : "pending" },
    { id: 4, name: "Ticket Created", status: uploadProgress === 100 ? "completed" : uploadProgress > 75 ? "processing" : "pending" }
  ];

  const handleUpload = () => {
    if (uploadedFiles.length === 0) {
      setError('Please select at least one audio file to upload.');
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);
    setError('');
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setProcessedData(mockProcessedData);
          setIsProcessing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
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
            {...dragProps}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 cursor-pointer ${
              isDragActive
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
            }`}
            onClick={handleFileSelect}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="audio/*,.mp3,.wav"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <FileAudio className={`h-12 w-12 mx-auto mb-4 transition-colors ${
              isDragActive ? 'text-blue-600' : 'text-gray-400'
            }`} />
            
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {isDragActive ? 'Drop your audio files here' : 'Drop your audio files here'}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Supports MP3, WAV files up to 50MB each
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
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button onClick={handleUpload} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Process Files'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Progress */}
      {(isProcessing || processedData) && (
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
                    ) : (
                      <Clock className="h-5 w-5 text-gray-400" />
                    )}
                    <span className={`text-sm ${
                      stage.status === 'completed' ? 'text-green-600' : 'text-gray-600'
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

      {/* Processed Data */}
      {processedData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Extracted Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Transcript (Telugu)
                </label>
                <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                  {processedData.transcript.telugu}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Transcript (English)
                </label>
                <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                  {processedData.transcript.english}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Caller Name
                  </label>
                  <p className="mt-1 font-medium">{processedData.callerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Phone Number
                  </label>
                  <p className="mt-1 font-medium">{processedData.phone}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                  Crime Classification
                </label>
                <div className="flex space-x-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    {processedData.crimeType}
                  </Badge>
                  <Badge variant="outline">
                    {processedData.subType}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Location
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{processedData.location.address}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 to-blue-900 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Lat: {processedData.location.coordinates.lat}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Lng: {processedData.location.coordinates.lng}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View JSON
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Ticket
                </Button>
                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Heatmap
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
