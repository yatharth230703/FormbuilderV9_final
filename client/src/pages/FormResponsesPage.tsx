import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserNav } from '@/components/auth/UserNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useLocation, useParams } from 'wouter';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FormResponse {
  id: number;
  label: string;
  created_at: string;
  response: Record<string, any> | null;
  temp_response?: Record<string, any> | null;
}

export function FormResponsesPage() {
  const { user } = useAuth();
  const [_, setLocation] = useLocation();
  const params = useParams();
  const formId = params.id;
  
  const [formData, setFormData] = useState<{
    formId: number;
    formLabel: string;
    data: FormResponse[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        setLoading(true);
        
        if (!formId) {
          setError('No form ID provided');
          setLoading(false);
          return;
        }
        
        const response = await fetch(`/api/forms/${formId}/responses`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch responses: ${response.statusText}`);
        }
        
        const responses = await response.json();
        if (responses.error) {
          throw new Error(responses.error);
        }
        
        // Structure the data correctly for the frontend
        setFormData({
          formId: parseInt(formId),
          formLabel: `Form ${formId}`,
          data: Array.isArray(responses) ? responses : []
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching form responses:', err);
        setError(err instanceof Error ? err.message : 'Failed to load responses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchResponses();
    }
  }, [user, formId]);

  // Helper function to format response data
  const formatResponseValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, null, 2);
      } catch (e) {
        return '[Complex Object]';
      }
    }
    
    return String(value);
  };

  // Helper function to parse JSON strings in responses
  const parseJsonIfPossible = (value: any): any => {
    if (typeof value !== 'string') {
      return value;
    }
    
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  };

  // Helper function to get response data with fallback to temp_response
  const getResponseData = (response: FormResponse): Record<string, any> | null => {
    if (response.response && typeof response.response === 'object') {
      return response.response;
    }
    if (response.temp_response && typeof response.temp_response === 'object') {
      return response.temp_response;
    }
    return null;
  };

  // Get all unique keys from responses
  const getAllResponseKeys = (responses: FormResponse[]): string[] => {
    const keys = new Set<string>();
    
    responses.forEach(response => {
      const responseData = getResponseData(response);
      if (responseData && typeof responseData === 'object') {
        Object.keys(responseData).forEach(key => keys.add(key));
      }
    });
    
    return Array.from(keys);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation('/dashboard')}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Button>
              <h1 className="text-xl font-bold">Form Responses</h1>
            </div>
            <UserNav />
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-red-500">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : !formData || formData.data.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Responses Yet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  There are no responses for this form yet.
                </p>
                <Button onClick={() => setLocation('/dashboard')}>
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{formData.formLabel}</CardTitle>
                <p className="text-sm text-gray-500">
                  {formData.data.length} {formData.data.length === 1 ? 'response' : 'responses'} received
                </p>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Submitted At</TableHead>
                        {getAllResponseKeys(formData.data).map(key => (
                          <TableHead key={key}>{key}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                                        <TableBody>
                      {formData.data.map(response => {
                        const responseData = getResponseData(response);
                        const isUsingTempResponse = !response.response && response.temp_response;
                        
                        return (
                          <TableRow key={response.id} className={isUsingTempResponse ? 'bg-yellow-50' : ''}>
                            <TableCell>
                              {response.id}
                              {isUsingTempResponse && (
                                <span className="ml-2 text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                                  Incomplete
                                </span>
                              )}
                            </TableCell>
                            <TableCell>{new Date(response.created_at).toLocaleString()}</TableCell>
                            {getAllResponseKeys(formData.data).map(key => (
                              <TableCell key={key}>
                                {formatResponseValue(parseJsonIfPossible(responseData?.[key]))}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}