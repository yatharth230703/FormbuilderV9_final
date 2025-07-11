import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function LandingPage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (!user) {
      setLocation("/auth");
      return;
    }
    // navigate to form-builder with the prompt
    const encoded = encodeURIComponent(prompt.trim());
    setLocation(`/buildform?prompt=${encoded}`);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
            <header className="flex items-center justify-between p-4 bg-white border-b">
        <h1 className="text-2xl font-bold text-primary">Form Builder</h1>
        <div className="flex items-center gap-2">
          <Button
            onClick={() =>
              user ? setLocation("/dashboard") : setLocation("/auth")
            }
          >
            {user ? "Dashboard" : "Login / Register"}
          </Button>
          {user && (
            <Button
              variant="outline"
              onClick={() => {
                logout();
                setLocation("/");
              }}
            >
              Logout
            </Button>
          )}
        </div>
      </header>

      {/* Centered Prompt Input */}
      <main className="flex-1 flex items-end justify-center p-6">
        <div className="w-full max-w-xl">
          <Textarea
            placeholder="Describe the form you want to create..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onFocus={() => {
              if (!user) setLocation("/auth");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            className="min-h-[100px] resize-none mb-4"
          />
          <Button
            onClick={handleSubmit}
            disabled={!prompt.trim()}
            className="w-full"
          >
            Go
          </Button>
        </div>
      </main>
    </div>
  );
}
