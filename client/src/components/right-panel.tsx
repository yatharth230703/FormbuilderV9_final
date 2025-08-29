import { useFormContext } from "@/contexts/form-context";
import FormRenderer from "@/components/form-renderer";

export default function RightPanel() {

  // pull in formConfig for the form renderer
  const {
    formConfig,
  } = useFormContext();



  return (
    <div className="w-full md:flex-1 h-full flex flex-col bg-gray-100 p-2 md:p-4">
      {/* 16:9 preview */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-7xl aspect-[16/9] bg-white rounded-xl shadow-lg overflow-hidden relative">
          <FormRenderer />
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-7xl mx-auto mt-4 flex items-center justify-center">
        {/* All buttons removed */}
      </div>


    </div>
  );
}
