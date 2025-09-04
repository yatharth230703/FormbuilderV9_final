import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserNav } from "@/components/auth/UserNav";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Webhook } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function RouteResponsePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch current webhook URL on component mount
  useEffect(() => {
    const fetchWebhookUrl = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const response = await apiRequest({
          url: "/api/user/webhook",
          method: "GET",
        });
        
        if (response && response.webhookUrl) {
          setWebhookUrl(response.webhookUrl);
        }
      } catch (error) {
        console.error("Error fetching webhook URL:", error);
        // Don't show error toast for fetch, just log it
      } finally {
        setIsLoading(false);
      }
    };

    fetchWebhookUrl();
  }, [user?.id]);

  const handleSaveWebhook = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await apiRequest({
        url: "/api/user/webhook",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl }),
      });

      toast({
        title: "Success",
        description: "Webhook URL saved successfully",
      });
    } catch (error) {
      console.error("Error saving webhook URL:", error);
      toast({
        title: "Error",
        description: "Failed to save webhook URL",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL first",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await apiRequest({
        url: "/api/user/webhook/test",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrl }),
      });

      toast({
        title: "Success",
        description: "Test webhook sent successfully",
      });
    } catch (error) {
      console.error("Error testing webhook:", error);
      toast({
        title: "Error",
        description: "Failed to send test webhook",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/dashboard")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold">Route Response</h1>
            </div>
            <div className="flex gap-3 items-center">
              <CreditsDisplay />
              <UserNav />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  CRM Webhook Configuration
                </CardTitle>
                <CardDescription>
                  Configure your CRM webhook URL to receive form responses automatically. 
                  Every form submission will be sent to this URL as a POST request.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    type="url"
                    placeholder="https://your-crm.com/webhook/endpoint"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-sm text-gray-500">
                    Enter the full URL where you want to receive form responses
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSaveWebhook}
                    disabled={isSaving || isLoading}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Webhook"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleTestWebhook}
                    disabled={isSaving || isLoading || !webhookUrl}
                  >
                    Test Webhook
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Every form submission will be sent to your webhook URL</li>
                    <li>• The payload includes all form responses and metadata</li>
                    <li>• Webhook calls are made asynchronously (won't slow down form submission)</li>
                    <li>• Both complete and incomplete form responses are sent</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
