import { useState, useEffect } from "react";
import { useFormContext } from "@/contexts/form-context";
import { ContactStep as ContactStepType } from "@shared/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface ContactStepProps {
  step: ContactStepType;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  consent?: string;
}

export default function ContactStep({ step }: ContactStepProps) {
  const { updateResponse, formResponses, formConfig, isMobile } = useFormContext();
  const [contactInfo, setContactInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    consent: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Get the current response for this step if it exists
  useEffect(() => {
    const savedResponse = formResponses[step.title];
    if (savedResponse && typeof savedResponse === "object") {
      setContactInfo({
        firstName: savedResponse.firstName || "",
        lastName: savedResponse.lastName || "",
        email: savedResponse.email || "",
        phone: savedResponse.phone || "",
        consent: savedResponse.consent || false,
      });
    }
  }, [formResponses, step.title]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (
    field: keyof typeof contactInfo,
    value: string | boolean,
  ) => {
    const newContactInfo = { ...contactInfo, [field]: value };
    setContactInfo(newContactInfo);

    // Validate fields
    const newErrors = { ...errors };

    // Clear the error for this field
    delete newErrors[field];

    // Email validation - only validate format if email is provided
    if (field === "email" && typeof value === "string" && value && !validateEmail(value)) {
      newErrors.email =
        formConfig?.ui?.messages?.enterValidEmail ||
        "Please enter a valid email address";
    }

    // Consent validation - required field
    if (field === "consent" && !value) {
      newErrors.consent = "You must agree to the data processing terms";
    }

    setErrors(newErrors);
    updateResponse(step.title, newContactInfo);
  };

  return (
    <div className="flex-1 flex flex-col pt-1 sm:pt-2 pb-2 max-h-[90vh] max-w-full overflow-y-auto overflow-x-hidden px-4 hide-scrollbar">
      <h3 className="text-2xl font-bold mb-2 text-center">{step.title}</h3>
      <p className="text-gray-500 mb-5 text-center">{step.subtitle}</p>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Form fields - left side */}
        <div className="flex-1 space-y-4">
          <div>
            <Label htmlFor="firstName" className="block text-sm font-medium mb-1">
              {step.config.labels.firstName}
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="firstName"
              type="text"
              value={contactInfo.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              placeholder={step.config.placeholders.firstName}
              className={`w-full p-3 border ${errors.firstName ? "border-red-500" : "border-gray-200"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
            )}
          </div>
          <div>
            <Label htmlFor="lastName" className="block text-sm font-medium mb-1">
              {step.config.labels.lastName}
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="lastName"
              type="text"
              value={contactInfo.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              placeholder={step.config.placeholders.lastName}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div>
            <Label htmlFor="email" className="block text-sm font-medium mb-1">
              {step.config.labels.email}
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={contactInfo.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder={step.config.placeholders.email}
              className={`w-full p-3 border ${errors.email ? "border-red-500" : "border-gray-200"} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone" className="block text-sm font-medium mb-1">
              {step.config.labels.phone}
            </Label>
            <Input
              id="phone"
              type="tel"
              value={contactInfo.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder={step.config.placeholders.phone}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox
              id="consent"
              checked={contactInfo.consent}
              onCheckedChange={(checked) => handleInputChange("consent", checked as boolean)}
              className="mt-1"
            />
            <Label htmlFor="consent" className="text-sm text-gray-600 leading-relaxed">
            I agree to be contacted in accordance with the Privacy Policy. I understand that my information will be stored for the purpose of processing my inquiry and, if necessary, shared with an authorized partner.
              <span className="text-red-500 ml-1">*</span>
            </Label>
          </div>
          {errors.consent && (
            <p className="mt-1 text-xs text-red-500">{errors.consent}</p>
          )}
        </div>

        {/* Contact information section - right side */}
        {formConfig?.ui?.contact && (
          <div className="lg:w-80 p-4 rounded-lg bg-primary/10">
            <h4 className="font-medium mb-2">{formConfig.ui.contact.title}</h4>
            <p className="text-sm text-gray-600 mb-3">
              {formConfig.ui.contact.description}
            </p>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 text-primary"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <a
                  href={`mailto:${formConfig.ui.contact.email}`}
                  className="text-primary hover:underline"
                >
                  {formConfig.ui.contact.email}
                </a>
              </div>
              <div className="flex items-center text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 text-primary"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <a
                  href={`tel:${formConfig.ui.contact.phone}`}
                  className="text-primary hover:underline"
                >
                  {formConfig.ui.contact.phone}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}