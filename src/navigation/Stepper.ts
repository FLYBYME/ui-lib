// ui-lib/navigation/Stepper.ts

import { BaseComponent, BaseComponentProps } from '../BaseComponent';
import { Theme } from '../theme';

export interface Step {
    label: string;
    description?: string;
}

export interface StepperProps extends BaseComponentProps {
    steps: Step[];
    currentStep: number;
    orientation?: 'horizontal' | 'vertical';
}

export class Stepper extends BaseComponent<StepperProps> {
    constructor(props: StepperProps) {
        super('div', props);
        this.render();
    }

    public render(): void {
        const { steps, currentStep, orientation = 'horizontal' } = this.props;

        this.applyStyles({
            display: 'flex',
            flexDirection: orientation === 'horizontal' ? 'row' : 'column',
            gap: Theme.spacing.md,
            width: '100%',
            alignItems: orientation === 'horizontal' ? 'flex-start' : 'stretch'
        });

        this.element.innerHTML = '';

        steps.forEach((step, index) => {
            const stepEl = document.createElement('div');
            Object.assign(stepEl.style, {
                display: 'flex',
                flexDirection: orientation === 'horizontal' ? 'column' : 'row',
                alignItems: 'center',
                gap: Theme.spacing.sm,
                flex: orientation === 'horizontal' ? '1' : '0',
                opacity: index > currentStep ? '0.5' : '1'
            });

            // Container for number and line
            const iconContainer = document.createElement('div');
            Object.assign(iconContainer.style, {
                display: 'flex',
                alignItems: 'center',
                width: orientation === 'horizontal' ? '100%' : 'auto',
                gap: Theme.spacing.sm
            });

            // Step number
            const number = document.createElement('div');
            number.textContent = String(index + 1);
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;

            Object.assign(number.style, {
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: isActive || isCompleted ? 'var(--ui-accent)' : 'var(--ui-bg-tertiary)',
                color: isActive || isCompleted ? '#fff' : 'var(--ui-text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '600',
                border: isCompleted ? 'none' : `1px solid ${Theme.colors.border}`
            });

            if (isCompleted) {
                number.innerHTML = '<i class="fas fa-check" style="font-size: 10px;"></i>';
            }

            iconContainer.appendChild(number);

            // Connector line
            if (index < steps.length - 1) {
                const line = document.createElement('div');
                Object.assign(line.style, {
                    flex: '1',
                    height: orientation === 'horizontal' ? '1px' : 'auto',
                    width: orientation === 'horizontal' ? 'auto' : '1px',
                    backgroundColor: index < currentStep ? 'var(--ui-accent)' : 'var(--ui-border)',
                    minHeight: orientation === 'vertical' ? '20px' : '1px'
                });
                iconContainer.appendChild(line);
            }

            // Labels
            const labelContainer = document.createElement('div');
            Object.assign(labelContainer.style, {
                marginTop: orientation === 'horizontal' ? '8px' : '0',
                textAlign: orientation === 'horizontal' ? 'center' : 'left'
            });

            const label = document.createElement('div');
            label.textContent = step.label;
            Object.assign(label.style, {
                fontSize: Theme.font.sizeBase,
                fontWeight: isActive ? '600' : '400',
                color: isActive ? 'var(--ui-text-main)' : 'var(--ui-text-muted)'
            });

            labelContainer.appendChild(label);

            if (step.description && orientation === 'vertical') {
                const desc = document.createElement('div');
                desc.textContent = step.description;
                Object.assign(desc.style, {
                    fontSize: '11px',
                    color: Theme.colors.textMuted
                });
                labelContainer.appendChild(desc);
            }

            stepEl.appendChild(iconContainer);
            stepEl.appendChild(labelContainer);
            this.element.appendChild(stepEl);
        });
    }
}
