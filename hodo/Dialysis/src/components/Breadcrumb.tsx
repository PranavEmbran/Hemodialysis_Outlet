import React from 'react';
import './breadcrumb.css';

interface BreadcrumbProps {
  steps: { label: string; path?: string }[];
  activeStep?: number;
  onStepClick?: (index: number) => void;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ steps, activeStep, onStepClick }) => {
  return (
    <div className="breadcrumb flat">
      {steps.map((step, index) => (
        <a
          key={step.label}
          href={step.path || '#'}
          className={activeStep === index ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            onStepClick?.(index);
          }}
        >
          {/* <span className="step-number">{index + 1}</span> */}
          {step.label}
        </a>
      ))}
    </div>
  );
};

export default Breadcrumb;