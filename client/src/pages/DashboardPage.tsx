import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UserNav } from "@/components/auth/UserNav";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { FormPropertiesDropdown } from "@/components/FormPropertiesDropdown";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Trash, Shield } from "lucide-react";
import { useLocation } from "wouter";

interface FormItem {
  id: number;
  label: string;
  createdAt: string;
  config: any;
  language?: string;
  domain?: string;
}

// Helper to format label
function formatLabel(label: string) {
  const match = label.match(/^(.*)_(\d+)$/);
  if (match) {
    const firstTitle = match[1].replace(/_/g, " ");
    const id = match[2];
    // Capitalize each word
    const prettyTitle = firstTitle.replace(/\b\w/g, (c) => c.toUpperCase());
    return `${prettyTitle} (${id})`;
  }
  return label;
}

export function DashboardPage() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const [forms, setForms] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingFormId, setDeletingFormId] = useState<number | null>(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [privacyPolicyLink, setPrivacyPolicyLink] = useState("");
  const [savingPrivacyPolicy, setSavingPrivacyPolicy] = useState(false);

  // Fetch user's forms and privacy policy link
  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/forms");
        const data = await response.json();

        // Format the data
        const formattedForms = data.map((form: any) => ({
          id: form.id,
          label: form.label || "Untitled Form",
          createdAt: new Date(form.created_at).toLocaleDateString(),
          config: form.config,
          language: form.language || "en",
          domain: form.domain || "",
        }));

        setForms(formattedForms);
        setError(null);
      } catch (err) {
        console.error("Error fetching forms:", err);
        setError("Failed to load your forms. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const fetchPrivacyPolicy = async () => {
      try {
        const response = await fetch("/api/user/privacy-policy");
        if (response.ok) {
          const data = await response.json();
          setPrivacyPolicyLink(data.privacyPolicyLink || "");
        }
      } catch (err) {
        console.error("Error fetching privacy policy:", err);
      }
    };

    if (user) {
      fetchForms();
      fetchPrivacyPolicy();
    }
  }, [user]);

  // Delete handler
  const handleDeleteForm = async (formId: number) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this form ?The responses will be deleted along with it and this action cannot be undone.",
      )
    ) {
      return;
    }
    setDeletingFormId(formId);
    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete form");
      }
      setForms((prev) => prev.filter((f) => f.id !== formId));
    } catch (err) {
      alert("Failed to delete form. Please try again.");
    } finally {
      setDeletingFormId(null);
    }
  };

  // Save privacy policy handler
  const handleSavePrivacyPolicy = async () => {
    if (!privacyPolicyLink.trim()) {
      return;
    }

    // Basic URL validation
    try {
      new URL(privacyPolicyLink);
    } catch {
      return;
    }

    setSavingPrivacyPolicy(true);
    try {
      const response = await fetch("/api/user/privacy-policy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ privacyPolicyLink }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save privacy policy link");
      }

      setShowPrivacyModal(false);
    } catch (err) {
      console.error("Error saving privacy policy:", err);
    } finally {
      setSavingPrivacyPolicy(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-xl font-bold">Form Builder</h1>
            <div className="flex gap-3 items-center">
              <CreditsDisplay />
              <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
                <DialogTrigger asChild>
                  <Button variant="secondary">
                    <Shield className="mr-2 h-4 w-4" />
                    Privacy Policy
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Privacy Policy Settings</DialogTitle>
                    <DialogDescription>
                      Add your privacy policy link. This will be displayed as a hyperlink in your contact forms.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="privacy-link" className="text-right">
                        Link
                      </Label>
                      <Input
                        id="privacy-link"
                        value={privacyPolicyLink}
                        onChange={(e) => setPrivacyPolicyLink(e.target.value)}
                        placeholder="https://example.com/privacy-policy"
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      onClick={handleSavePrivacyPolicy}
                      disabled={savingPrivacyPolicy}
                    >
                      {savingPrivacyPolicy ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button
                variant="secondary"
                onClick={() => setLocation("/route-response")}
              >
                Route Response
              </Button>
              <Button
                variant="secondary"
                onClick={() => setLocation("/api-access")}
              >
                Try our API
              </Button>
              <UserNav />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">My Forms</h2>
              <p className="text-gray-600">
                {forms.length > 0
                  ? `You have ${forms.length} form${forms.length === 1 ? "" : "s"}`
                  : "Create your first form to get started"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setLocation("/form-console")}
              >
                Form Console
              </Button>
              <Button onClick={() => setLocation("/buildform")}>
                <Plus className="mr-2 h-4 w-4" />
                New Form
              </Button>
            </div>
          </div>

          {/* Form list */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="col-span-full py-8 text-center">
                <p className="text-red-500">{error}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            ) : forms.length === 0 ? (
              <div className="col-span-full py-12 text-center">
                <p className="text-gray-500 mb-4">
                  You haven't created any forms yet
                </p>
                <Button onClick={() => setLocation("/buildform")}>
                  Create your first form
                </Button>
              </div>
            ) : (
              forms.map((form) => (
                <Card
                  key={form.id}
                  className="hover:shadow-md transition-shadow relative"
                >
                  {/* Settings dropdown at top right */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <FormPropertiesDropdown
                      formId={form.id}
                      currentLabel={form.label}
                      currentLanguage={form.language}
                      currentDomain={form.domain}
                      onUpdate={() => {
                        // Refresh forms after update
                        const fetchForms = async () => {
                          try {
                            const response = await fetch("/api/forms");
                            const data = await response.json();
                            const formattedForms = data.map((form: any) => ({
                              id: form.id,
                              label: form.label || "Untitled Form",
                              createdAt: new Date(form.created_at).toLocaleDateString(),
                              config: form.config,
                              language: form.language || "en",
                              domain: form.domain || "",
                            }));
                            setForms(formattedForms);
                          } catch (err) {
                            console.error("Error refreshing forms:", err);
                          }
                        };
                        fetchForms();
                      }}
                    />
                    <button
                      className="p-2 rounded hover:bg-red-100 text-red-600"
                      title="Delete form"
                      onClick={() => handleDeleteForm(form.id)}
                      disabled={deletingFormId === form.id}
                    >
                      {deletingFormId === form.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      {formatLabel(form.label)}
                    </CardTitle>
                    <CardDescription>
                      Created on {form.createdAt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setLocation(`/edit/${form.id}`);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setLocation(`/forms/${form.id}/responses`)
                        }
                      >
                        Responses
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/forms/${form.id}/preview`)}
                      >
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
