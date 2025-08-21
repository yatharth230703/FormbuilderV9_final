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
                  <h3 className="font-semibold mb-2">🔧 cURL</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
{`curl -X POST ${serverOrigin}/api/create-form-url \\
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
  "${serverOrigin}/api/create-form-url",
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

const res = await axios.post("${serverOrigin}/api/create-form-url", {
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
                  <b>Response:</b> Returns a JSON object with the form URL and configuration.<br/>
                  <b>Note:</b> This endpoint requires 1 credit and creates a form with a random domain, returning the URL where the form can be accessed.
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
                    <li>400: Invalid request format</li>
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
