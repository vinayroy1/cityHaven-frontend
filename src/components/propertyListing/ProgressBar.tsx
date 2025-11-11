import { Check } from 'lucide-react';

interface Step {
  number: number;
  name: string;
  progress: number;
}

interface ProgressBarProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepNumber: number) => void;
}

export function ProgressBar({ steps, currentStep, onStepClick }: ProgressBarProps) {
  const currentProgress = steps.find(s => s.number === currentStep)?.progress || 0;

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full mb-6">
        <div 
          className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-500"
          style={{ width: `${currentProgress}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="hidden md:flex justify-between items-start">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isClickable = step.number <= currentStep;

          return (
            <div key={step.number} className="flex flex-col items-center flex-1">
              <button
                onClick={() => isClickable && onStepClick(step.number)}
                disabled={!isClickable}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center mb-2
                  transition-all duration-300
                  ${isCompleted 
                    ? 'bg-green-600 text-white' 
                    : isCurrent 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-400'
                  }
                  ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{step.number}</span>
                )}
              </button>
              <span className={`text-xs text-center ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
                {step.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Step Indicator */}
      <div className="md:hidden text-center">
        <p className="text-gray-600">
          Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.name}
        </p>
      </div>
    </div>
  );
}
