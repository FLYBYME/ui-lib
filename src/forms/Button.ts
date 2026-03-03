// ui-lib/forms/Button.ts

import { BaseComponent, BaseComponentProps } from '../BaseComponent';
import { Tooltip } from '../feedback/Tooltip';

export interface ButtonProps extends BaseComponentProps {
    label?: string;
    icon?: string; // e.g., 'fas fa-play' or 'lucide-play'
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
    size?: 'sm' | 'base' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    tooltip?: string;
    onClick?: (e: MouseEvent) => void;
}

export class Button extends BaseComponent<ButtonProps> {
    constructor(props: ButtonProps) {
        super('button', props);
        this.render();
    }

    public render(): void {
        const {
            label,
            icon,
            variant = 'secondary',
            size = 'base',
            disabled = false,
            tooltip,
            onClick
        } = this.props;

        this.element.innerHTML = '';

        // Use CSS classes instead of inline styles
        this.element.className = 'ui-button';
        if (size) this.addClasses(`ui-button-${size}`);
        if (variant) this.addClasses(`ui-button-${variant}`);
        if (this.props.className) this.addClasses(...this.props.className.split(' '));

        (this.element as HTMLButtonElement).disabled = disabled;

        // A11y
        this.setAria({
            label: label || tooltip || 'button',
            disabled: String(disabled)
        });

        // Attach event listener using safe utility
        if (onClick && !disabled) {
            this.addEventListener(this.element, 'click', onClick as EventListener);
        }

        if (tooltip) {
            new Tooltip({
                text: tooltip,
                target: this.element,
                position: 'top'
            });
        }

        // Structure the content
        if (icon) {
            const i = document.createElement('i');
            i.className = icon;
            this.element.appendChild(i);
        }

        if (label) {
            const span = document.createElement('span');
            span.textContent = label;
            this.element.appendChild(span);
        }
    }
}