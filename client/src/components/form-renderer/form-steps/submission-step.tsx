import { useFormContext } from "@/contexts/form-context";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";

interface SubmissionStepProps {
  submission: {
    title: string;
    description: string;
    steps: {
      title: string;
      description: string;
    }[];
  };
}

export default function SubmissionStep({ submission }: SubmissionStepProps) {
  const { resetForm } = useFormContext();

  return (
    <div className="flex-1 flex flex-col py-2 sm:py-2 max-h-[90vh] max-w-full overflow-y-auto overflow-x-hidden px-4 hide-scrollbar">
      
      <h3 className="text-2xl font-bold mb-2">{submission.title}</h3>
      <p className="text-gray-500 mb-4">{submission.description}</p>

      <div className="w-full max-w-lg">
        {submission.steps.map((step, index) => (
          <div key={index} className="flex mb-8">
            <div className="mr-4 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                {index + 1}
              </div>
            </div>
            <div className="text-left">
              <h4 className="font-bold text-lg text-center">{step.title}</h4>
              <p className="text-sm text-gray-500 text-center">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <Button 
        className="mt-6 flex items-center"
        variant="outline"
        onClick={resetForm}
      >
        <RefreshCcw className="h-4 w-4 mr-2" />
        Start Over
      </Button>
    </div>
  );
}
