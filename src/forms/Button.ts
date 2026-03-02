// ui-lib/forms/Button.ts

import { BaseComponent, BaseComponentProps } from '../BaseComponent';
import { Tooltip } from '../feedback/Tooltip';
import { Theme } from '../theme';

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

        // Size-specific styles
        const sizeStyles = {
            sm: {
                padding: '4px 8px',
                fontSize: '11px',
                gap: '4px'
            },
            base: {
                padding: `${Theme.spacing.xs} ${Theme.spacing.sm}`,
                fontSize: Theme.font?.sizeBase || '13px',
                gap: Theme.spacing.sm
            },
            lg: {
                padding: '8px 16px',
                fontSize: '15px',
                gap: '10px'
            }
        }[size];

        // Base styles for all buttons
        this.applyStyles({
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: Theme.radius,
            border: '1px solid transparent',
            fontFamily: 'inherit',
            fontWeight: '500',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? '0.5' : '1',
            outline: 'none',
            userSelect: 'none',
            transition: 'all 0.15s ease-in-out',
            ...sizeStyles
        });

        // Variant-specific styles
        if (variant === 'primary') {
            this.applyStyles({
                backgroundColor: Theme.colors.accent,
                color: '#ffffff',
                border: `1px solid ${Theme.colors.accent}`
            });
        } else if (variant === 'secondary') {
            this.applyStyles({
                backgroundColor: Theme.colors.bgTertiary,
                color: Theme.colors.textMain,
                border: `1px solid ${Theme.colors.border}`,
            });
        } else if (variant === 'ghost') {
            this.applyStyles({
                backgroundColor: 'transparent',
                color: Theme.colors.textMain,
                border: '1px solid transparent'
            });
        } else if (variant === 'danger') {
            this.applyStyles({
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: Theme.colors.error,
                border: `1px solid rgba(239, 68, 68, 0.2)`
            });
        } else if (variant === 'accent') {
            this.applyStyles({
                backgroundColor: Theme.colors.accent,
                color: '#ffffff',
                border: `1px solid ${Theme.colors.accent}`
            });
        }

        // Add Hover Effects
        if (!disabled) {
            this.element.onmouseenter = () => {
                if (variant === 'ghost') this.applyStyles({ backgroundColor: 'rgba(255, 255, 255, 0.05)' });
                else if (variant === 'secondary') this.applyStyles({ backgroundColor: Theme.colors.border, borderColor: Theme.colors.textMuted });
                else this.element.style.filter = 'brightness(1.15)';
            };
            this.element.onmouseleave = () => {
                if (variant === 'ghost') this.applyStyles({ backgroundColor: 'transparent' });
                else if (variant === 'secondary') this.applyStyles({ backgroundColor: Theme.colors.bgTertiary, borderColor: Theme.colors.border });
                else this.element.style.filter = 'none';
            };
            this.element.onmousedown = () => {
                this.element.style.transform = 'scale(0.98)';
            };
            this.element.onmouseup = () => {
                this.element.style.transform = 'scale(1)';
            };
        }

        if (tooltip) {
            new Tooltip({
                text: tooltip,
                target: this.element,
                position: 'top'
            })
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

        // Attach event listener
        if (onClick && !disabled) {
            this.element.onclick = onClick;
        }
    }
}