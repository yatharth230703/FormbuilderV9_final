
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
  const [resolvedAddress, setResolvedAddress] = useState<string>('');
  const [locationCoords, setLocationCoords] = useState<{ lat: string; lon: string } | null>(null);
  const [showCheckmark, setShowCheckmark] = useState<boolean>(false);
  const [isMapLoading, setIsMapLoading] = useState<boolean>(false);

  useEffect(() => {
    const savedResponse = formResponses[step.title];
    if (savedResponse && typeof savedResponse === 'object') {
      if ('fullAddress' in savedResponse) {
        setAddressInput(savedResponse.fullAddress);
        setExtractedPostalCode(savedResponse.postalCode || '');
        setValidationStatus('success');
        setShowCheckmark(true);
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
    setShowCheckmark(false);
    
    // Extract postal code as user types
    const postalCode = extractPostalCode(newAddress);
    setExtractedPostalCode(postalCode);
  };

  const validateLocation = async () => {
    if (!addressInput.trim()) {
      setValidationStatus('error');
      setValidationMessage(formConfig?.ui?.messages?.thisFieldRequired || 'Please enter your complete address');
      setResolvedAddress('');
      setLocationCoords(null);
      setShowCheckmark(false);
      return;
    }

    const postalCode = extractPostalCode(addressInput);
    if (!postalCode) {
      setValidationStatus('error');
      setValidationMessage('Please include a valid postal code in your address');
      setResolvedAddress('');
      setLocationCoords(null);
      setShowCheckmark(false);
      return;
    }

    setIsValidating(true);
    setResolvedAddress('');
    setLocationCoords(null);
    setShowCheckmark(false);

    try {
      // Use backend proxy for Google Maps Geocoding API
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addressInput })
      });
      const data = await response.json();
      
      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        setValidationStatus('error');
        setValidationMessage(formConfig?.ui?.location?.notAvailable || 'Sorry, we couldn\'t find this address. Please check and try again.');
        updateResponse(step.title, {
          fullAddress: addressInput,
          postalCode: postalCode,
          isAvailable: false
        });
        setIsValidating(false);
        setResolvedAddress('');
        setLocationCoords(null);
        setShowCheckmark(false);
        return;
      }
      
      // Get the first result from Google Maps
      const result = data.results[0];
      setResolvedAddress(result.formatted_address);
      setLocationCoords({ 
        lat: result.geometry.location.lat.toString(), 
        lon: result.geometry.location.lng.toString() 
      });
    } catch (e) {
      setValidationStatus('error');
      setValidationMessage('Error validating address. Please try again.');
      setIsValidating(false);
      setResolvedAddress('');
      setLocationCoords(null);
      setShowCheckmark(false);
      return;
    }

    setValidationStatus('success');
    setShowCheckmark(true);
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

  const handleMapLoad = () => {
    setIsMapLoading(false);
  };

  const handleMapError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsMapLoading(false);
    e.currentTarget.style.display = 'none';
  };

  // Set map loading to true when coordinates are set
  useEffect(() => {
    if (locationCoords) {
      setIsMapLoading(true);
    }
  }, [locationCoords]);

  return (
    <div className="flex-1 flex flex-col pt-1 sm:pt-2 pb-2 max-w-full px-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-4"
      >
        <h3 className="text-2xl font-bold mb-2 text-center">{step.title}</h3>
        <p className="text-gray-500 mb-4 text-center">{step.subtitle}</p>
      </motion.div>

      <motion.div 
        className="w-full mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="relative">
          <Input 
            type="text" 
            value={addressInput}
            onChange={handleAddressInputChange}
            className="w-full p-4 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Please enter pincode"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                validateLocation();
              }
            }}
          />
          {/* Check icon for valid postal code - only show after successful validation */}
          {showCheckmark && validationStatus === 'success' && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
              <CheckCircle className="h-5 w-5" />
            </div>
          )}

        </div>


        <AnimatePresence mode="wait">
          {validationStatus === 'error' && (
            <motion.div 
              key={validationStatus}
              initial={{ opacity: 0, height: 0, y: 10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 p-3 rounded-lg flex items-start bg-red-50 text-red-700"
            >
              <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
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
            className="mt-4 flex flex-col items-center justify-center"
          >
            {/* Show static map if coordinates are available */}
            {locationCoords && (
              <div className="w-full max-w-4xl relative">
                {/* Map Loading Skeleton */}
                <AnimatePresence>
                  {isMapLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center"
                      style={{ height: '280px' }}
                    >
                      <div className="flex flex-col items-center space-y-3">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        <p className="text-sm text-gray-500">Loading map...</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <img
                  src={`/api/staticmap?center=${locationCoords.lat},${locationCoords.lon}&zoom=14&size=800x400&markers=color:red%7C${locationCoords.lat},${locationCoords.lon}`}
                  alt="Location Map"
                  className="w-full h-auto rounded-lg shadow-lg border border-gray-200"
                  style={{ maxHeight: '280px', objectFit: 'cover' }}
                  onLoad={handleMapLoad}
                  onError={handleMapError}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      {!validationStatus && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-6 text-center text-sm text-gray-500 space-y-2"
        >
          <p className="font-medium">Please enter your pincode</p>
        </motion.div>
      )}
    </div>
  );
}
