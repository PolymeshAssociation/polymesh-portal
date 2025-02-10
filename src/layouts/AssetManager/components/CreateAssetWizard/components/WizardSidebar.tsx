import React from 'react';
import { SidebarContainer, StepItem } from '../styles';
import { WizardStepProps } from '../types';

interface Step {
  component: React.FC<WizardStepProps>;
  label: string;
}

interface SidebarProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  steps: Step[];
  completedSteps?: number[];
}

const WizardSidebar: React.FC<SidebarProps> = ({
  currentStep,
  setCurrentStep,
  steps,
  completedSteps = [],
}) => {
  return (
    <SidebarContainer>
      {steps.map((step, index) => (
        <StepItem
          key={`${step.label}`}
          $active={currentStep === index}
          $completed={completedSteps.includes(index)}
          onClick={() => {
            if (index <= Math.max(...completedSteps, currentStep)) {
              setCurrentStep(index);
            }
          }}
        >
          {step.label}
        </StepItem>
      ))}
    </SidebarContainer>
  );
};

export default WizardSidebar;
