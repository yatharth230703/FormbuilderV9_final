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
  const serverOrigin = typeof window !== 'undefined' ? window.location.origin : '';

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
        <div className="bg-white border-b">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/dashboard")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
                <h1 className="text-2xl font-bold text-gray-900">API Access</h1>
              </div>
              <UserNav />
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* API Key Section */}
            <Card>
              <CardHeader>
                <CardTitle>Your API Key</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      id="apiKey"
                      type={showKey ? "text" : "password"}
                      value={apiKey}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                      disabled={!apiKey}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Use this API key to authenticate your requests. Keep it secure and don't share it publicly.
                </p>
              </CardContent>
            </Card>

            {/* Form Generation Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Generate Form Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm">
                <div>
                  <h3 className="font-semibold mb-2">🔧 cURL</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
{`curl -X POST ${serverOrigin}/api/generate-form \\
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
  "${serverOrigin}/api/generate-form",
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

const res = await axios.post("${serverOrigin}/api/generate-form", {
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

            {/* Create Form and Get URL */}
            <Card>
              <CardHeader>
                <CardTitle>Create Form and Get URL</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm">
                <div>
                  <h3 className="font-semibold mb-2">🔧 cURL (Basic)</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
{`curl -X POST ${serverOrigin}/api/create-form-url \\
  -H "Authorization: Bearer <your_api_key_here>" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "${samplePrompt}"}'`}
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">🔧 cURL (With Custom Properties)</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
{`curl -X POST ${serverOrigin}/api/create-form-url \\
  -H "Authorization: Bearer <your_api_key_here>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "${samplePrompt}",
    "domain": "my_custom_domain",
    "label": "feedback_form_v1",
    "language": "en",
    "icon_mode": "emoji",
    "color": "#FF5733"
  }'`}
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

# Basic request
response = requests.post(
  "${serverOrigin}/api/create-form-url",
  headers=headers,
  json={"prompt": "${samplePrompt}"}
)

# Request with custom properties
response = requests.post(
  "${serverOrigin}/api/create-form-url",
  headers=headers,
  json={
    "prompt": "${samplePrompt}",
    "domain": "my_custom_domain",
    "label": "feedback_form_v1", 
    "language": "en",
    "icon_mode": "emoji",
    "color": "#FF5733"
  }
)

print(response.json())`}
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">🟦 Node.js (axios)</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
{`const axios = require("axios");

// Basic request
const res = await axios.post("${serverOrigin}/api/create-form-url", {
  prompt: "${samplePrompt}"
}, {
  headers: {
    Authorization: "Bearer <your_api_key_here>",
    "Content-Type": "application/json"
  }
});

// Request with custom properties
const customRes = await axios.post("${serverOrigin}/api/create-form-url", {
  prompt: "${samplePrompt}",
  domain: "my_custom_domain",
  label: "feedback_form_v1",
  language: "en", 
  icon_mode: "emoji",
  color: "#FF5733"
}, {
  headers: {
    Authorization: "Bearer <your_api_key_here>",
    "Content-Type": "application/json"
  }
});

console.log(customRes.data);`}
                  </pre>
                </div>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">📋 Request Parameters</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 mt-2">
                      <li><strong>prompt</strong> (required): Description of the form to create</li>
                      <li><strong>domain</strong> (optional): Custom domain identifier. Random if not provided</li>
                      <li><strong>label</strong> (optional): Custom form label. Generated from form title if not provided</li>
                      <li><strong>language</strong> (optional): Form language. Options: <code className="bg-gray-100 px-1 rounded">'en'</code> or <code className="bg-gray-100 px-1 rounded">'de'</code>. Defaults to 'en'</li>
                      <li><strong>icon_mode</strong> (optional): Icon style for form elements. Options: <code className="bg-gray-100 px-1 rounded">'lucide'</code> (line icons), <code className="bg-gray-100 px-1 rounded">'emoji'</code> (emoji icons), or <code className="bg-gray-100 px-1 rounded">'none'</code> (no icons). Defaults to 'lucide'</li>
                      <li><strong>color</strong> (optional): The primary color for the form in hex format (e.g., <code className="bg-gray-100 px-1 rounded">'#FF5733'</code>). This color will be used for buttons, highlights, and other UI elements. Defaults to green (<code className="bg-gray-100 px-1 rounded">'#10b981'</code>) if not specified.</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">📤 Response Format</h4>
                    <pre className="bg-gray-50 p-3 rounded text-xs">
{`{
  "url": "https://app.com/embed?language=en&label=feedback_form_v1&domain=my_custom_domain",
  "formId": 123,
  "language": "en", 
  "label": "feedback_form_v1",
  "domain": "my_custom_domain",
  "iconMode": "emoji",
  "color": "#FF5733"
}`}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-600">🎨 Icon Mode Options</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 mt-2">
                      <li><code className="bg-blue-50 px-2 py-1 rounded text-blue-800">'lucide'</code> - Modern line icons (default)</li>
                      <li><code className="bg-yellow-50 px-2 py-1 rounded text-yellow-800">'emoji'</code> - Colorful emoji icons</li>
                      <li><code className="bg-gray-50 px-2 py-1 rounded text-gray-800">'none'</code> - No icons, text only</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-600">🎨 Color Options</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 mt-2">
                      <li>Specify any valid hex color code (e.g., <code className="bg-red-50 px-2 py-1 rounded text-red-800">'#FF5733'</code>, <code className="bg-blue-50 px-2 py-1 rounded text-blue-800">'#3498DB'</code>)</li>
                      <li>The color will be used for buttons, highlights, and other UI elements</li>
                      <li>If not specified, defaults to green (<code className="bg-green-50 px-2 py-1 rounded text-green-800">'#10b981'</code>)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-600">⚠️ Important Notes</h4>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 mt-2">
                      <li>The combination of <strong>language</strong>, <strong>label</strong>, and <strong>domain</strong> must be unique</li>
                      <li>If a duplicate combination is provided, you'll receive a <strong>409 Conflict</strong> error</li>
                      <li>This endpoint requires 1 credit and creates a form, returning the URL and metadata</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Usage Information */}
            <Card>
              <CardHeader>
                <CardTitle>API Usage & Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-2">
                  <h3 className="font-semibold">📊 Rate Limits</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Each form generation costs 1 credit</li>
                    <li>Ensure you have sufficient credits before making requests</li>
                    <li>API key must be included in Authorization header</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold">🔑 Authentication</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Include your API key in the Authorization header</li>
                    <li>Format: <code className="bg-gray-100 px-1 rounded">Bearer YOUR_API_KEY</code></li>
                    <li>Keep your API key secure and don't share it publicly</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">📝 Request Format</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Content-Type must be application/json</li>
                    <li>Request body must contain a "prompt" field</li>
                    <li>Prompt should describe the form you want to create</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">🚨 Error Handling</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>401: Invalid or missing API key</li>
                    <li>402: Insufficient credits</li>
                    <li>400: Invalid request format or invalid parameter values</li>
                    <li>409: Duplicate combination of language, label, and domain</li>
                    <li>500: Server error during form generation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
