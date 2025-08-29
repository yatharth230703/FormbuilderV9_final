
import { useState, useEffect } from "react";
import { useFormContext } from "@/contexts/form-context";
import { DocumentUploadStep as DocumentUploadStepType } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2 } from "lucide-react";

interface DocumentUploadStepProps {
  step: DocumentUploadStepType;
}

export default function DocumentUploadStep({ step }: DocumentUploadStepProps) {
  const { updateResponse, formResponses } = useFormContext();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<string>("");
  const [startTime, setStartTime] = useState<number | null>(null);

  const currentResponse = formResponses[step.title];

  // Calculate estimated upload time based on file size
  const calculateEstimatedTime = (fileSize: number): string => {
    // Assume average upload speed of 2 Mbps (250 KB/s) for conservative estimate
    const uploadSpeedKBps = 250;
    const fileSizeKB = fileSize / 1024;
    const estimatedSeconds = fileSizeKB / uploadSpeedKBps;
    
    if (estimatedSeconds < 60) {
      return `${Math.ceil(estimatedSeconds)} seconds`;
    } else if (estimatedSeconds < 3600) {
      const minutes = Math.ceil(estimatedSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      const hours = Math.ceil(estimatedSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
  };

  // Update progress and estimated time during upload
  useEffect(() => {
    if (isUploading && startTime) {
      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min((elapsed / 10) * 100, 95); // Simulate progress over 10 seconds
        setUploadProgress(progress);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isUploading, startTime]);

  useEffect(() => {
    // Set placeholder response on mount
    if (!currentResponse) {
      const placeholderResponse = "Upload your document";
      setUploadedFile(placeholderResponse);
      updateResponse(step.title, placeholderResponse);
    } else {
      // Handle both string and object responses
      if (typeof currentResponse === 'string') {
        setUploadedFile(currentResponse);
      } else if (currentResponse && typeof currentResponse === 'object' && 'documentUrl' in currentResponse) {
        // Extract display name from document URL
        const urlParts = currentResponse.documentUrl.split('/');
        const fileNameFromUrl = urlParts[urlParts.length - 1];
        const displayName = fileNameFromUrl.replace(/^\d+_/, ''); // Remove timestamp prefix
        setUploadedFile(displayName);
      }
    }
  }, [step.title, currentResponse, updateResponse]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const uploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setStartTime(Date.now());
      
      // Calculate and display estimated time
      const estimatedTimeStr = calculateEstimatedTime(file.size);
      setEstimatedTime(estimatedTimeStr);

      const formData = new FormData();
      formData.append('document', file);

      const response = await fetch('/api/upload-document', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      // Complete the progress
      setUploadProgress(100);
      
      // Extract filename from URL for display
      const urlParts = result.documentUrl.split('/');
      const fileNameFromUrl = urlParts[urlParts.length - 1];
      const displayName = fileNameFromUrl.replace(/^\d+_/, ''); // Remove timestamp prefix
      setUploadedFile(displayName);
      
      // Store both the document URL and extracted text in the response
      updateResponse(step.title, {
        documentUrl: result.documentUrl,
        extractedText: result.extractedText || '',
        fileName: displayName
      });

    } catch (error) {
      console.error('Upload error:', error);
      setUploadedFile('Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setEstimatedTime("");
      setStartTime(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      uploadFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    const files = e.target.files;
    if (files && files[0]) {
      uploadFile(files[0]);
    }
  };

  return (
    <div className="flex-1 flex flex-col pt-2 sm:pt-2 pb-2 max-h-[90vh] max-w-full overflow-y-auto overflow-x-hidden px-4 hide-scrollbar space-y-14">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-gray-900">
          {step.title}
        </h2>
        {step.subtitle && (
          <p className="text-gray-600">
            {step.subtitle}
          </p>
        )}
      </div>

      <div className="flex justify-center mt-16">
        <div className="max-w-sm">
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept={step.config.acceptedTypes.join(",")}
            onChange={handleFileInput}
            disabled={isUploading}
          />
          
          <div className="space-y-3">
            {isUploading ? (
              <div className="space-y-4">
                <Loader2 className="h-8 w-8 text-primary mx-auto animate-spin" />
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm font-medium">Uploading document...</p>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  
                  {/* Progress percentage */}
                  <p className="text-xs text-gray-500">
                    {Math.round(uploadProgress)}% complete
                  </p>
                  
                  {/* Estimated time */}
                  {estimatedTime && (
                    <p className="text-xs text-gray-600">
                      Est. time: {estimatedTime}
                    </p>
                  )}
                </div>
              </div>
            ) : uploadedFile ? (
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <FileText className="h-6 w-6" />
                <span className="font-medium text-sm">{uploadedFile}</span>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm">
                    {step.config.labels.dragDropText}
                  </p>
                  <Button variant="outline" size="sm" type="button">
                    {step.config.labels.uploadButton}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-2">
          {step.config.labels.supportedFormats}
        </p>
        <p className="text-xs text-gray-400 text-center mt-1">
          Max: {step.config.maxFileSize}
        </p>
        </div>
      </div>
    </div>
  );
}
