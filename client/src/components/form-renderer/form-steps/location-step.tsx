
import { useState, useEffect } from "react";
import { useFormContext } from "@/contexts/form-context";
import { LocationStep as LocationStepType } from "@shared/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LocationStepProps {
  step: LocationStepType;
}

export default function LocationStep({ step }: LocationStepProps) {
  const { updateResponse, formResponses, formConfig } = useFormContext();
  const [addressInput, setAddressInput] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationStatus, setValidationStatus] = useState<'success' | 'error' | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [extractedPostalCode, setExtractedPostalCode] = useState<string>('');

  useEffect(() => {
    const savedResponse = formResponses[step.title];
    if (savedResponse && typeof savedResponse === 'object') {
      if ('fullAddress' in savedResponse) {
        setAddressInput(savedResponse.fullAddress);
        setExtractedPostalCode(savedResponse.postalCode || '');
        setValidationStatus('success');
        if (savedResponse.isAvailable) {
          setValidationMessage(
            formConfig?.ui?.location?.availableIn?.replace('{city}', savedResponse.postalCode) || 
            `Our service is available in ${savedResponse.postalCode}!`
          );
        } else {
          setValidationMessage(
            formConfig?.ui?.location?.notAvailable || 
            'Sorry, we don\'t serve this area yet'
          );
        }
      }
    }
  }, [formResponses, step.title, formConfig]);

  const extractPostalCode = (address: string): string => {
    // Extract postal code patterns (handles various formats)
    const patterns = [
      /\b\d{6}\b/g, // 6-digit postal code (India)
      /\b\d{5}(?:-\d{4})?\b/g, // US ZIP codes
      /\b[A-Z]\d[A-Z] ?\d[A-Z]\d\b/g, // Canadian postal codes
      /\b[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}\b/g, // UK postal codes
    ];
    
    for (const pattern of patterns) {
      const matches = address.match(pattern);
      if (matches && matches.length > 0) {
        return matches[matches.length - 1].replace(/\s/g, ''); // Return last match, remove spaces
      }
    }
    return '';
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setAddressInput(newAddress);
    setValidationStatus(null);
    setValidationMessage(null);
    
    // Extract postal code as user types
    const postalCode = extractPostalCode(newAddress);
    setExtractedPostalCode(postalCode);
  };

  const validateLocation = async () => {
    if (!addressInput.trim()) {
      setValidationStatus('error');
      setValidationMessage(formConfig?.ui?.messages?.thisFieldRequired || 'Please enter your complete address');
      return;
    }

    const postalCode = extractPostalCode(addressInput);
    if (!postalCode) {
      setValidationStatus('error');
      setValidationMessage('Please include a valid postal code in your address');
      return;
    }

    setIsValidating(true);

    // Validate postal code using Nominatim API
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&postalcode=${encodeURIComponent(postalCode)}`);
      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        setValidationStatus('error');
        setValidationMessage(formConfig?.ui?.location?.notAvailable || 'Sorry, we don\'t serve this area yet. Please check your postal code.');
        updateResponse(step.title, {
          fullAddress: addressInput,
          postalCode: postalCode,
          isAvailable: false
        });
        setIsValidating(false);
        return;
      }
    } catch (e) {
      setValidationStatus('error');
      setValidationMessage('Error validating postal code. Please try again.');
      setIsValidating(false);
      return;
    }

    setValidationStatus('success');
    setValidationMessage(
      formConfig?.ui?.location?.availableIn?.replace('{city}', postalCode) || 
      `Our service is available in ${postalCode}!`
    );
    updateResponse(step.title, {
      fullAddress: addressInput,
      postalCode: postalCode,
      isAvailable: true
    });
    setIsValidating(false);
  };

  return (
    <div className="flex-1 flex flex-col py-2 sm:py-2 max-h-[90vh] max-w-full overflow-y-auto overflow-x-hidden px-4 hide-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h3 className="text-2xl font-bold mb-2 text-center">{step.title}</h3>
        <p className="text-gray-500 mb-5 text-center">{step.subtitle}</p>
      </motion.div>

      <motion.div 
        className="w-full mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="relative">
          <Input 
            type="text" 
            value={addressInput}
            onChange={handleAddressInputChange}
            className="w-full p-4 pr-12 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="123 Main Street, City, State, 12345"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                validateLocation();
              }
            }}
          />
          <Button 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary p-1"
            variant="ghost"
            size="sm"
            onClick={validateLocation}
            disabled={isValidating}
          >
            {isValidating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Show extracted postal code if found */}
        {extractedPostalCode && !validationStatus && (
          <div className="mt-2 text-sm text-gray-600">
            Postal Code detected: <span className="font-medium">{extractedPostalCode}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {validationStatus && (
            <motion.div 
              key={validationStatus}
              initial={{ opacity: 0, height: 0, y: 10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`mt-3 p-3 rounded-lg flex items-start ${
                validationStatus === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {validationStatus === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              ) : (
                <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              )}
              <span className="text-sm">{validationMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Location visual */}
      <AnimatePresence>
        {validationStatus === 'success' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="mt-6 flex items-center justify-center"
          >
            <div className="flex items-center bg-primary/10 p-6 rounded-xl shadow-sm w-full max-w-md">
            <div className="bg-primary text-white p-4 rounded-full mr-6 flex items-center justify-center">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-primary mb-1">Location Confirmed</h4>
              <p className="text-sm text-gray-600">{addressInput}</p>
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      {!validationStatus && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 text-center text-sm text-gray-500 space-y-2"
        >
          <p className="font-medium">Please enter your complete address including:</p>
          <div className="text-xs space-y-1">
            <p>• Street number and name</p>
            <p>• City or town</p>
            <p>• State or province</p>
            <p>• Postal code (required for service verification)</p>
          </div>
          <p className="mt-3 text-xs italic">Example: 123 Main Street, Springfield, IL, 62701</p>
        </motion.div>
      )}
    </div>
  );
}
