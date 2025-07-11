# Console Functions

This directory contains drop-in functions for the Form Console feature. These functions are designed to be modular, reusable, and conditionally executable based on AI-processed IF-THEN conditions.

## Architecture

Each console function is:
- **Drop-in replaceable**: Can be easily swapped or extended
- **Conditionally executable**: Based on AI-processed conditions from user prompts
- **Form-specific**: Uses formId to determine which forms are affected
- **Non-destructive**: Does not modify existing functionalities

## Available Functions

### 1. Auto-Select First Option (`auto-select-first-option.ts`)

**Purpose**: Automatically pre-selects options in the first slide of a form based on form config conditions.

**Trigger**: Form Config IF-THEN conditions
**Example Condition**: "If the options contain anything related to a birth certificate, that option should be pre-selected"

**Input Structure**:
```typescript
{
  formId: number;
  conditionResult: {
    "option-id-1": true,
    "option-id-2": false
  };
  formConfig: FormConfig;
}
```

**Usage**:
```typescript
import { autoSelectFirstOption } from './console-functions';

const result = autoSelectFirstOption({
  formId: 123,
  conditionResult: { "birth-certificate-option": true },
  formConfig: myFormConfig
});
```

### 2. Send Brochure (`send-brochure.ts`)

**Purpose**: Sends a brochure email when specific keywords are found in form responses.

**Trigger**: Response Config IF-THEN conditions
**Example Condition**: "If the user mentions 'insurance' in their response, send them the insurance brochure"

**Input Structure**:
```typescript
{
  formId: number;
  conditionResult: {
    "response-key-1": true,
    "response-key-2": false
  };
  formResponse: Record<string, any>;
  brochureContent: string; // HTML content
  recipientEmail: string;
  formLabel: string;
}
```

**Usage**:
```typescript
import { sendBrochure } from './console-functions';

const success = await sendBrochure({
  formId: 123,
  conditionResult: { "insurance-mention": true },
  formResponse: userResponse,
  brochureContent: "<h1>Insurance Brochure</h1><p>Content here...</p>",
  recipientEmail: "user@example.com",
  formLabel: "Insurance Inquiry Form"
});
```

## Integration Workflow

1. **User sets up IF-THEN conditions** in the Form Console frontend
2. **AI agent processes conditions** and generates JSON with exact identifiers
3. **Condition JSON is checked** against form config or response data
4. **Console functions are executed** when conditions are met
5. **Results are logged** and returned for monitoring

## AI Agent Integration

The console functions work with AI agents that:
- Process natural language IF conditions
- Generate JSON with exact option/response identifiers
- Return boolean flags for each identifier

**Example AI Processing**:
```
Input: "If the options contain anything related to a birth certificate"
Form Config: { steps: [{ options: [{ id: "birth-cert-001", title: "Birth Certificate" }] }] }
Output: { "birth-cert-001": true }
```

## Adding New Functions

To add a new console function:

1. Create a new file in this directory (e.g., `new-function.ts`)
2. Export the function and its types
3. Add the export to `index.ts`
4. Update the `CONSOLE_FUNCTIONS` registry
5. Add metadata to `getAvailableConsoleFunctions()`

## Type Safety

All functions use TypeScript interfaces for:
- Input validation
- Return type consistency
- IDE autocompletion
- Compile-time error checking

## Error Handling

Functions include comprehensive error handling:
- Input validation
- Graceful degradation
- Detailed logging
- Non-throwing failures where appropriate

## Testing

Each function includes utility functions for:
- Condition checking
- Data validation
- Mock data generation
- Unit testing support