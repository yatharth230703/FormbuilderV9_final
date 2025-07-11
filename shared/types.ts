export interface FormConfig {
  theme: {
    colors: {
      text: {
        dark: string;
        light: string;
        muted: string;
      };
      primary: string;
      background: {
        light: string;
        white: string;
      };
    };
  };
  steps: FormStep[];
  ui?: {
    buttons: {
      next: string;
      skip: string;
      submit: string;
      startOver: string;
      submitting: string;
      check: string;
      checking: string;
    };
    messages: {
      optional: string;
      required: string;
      invalidEmail: string;
      submitError: string;
      thankYou: string;
      submitAnother: string;
      multiSelectHint: string;
      loadError: string;
      thisFieldRequired: string;
      enterValidEmail: string;
    };
    location?: {
      availableIn: string;
      notAvailable: string;
      addressNotFound: string;
      invalidCity: string;
      searchError: string;
      searchPlaceholder: string;
    };
    contact?: {
      title: string;
      description: string;
      email: string;
      phone: string;
    };
  };
  submission?: {
    title: string;
    description: string;
    steps: {
      title: string;
      description: string;
    }[];
  };
}

export type StepType = 'tiles' | 'multiSelect' | 'slider' | 'followup' | 'textbox' | 'location' | 'contact';

export interface BaseFormStep {
  type: StepType;
  title: string;
  subtitle: string;
}

export interface TilesStep extends BaseFormStep {
  type: 'tiles';
  options: {
    id: string;
    title: string;
    description: string;
    icon: string;
    preselected?: boolean;
    selected?: boolean;
  }[];
}

export interface MultiSelectStep extends BaseFormStep {
  type: 'multiSelect';
  options: {
    id: string;
    title: string;
    description: string;
    icon: string;
  }[];
}

export interface SliderStep extends BaseFormStep {
  type: 'slider';
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  prefix?: string;
}

export interface FollowupStep extends BaseFormStep {
  type: 'followup';
  options: {
    id: string;
    title: string;
    description: string;
    icon: string;
  }[];
  followupInput: {
    type: 'text' | 'number';
    label: string;
    min?: number;
    max?: number;
    placeholder?: string;
  };
}

export interface TextboxStep extends BaseFormStep {
  type: 'textbox';
  placeholder: string;
  rows: number;
  validation?: {
    required: boolean;
    minLength?: number;
  };
}

export interface LocationStep extends BaseFormStep {
  type: 'location';
  config: {
    labels: {
      searchPlaceholder: string;
    };
  };
  validation?: {
    required: boolean;
  };
}

export interface ContactStep extends BaseFormStep {
  type: 'contact';
  config: {
    labels: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    placeholders: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
  };
}

export interface DocumentUploadStep extends BaseFormStep {
  type: 'documentUpload';
  config: {
    acceptedTypes: string[];
    maxFileSize: string;
    labels: {
      uploadButton: string;
      dragDropText: string;
      supportedFormats: string;
    };
  };
  validation?: {
    required: boolean;
  };
}

export interface DocumentInfoStep extends BaseFormStep {
  type: 'documentInfo';
  config: {
    displayMode: string;
    maxHeight: string;
    labels: {
      loadingText: string;
      errorText: string;
    };
  };
}

export type FormStep = 
  | TilesStep 
  | MultiSelectStep 
  | SliderStep 
  | FollowupStep 
  | TextboxStep 
  | LocationStep 
  | ContactStep
  | DocumentUploadStep
  | DocumentInfoStep;

export interface FormResponse {
  [key: string]: any;
}

export interface PromptRequest {
  prompt: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  token?: string;
}

export interface AdminSessionData {
  email: string;
  isAdmin: boolean;
}

// Console Functions Types
export interface ConsoleFunction {
  name: string;
  description: string;
  type: 'form-config' | 'response-config' | 'document';
  enabled: boolean;
  category: 'submission' | 'response' | 'automation';
}

export interface ConsoleFunctionCondition {
  id: string;
  type: 'form-config' | 'response-config' | 'document';
  prompt: string;
  processedCondition: Record<string, any>;
  enabled: boolean;
  formId: number;
}

export interface ConsoleFunctionResult {
  success: boolean;
  message?: string;
  data?: any;
  functionName: string;
  formId: number;
}
