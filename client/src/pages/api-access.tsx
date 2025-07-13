import React, { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserNav } from "@/components/auth/UserNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function ApiAccessPage() {
  const [apiKey, setApiKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Dynamically get the current server origin
  const serverOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000';

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const res = await fetch("/api/dev/generate-api-key");
        const data = await res.json();
        setApiKey(data.apiKey || "");
      } catch (error) {
        console.error("Failed to load API key:", error);
      }
    };
    fetchApiKey();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast({ title: "API Key Copied" });
    setTimeout(() => setCopied(false), 2000);
  };

  const samplePrompt = "Create a feedback form for a university hackathon";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/dashboard")}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-bold">API Access</h1>
            </div>
            <UserNav />
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Your API Key</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="api-key">Use this key to authorize API requests</Label>
              <div className="flex mt-2">
                <Input
                  id="api-key"
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  readOnly
                  className="flex-1 rounded-none"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowKey(prev => !prev)}
                  className="rounded-none"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-l-none"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generate Form Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <div>
                <h3 className="font-semibold mb-2">🔧 cURL</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
{`curl -X POST http://localhost:5000/api/generate-form \\
  -H "Authorization: Bearer <your_api_key_here>" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "${samplePrompt}"}'`}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🐍 Python (requests)</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
{`import requests

headers = {
  "Authorization": "Bearer <your_api_key_here>",
  "Content-Type": "application/json"
}

response = requests.post(
  "http://localhost:5000/api/generate-form",
  headers=headers,
  json={"prompt": "${samplePrompt}"}
)

print(response.json())`}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🟦 Node.js (axios)</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
{`const axios = require("axios");

const res = await axios.post("http://localhost:5000/api/generate-form", {
  prompt: "${samplePrompt}"
}, {
  headers: {
    Authorization: "Bearer <your_api_key_here>",
    "Content-Type": "application/json"
  }
});

console.log(res.data);`}
                </pre>
              </div>
              <div className="text-xs text-gray-600">
                <b>Response:</b> Returns the form configuration as a JSON object.<br/>
                <b>Note:</b> This endpoint requires 1 credit and returns the form config, not a URL.
              </div>
            </CardContent>
          </Card>

          {/* New Endpoint: Create Form and Get URL */}
          <Card>
            <CardHeader>
              <CardTitle>Create Form and Get URL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <div>
                <h3 className="font-semibold mb-2">🔧 cURL</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
{`curl -X POST ${serverOrigin}/api/create-form-url \
  -H "Authorization: Bearer <your_api_key_here>" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a feedback form for a university hackathon"
  }'
`}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🐍 Python (requests)</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
{`import requests

headers = {
  "Authorization": "Bearer <your_api_key_here>",
  "Content-Type": "application/json"
}

payload = {
  "prompt": "Create a feedback form for a university hackathon"
}

response = requests.post(
  "${serverOrigin}/api/create-form-url",
  headers=headers,
  json=payload
)

print(response.json())  # Returns { url: ... } as a JSON object
`}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🟦 Node.js (axios)</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
{`const axios = require("axios");

const res = await axios.post("${serverOrigin}/api/create-form-url", {
  prompt: "Create a feedback form for a university hackathon"
}, {
  headers: {
    Authorization: "Bearer <your_api_key_here>",
    "Content-Type": "application/json"
  }
});

console.log(res.data); // Returns { url: ... } as a JSON object
`}
                </pre>
              </div>
                              <div className="text-xs text-gray-600">
                  <b>Response:</b> Returns <code>{`{{ url: ... }}`}</code> as a JSON object.<br/>
                  <b>Note:</b> The URL is always guaranteed to be correct and functional, as it is fetched from the stored form row.<br/>
                </div>
            </CardContent>
          </Card>

          {/* New Endpoint: Update Form Console */}
          <Card>
            <CardHeader>
              <CardTitle>Update Form Console</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <div>
                <h3 className="font-semibold mb-2">🔧 cURL</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
{`curl -X POST ${serverOrigin}/api/update-form-console \
  -H "Authorization: Bearer <your_api_key_here>" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "feedback_form",
    "language": "en",
    "domain": "mydomain",
    "form_console": {
      "enable": true,
      "formConfig": {
        "trigger": { "option": "document_translation", "slide_no": 0 },
        "last_updated": "2025-07-13T20:12:59.295Z",
        "enabled_actions": ["auto_select_first_option"]
      },
      "responseConfig": {
        "trigger": { "option": ["website_translation", "english"], "slide_no": 0 },
        "last_updated": "2025-07-13T20:12:59.295Z",
        "brochure_text": "",
        "enabled_actions": ["send_brochure"]
      }
    }
  }'
`}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🐍 Python (requests)</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
{`import requests

headers = {
  "Authorization": "Bearer <your_api_key_here>",
  "Content-Type": "application/json"
}

payload = {
  "label": "feedback_form",
  "language": "en",
  "domain": "mydomain",
  "form_console": {
    "enable": True,
    "formConfig": {
      "trigger": { "option": "document_translation", "slide_no": 0 },
      "last_updated": "2025-07-13T20:12:59.295Z",
      "enabled_actions": ["auto_select_first_option"]
    },
    "responseConfig": {
      "trigger": { "option": ["website_translation", "english"], "slide_no": 0 },
      "last_updated": "2025-07-13T20:12:59.295Z",
      "brochure_text": "",
      "enabled_actions": ["send_brochure"]
    }
  }
}

response = requests.post(
  "${serverOrigin}/api/update-form-console",
  headers=headers,
  json=payload
)

print(response.json())  # Returns { success: true } or { success: false }
`}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold mb-2">🟦 Node.js (axios)</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
{`const axios = require("axios");

const res = await axios.post("${serverOrigin}/api/update-form-console", {
  label: "feedback_form",
  language: "en",
  domain: "mydomain",
  form_console: {
    enable: true,
    formConfig: {
      trigger: { option: "document_translation", slide_no: 0 },
      last_updated: "2025-07-13T20:12:59.295Z",
      enabled_actions: ["auto_select_first_option"]
    },
    responseConfig: {
      trigger: { option: ["website_translation", "english"], slide_no: 0 },
      last_updated: "2025-07-13T20:12:59.295Z",
      brochure_text: "",
      enabled_actions: ["send_brochure"]
    }
  }
}, {
  headers: {
    Authorization: "Bearer <your_api_key_here>",
    "Content-Type": "application/json"
  }
});

console.log(res.data); // Returns { success: true } or { success: false }
`}
                </pre>
              </div>
                              <div className="text-xs text-gray-600">
                  <b>Response:</b> Returns <code>{`{{ success: true }}`}</code> on success, <code>{`{{ success: false }}`}</code> on failure (form not found or error).<br/>
                  <b>Note:</b> You can provide only the fields you want to update in <code>form_console</code>.
                </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
