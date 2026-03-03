// ui-lib/navigation/Tab.ts

import { BaseComponent, BaseComponentProps } from '../BaseComponent';
import { Theme } from '../theme';
import { Text } from '../typography/Text';

export interface TabProps extends BaseComponentProps {
    label: string;
    icon?: string;
    active?: boolean;
    closable?: boolean;
    onClick?: (e: MouseEvent) => void;
    onClose?: (e: MouseEvent) => void;
}

export class Tab extends BaseComponent<TabProps> {
    constructor(props: TabProps) {
        super('div', props);
        this.render();
    }

    public render(): void {
        const {
            label,
            icon,
            active = false,
            closable = true,
            onClick,
            onClose
        } = this.props;

        this.element.innerHTML = '';

        this.addClasses('ui-tab');
        this.applyStyles({
            display: 'inline-flex',
            alignItems: 'center',
            padding: `0 ${Theme.spacing.md}`,
            height: '35px',
            backgroundColor: active ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
            cursor: 'pointer',
            userSelect: 'none',
            position: 'relative',
            transition: 'all 0.2s ease',
            outline: 'none'
        });

        // A11y
        this.element.setAttribute('role', 'tab');
        this.element.setAttribute('aria-selected', String(active));
        this.element.setAttribute('tabindex', active ? '0' : '-1');

        // Active indicator (bottom border)
        if (active) {
            const indicator = document.createElement('div');
            Object.assign(indicator.style, {
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                height: '2px',
                backgroundColor: 'var(--ui-accent, #3b82f6)'
            });
            this.element.appendChild(indicator);
        }

        // Icon
        if (icon) {
            const iconEl = document.createElement('i');
            iconEl.className = icon;
            iconEl.style.marginRight = '8px';
            iconEl.style.fontSize = '12px';
            this.element.appendChild(iconEl);
        }

        // Label
        const labelText = new Text({
            text: label,
            truncate: true,
            variant: active ? 'main' : 'muted',
            size: 'sm'
        });
        this.appendChild(labelText);
        this.element.appendChild(labelText.getElement());

        // Close button
        if (closable) {
            const closeBtn = document.createElement('i');
            closeBtn.className = 'fas fa-times';
            Object.assign(closeBtn.style, {
                marginLeft: Theme.spacing.sm,
                fontSize: '10px',
                padding: '4px',
                borderRadius: '2px',
                visibility: active ? 'visible' : 'hidden',
                opacity: active ? '0.8' : '0.5',
                transition: 'background-color 0.1s'
            });

            this.addEventListener(closeBtn, 'click', ((e: MouseEvent) => {
                e.stopPropagation();
                if (onClose) onClose(e);
            }) as EventListener);

            this.addEventListener(closeBtn, 'mouseenter', () => {
                closeBtn.style.backgroundColor = 'var(--ui-bg-tertiary, #27272a)';
            });
            this.addEventListener(closeBtn, 'mouseleave', () => {
                closeBtn.style.backgroundColor = 'transparent';
            });

            this.element.appendChild(closeBtn);

            // Hover effects for the tab
            this.addEventListener(this.element, 'mouseenter', () => {
                if (!active) this.element.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                closeBtn.style.visibility = 'visible';
            });
            this.addEventListener(this.element, 'mouseleave', () => {
                if (!active) this.element.style.backgroundColor = 'transparent';
                if (!active) closeBtn.style.visibility = 'hidden';
            });
        }

        if (onClick) {
            this.addEventListener(this.element, 'click', onClick as EventListener);
        }

        this.addEventListener(this.element, 'keydown', ((e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (onClick) onClick(new MouseEvent('click')); // Trigger click for consistency
            }
        }) as EventListener);
    }
}
