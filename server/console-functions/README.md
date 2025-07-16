# Form Console Functions

## High-Level Overview

The Form Console is an advanced feature that allows for the creation of dynamic, conditional logic within forms without writing any code. It uses an AI agent to translate natural language "IF-THEN" rules, specified by the user, into executable functions that react to form configurations or user responses.

For example, a user can define a rule like: *"**IF** a user selects the 'I need a brochure' option, **THEN** send them the 'Company Brochure' email."*

The system then automates the process of executing the "send email" action when the condition is met.

---

## Architecture

The system is built on a modular architecture where each piece of conditional logic is a "Console Function."

-   **AI-Powered Conditions**: An AI agent (e.g., Gemini) is responsible for interpreting the user's natural language `IF` condition and translating it into a structured JSON object that the system can understand.
-   **Modular Functions**: Each `THEN` action is a self-contained TypeScript function (e.g., `sendBrochure`, `autoSelectFirstOption`).
-   **Conditional Execution**: A central `executor` determines which Console Function to run based on the AI-processed conditions and the trigger (either a form's initial configuration or a user's response).
-   **Type-Safe**: The entire process is strongly typed with Zod schemas and TypeScript to ensure data integrity.

---

## How it Works: Step-by-Step

1.  **User Defines a Rule**: In the Form Console UI, a user creates a rule.
    -   **Trigger**: They select when the rule should run (`On Form Load` or `On Form Submission`).
    -   **IF Condition**: They write a natural language condition (e.g., "the user's response contains the word 'urgent'").
    -   **THEN Action**: They select a pre-defined action from a dropdown (e.g., "Send Brochure").

2.  **AI Processes the `IF` Condition**: The natural language condition is sent to an AI model, which identifies the key elements and maps them to the specific IDs within the form's configuration or response data.

    *AI Processing Example:*
    -   **User Input**: "If the user selects the 'Birth Certificate' option."
    -   **Form Config Context**: The AI is given the form's structure, which includes `options: [{ id: "option_bc_123", title: "Birth Certificate" }]`.
    -   **AI JSON Output**: `{ "option_bc_123": true }`.

3.  **Executor Runs the `THEN` Action**:
    -   When the trigger event occurs (e.g., a form is submitted), the `executor` checks the AI-generated JSON against the actual data.
    -   If the condition is met (e.g., the user's response *does* contain the key `"option_bc_123": true`), the executor calls the corresponding Console Function (`autoSelectFirstOption` in this case).

---

## Available Functions

### 1. `autoSelectFirstOption`
-   **Description**: Automatically pre-selects an option in a form's first step.
-   **Trigger**: `On Form Load`.
-   **Use Case**: Guiding a user into a specific path from the beginning based on URL parameters or other initial data.

### 2. `sendBrochure`
-   **Description**: Sends a pre-configured email to the user who submitted the form.
-   **Trigger**: `On Form Submission`.
-   **Use Case**: Sending follow-up materials, like a brochure or confirmation, based on the user's answers.

---

## How to Add a New Console Function

Follow these steps to create a new custom action.

### 1. Create the Function File
Create a new file in this directory (e.g., `myNewFunction.ts`). The function should accept a single object with the necessary data and return a result.

```typescript
// server/console-functions/myNewFunction.ts
import { z } from 'zod';

export const myNewFunctionPayloadSchema = z.object({
  formId: z.number(),
  someData: z.string(),
});

export type MyNewFunctionPayload = z.infer<typeof myNewFunctionPayloadSchema>;

export async function myNewFunction(payload: MyNewFunctionPayload) {
  // Your logic here
  console.log(`Running on form ${payload.formId} with data: ${payload.someData}`);
  return { success: true, message: "New function executed." };
}
```

### 2. Update the Index and Registry
1.  **Export from `index.ts`**: Add a line to `server/console-functions/index.ts` to export your new function and its schema.
    ```typescript
    export * from './myNewFunction';
    ```
2.  **Register in `executor.ts`**: Add your function to the `CONSOLE_FUNCTIONS` registry in `server/console-functions/executor.ts`. This makes the system aware of your function.
    ```typescript
    const CONSOLE_FUNCTIONS = {
      // ... other functions
      myNewFunction: {
        payloadSchema: myNewFunctionPayloadSchema,
        execute: myNewFunction,
      },
    };
    ```

### 3. Add Metadata for the Frontend
In `server/routes.ts`, update the `/api/console/functions` endpoint to include metadata for your new function. This allows it to be selected in the UI.

```typescript
// In server/routes.ts, inside the endpoint logic
const availableFunctions = [
  // ... other functions
  {
    id: 'myNewFunction',
    name: 'My New Awesome Function',
    description: 'This is what my new function does.',
    trigger: 'On Form Submission', // or 'On Form Load'
    payloadSchema: zodToJsonSchema(myNewFunctionPayloadSchema),
  },
];
```

By following these steps, your new function will be fully integrated into the Form Console system.
