import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAdmin } from "@/contexts/admin-context";
import { getFormResponses, getAdminForms, getFormResponsesByLabel } from "@/services/admin-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function AdminDashboard() {
  const { isAuthenticated, isLoading: authLoading, admin, logout } = useAdmin();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  // Fetch all forms
  const {
    data: formsData,
    isLoading: isFormsLoading,
    error: formsError
  } = useQuery({
    queryKey: ['/api/admin/forms'],
    queryFn: getAdminForms,
    enabled: isAuthenticated,
  });

  // Fetch all responses
  const {
    data: responsesData,
    isLoading: isResponsesLoading,
    error: responsesError
  } = useQuery({
    queryKey: ['/api/admin/responses'],
    queryFn: getFormResponses,
    enabled: isAuthenticated,
  });

  // Fetch responses for a specific form
  const {
    data: specificResponsesData,
    isLoading: isSpecificResponsesLoading,
    error: specificResponsesError,
    refetch: refetchSpecificResponses
  } = useQuery({
    queryKey: ['/api/admin/responses', selectedLabel],
    queryFn: () => selectedLabel ? getFormResponsesByLabel(selectedLabel) : null,
    enabled: isAuthenticated && !!selectedLabel,
  });

  const handleLogout = async () => {
    await logout();
    setLocation("/admin/login");
  };

  const viewFormResponses = (label: string) => {
    console.log(`Viewing responses for label: ${label}`);
    setSelectedLabel(label);
    
    // When clicked from the Form Configurations tab, this ensures we show the Responses tab
    const responsesTab = document.querySelector('[data-value="responses"]') as HTMLButtonElement;
    if (responsesTab) {
      responsesTab.click();
    }
    
    // Force a refetch of the specific form responses
    if (refetchSpecificResponses) {
      refetchSpecificResponses();
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p>Verifying authentication</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // This will redirect in the useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4">
        <header className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/")}
              className="ml-4"
            >
              ← Back to Main Page
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              Logged in as: <span className="font-bold">{admin?.email}</span>
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>

        <Separator className="my-6" />

        <Tabs defaultValue="responses" className="space-y-4">
          <TabsList>
            <TabsTrigger value="responses">Form Responses</TabsTrigger>
            <TabsTrigger value="forms">Form Configurations</TabsTrigger>
          </TabsList>

          <TabsContent value="responses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Form Responses</CardTitle>
              </CardHeader>
              <CardContent>
                {isResponsesLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : responsesError ? (
                  <div className="text-center py-4 text-red-500">
                    Error loading responses. Please try again.
                  </div>
                ) : responsesData?.data?.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No form responses found.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Form</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {responsesData?.data?.map((response) => (
                        <TableRow key={response.id}>
                          <TableCell className="font-medium">{response.id}</TableCell>
                          <TableCell>{response.label}</TableCell>
                          <TableCell>
                            {new Date(response.submittedAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewFormResponses(response.label)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {selectedLabel && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    <div className="flex justify-between items-center">
                      <span>Responses for: {selectedLabel}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedLabel(null)}
                      >
                        ← Back to All Responses
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isSpecificResponsesLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : specificResponsesError ? (
                    <div className="text-center py-4 text-red-500">
                      Error loading form responses. Please try again.
                    </div>
                  ) : specificResponsesData?.data?.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No responses found for this form.
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {specificResponsesData?.data?.map((response) => (
                        <div key={response.id} className="border rounded-lg p-4">
                          <div className="mb-4 flex justify-between">
                            <div>
                              <h3 className="font-semibold">Response ID: {response.id}</h3>
                              <p className="text-sm text-gray-500">
                                Submitted: {new Date(response.submittedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                            <h3 className="text-lg font-medium mt-2 mb-4">Response Data:</h3>
                            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto max-h-96">
                              {JSON.stringify(response.responses, null, 2)}
                            </pre>
                            <div className="mt-4">
                              <h3 className="text-lg font-medium mb-4">Form Responses:</h3>
                              {response.responses && response.responses.formData && response.responses.questions ? (
                                <div className="space-y-4">
                                  {/* Display questions and answers together */}
                                  {response.responses.questions.map((question: any, index: number) => {
                                    const questionKey = Object.keys(response.responses.formData)[index];
                                    const answer = response.responses.formData[questionKey];
                                    
                                    return (
                                      <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                        <div className="mb-2">
                                          <h4 className="font-semibold text-base">{question.title}</h4>
                                          <p className="text-sm text-gray-600 dark:text-gray-400">{question.subtitle}</p>
                                          <div className="text-xs text-gray-500 mt-1">Type: {question.type}</div>
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                          <div className="font-medium text-sm mb-1">Response:</div>
                                          {typeof answer === "object" ? (
                                            <div className="pl-4 border-l-2 border-gray-300 dark:border-gray-700">
                                              {Object.entries(answer).map(([subKey, subValue]) => (
                                                <div key={subKey} className="mb-1 text-sm">
                                                  <span className="font-medium">{subKey}:</span>{" "}
                                                  {typeof subValue === "object" 
                                                    ? JSON.stringify(subValue) 
                                                    : String(subValue)}
                                                </div>
                                              ))}
                                            </div>
                                          ) : (
                                            <p className="text-gray-700 dark:text-gray-300">{String(answer)}</p>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="mt-4">
                                  <h3 className="text-lg font-medium mb-4">Formatted Values:</h3>
                                  {Object.entries(response.responses).map(([key, value]) => (
                                    <div key={key} className="border-b pb-4 mb-2">
                                      <h4 className="font-medium text-sm mb-1">{key}</h4>
                                      {typeof value === "object" ? (
                                        <div className="pl-4 border-l-2 border-gray-300">
                                          {Object.entries(value).map(([subKey, subValue]) => (
                                            <div key={subKey} className="mb-1">
                                              <span className="font-medium">{subKey}:</span>{" "}
                                              {typeof subValue === "object" 
                                                ? JSON.stringify(subValue) 
                                                : String(subValue)}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-gray-700 dark:text-gray-300">{String(value)}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="forms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Form Configurations</CardTitle>
              </CardHeader>
              <CardContent>
                {isFormsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : formsError ? (
                  <div className="text-center py-4 text-red-500">
                    Error loading form configurations. Please try again.
                  </div>
                ) : formsData?.data?.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No form configurations found.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Label</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formsData?.data?.map((form) => (
                        <TableRow key={form.id}>
                          <TableCell className="font-medium">{form.id}</TableCell>
                          <TableCell>{form.label}</TableCell>
                          <TableCell>
                            {new Date(form.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewFormResponses(form.label)}
                            >
                              View Responses
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}