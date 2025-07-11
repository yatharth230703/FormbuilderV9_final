
import { useState, useEffect } from "react";
import { useFormContext } from "@/contexts/form-context";
import { DocumentUploadStep as DocumentUploadStepType } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";

interface DocumentUploadStepProps {
  step: DocumentUploadStepType;
}

export default function DocumentUploadStep({ step }: DocumentUploadStepProps) {
  const { updateResponse, formResponses } = useFormContext();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const currentResponse = formResponses[step.title];

  useEffect(() => {
    // Set placeholder response on mount
    if (!currentResponse) {
      const placeholderResponse = "document.txt";
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
    <div className="space-y-4">
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

      <div className="max-w-sm mx-auto">
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
          />
          
          <div className="space-y-3">
            {uploadedFile ? (
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
  );
}
