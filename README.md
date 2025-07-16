# FormBuilderV9: AI-Powered Form Engine



**FormBuilderV9** is a full-stack, AI-powered form engine that generates, renders, and manages dynamic multi-step forms from natural language prompts. It's built for flexibility, modularity, and a seamless user experience, supporting a wide variety of input types, conditional logic, and deep customization.

---

## Table of Contents

- [Key Features](#key-features)
- [Getting Started](#getting-started)
- [How It Works](#how-it-works)
  - [System Architecture](#1-system-architecture)
  - [Data Flow: From Prompt to Form](#2-data-flow-from-prompt-to-interactive-form)
  - [The JSON Config](#3-the-json-config)
- [Available Form Steps](#4-available-form-steps)
- [Contributing](#contributing)

---

## Key Features

-   **AI Form Generation**: Describe your form in plain English ("Create a form for event registration..."), and the AI generates a complete, multi-step form configuration.
-   **Rich Component Library**: Supports a wide variety of step types, including tiles, multi-select, sliders, location, document upload, and contact information.
-   **Dynamic Theming**: Instantly customize the look and feel, including colors, fonts, and icons. All changes are reflected in a live preview.
-   **Embeddable Forms**: Easily embed any form into your website with a simple iframe. The embedded form is fully interactive and themeable.
-   **Form Console (Conditional Logic)**: Set up "IF-THEN" rules using natural language (e.g., "IF user mentions 'brochure', THEN send them an email").
-   **Response Management**: View, manage, and analyze form responses through a dedicated dashboard.
-   **Full-Stack & Extensible**: Built with a modern React/Vite frontend and an Express/Node.js backend, making it easy to extend and customize.

---

## Getting Started

Follow these steps to get the project running locally.

### 1. Prerequisites
Ensure you have the following installed:
-   [Node.js](https://nodejs.org/) (v18 or higher)
-   `npm` or another package manager

### 2. Clone and Install
Clone the repository and install the required dependencies:
```bash
git clone https://github.com/yatharth230703/FormbuilderV9.git
cd FormbuilderV9
npm install
```

### 3. Environment Setup
The project requires several environment variables for services like Supabase, Google Gemini, and Stripe.

1.  Create a `.env` file in the root of the project.
2.  Use the `ENVIRONMENT_SETUP.md` file as a guide to fill in the necessary API keys and configuration.

### 4. Database Migration
Run the following command to sync your database schema with your Supabase instance:
```bash
npm run db:push
```

### 5. Run the Development Server
Start the development server, which includes both the frontend and backend with hot-reloading:
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

---

## How It Works

### 1. System Architecture

-   **Frontend**: React, TypeScript, Vite, TailwindCSS, and ShadCN UI for a modern and responsive user interface.
-   **Backend**: Node.js with Express, using TypeScript for type safety.
-   **Database**: PostgreSQL, managed via Supabase for storage and Drizzle ORM for schema management.
-   **Authentication**: Supabase Auth integrated with a stateful Express session system.
-   **AI Services**: Google Gemini API for generating and editing form configurations.

### 2. Data Flow: From Prompt to Interactive Form

1.  **User Input**: A user enters a natural language prompt (e.g., "A form to apply for a job").
2.  **AI Processing**: The backend sends this prompt to the Gemini API, which returns a structured JSON object that defines the entire form.
3.  **Config Storage**: This JSON configuration is saved to the database.
4.  **Dynamic Rendering**: The frontend fetches the JSON config and uses a context-driven renderer to display the appropriate components for each step, managing state, validation, and navigation.

### 3. The JSON Config

The JSON config is the heart of the form. It's a structured representation of the form's theme, steps, UI elements, and submission logic. This allows for deep customization and persistence. See `shared/types.ts` for the complete schema.

---

## 4. Available Form Steps

The engine supports a variety of step types, each designed for a specific purpose:

| Step Type          | Description                                            |
| ------------------ | ------------------------------------------------------ |
| `tiles`            | Single-choice selection with large, visual options.    |
| `multiSelect`      | Multiple-choice selection.                             |
| `slider`           | Select a numeric value from a defined range.           |
| `followup`         | Ask a conditional follow-up question based on a choice.|
| `textbox`          | Freeform text input (short or long answer).            |
| `location`         | Collect a postal code or address, with map preview.    |
| `documentUpload`   | Allow users to upload files (PDF, DOCX, etc.).         |
| `documentInfo`     | Display information extracted from an uploaded doc.    |
| `contact`          | Collect standard contact information (name, email, phone).|

---



