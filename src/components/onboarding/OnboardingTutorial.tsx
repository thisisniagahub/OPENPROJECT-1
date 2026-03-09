"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Gamepad2, Wifi, Users, Edit, Keyboard } from "lucide-react";

const ONBOARDING_KEY = "agent-town:onboarding-completed";

const STEPS = [
  {
    title: "Welcome to Agent Town!",
    description: "A pixel-art office simulation where AI agents work on tasks. Connect your OpenClaw gateway and watch your AI team collaborate in real-time!",
    icon: Gamepad2,
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Connect to OpenClaw",
    description: "Click the connection button in the top-right corner. Enter your gateway URL (e.g., ws://localhost:18789) and token. The status will turn green when connected.",
    icon: Wifi,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Assign Tasks to Agents",
    description: "Press 'E' near a worker's desk or use the chat panel to assign tasks. Each agent can work independently on different tasks simultaneously.",
    icon: Users,
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Office Editor",
    description: "Press 'P' to toggle Play/Edit mode. In Edit mode, place furniture, paint tiles, and customize your office layout. Press 'S' to save your design.",
    icon: Edit,
    color: "from-orange-500 to-yellow-500",
  },
  {
    title: "Keyboard Shortcuts",
    description: "Press '?' to see all shortcuts. Use E/P to switch modes, N for new session, C to connect. Numbers 1-5 toggle different panels.",
    icon: Keyboard,
    color: "from-red-500 to-rose-500",
  },
];

export default function OnboardingTutorial() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      setIsVisible(true);
    }
  }, []);

  const handleComplete = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsVisible(false);
  }, []);

  const handleSkip = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, handleComplete]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  if (!isVisible) return null;

  const step = STEPS[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-slate-900 border-2 border-purple-500 rounded-lg shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors"
          aria-label="Skip tutorial"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="p-8 pt-6">
          {/* Icon */}
          <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center`}>
            <Icon className="w-8 h-8 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-white text-center mb-4" style={{ fontFamily: '"Ark Pixel", monospace' }}>
            {step.title}
          </h2>

          {/* Description */}
          <p className="text-slate-300 text-center leading-relaxed mb-8" style={{ fontFamily: '"Ark Pixel", monospace', fontSize: "11px" }}>
            {step.description}
          </p>

          {/* Step indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "w-6 bg-purple-500"
                    : index < currentStep
                    ? "bg-purple-500/50"
                    : "bg-slate-600"
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                currentStep === 0
                  ? "text-slate-600 cursor-not-allowed"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <span className="text-xs text-slate-500">
              {currentStep + 1} of {STEPS.length}
            </span>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              {isLastStep ? "Get Started" : "Next"}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Skip link */}
        <div className="px-8 pb-4 text-center">
          <button
            onClick={handleSkip}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Skip tutorial
          </button>
        </div>
      </div>
    </div>
  );
}
