// ui-lib/feedback/Badge.ts

import { BaseComponent, BaseComponentProps } from '../BaseComponent';
import { Theme } from '../theme';

export interface BadgeProps extends BaseComponentProps {
    count?: number | string;
    variant?: 'accent' | 'error' | 'warning' | 'success';
    size?: 'sm' | 'md';
}

export class Badge extends BaseComponent<BadgeProps> {
    constructor(props: BadgeProps = {}) {
        super('span', props);
        this.render();
    }

    public render(): void {
        const {
            count,
            variant = 'accent',
            size = 'sm'
        } = this.props;

        if (count === undefined || count === null || count === '') {
            this.element.style.display = 'none';
            return;
        }

        let backgroundColor = Theme.colors.accent;
        if (variant === 'error') backgroundColor = Theme.colors.error;
        if (variant === 'warning') backgroundColor = Theme.colors.warning;
        if (variant === 'success') backgroundColor = Theme.colors.success;

        const padding = size === 'sm' ? '0 4px' : '0 6px';
        const fontSize = size === 'sm' ? '10px' : '11px';
        const minWidth = size === 'sm' ? '14px' : '18px';
        const height = size === 'sm' ? '14px' : '18px';

        this.applyStyles({
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor,
            color: '#ffffff',
            borderRadius: '9999px',
            fontSize,
            fontWeight: '600',
            padding: '0.125rem 0.5rem',
            minWidth: 'auto',
            height: 'auto',
            boxSizing: 'border-box',
            lineHeight: '1.2',
            textAlign: 'center',
            verticalAlign: 'middle'
        });

        this.element.textContent = count.toString();
    }
}
