import { BaseComponent } from '../BaseComponent';
import { Theme } from '../theme';

export type PulseVariant = 'success' | 'warning' | 'error' | 'info';

export interface PulseProps {
    variant?: PulseVariant;
    size?: string;
    className?: string;
}

export class Pulse extends BaseComponent<PulseProps> {
    constructor(props: PulseProps = {}) {
        super('div', props);
        this.render();
    }

    public render(): void {
        const { variant = 'info', size = '10px' } = this.props;
        const color = Theme.colors[variant] || Theme.colors.info;

        this.applyStyles({
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: color,
            position: 'relative',
            display: 'inline-block'
        });

        const ring = document.createElement('div');
        Object.assign(ring.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: `2px solid ${color}`,
            boxSizing: 'border-box',
            animation: 'ui-lib-pulse 2s infinite ease-out'
        });

        this.element.appendChild(ring);

        // Inject animation if not present
        if (!document.getElementById('ui-lib-pulse-anim')) {
            const style = document.createElement('style');
            style.id = 'ui-lib-pulse-anim';
            style.textContent = `
                @keyframes ui-lib-pulse {
                    0% { transform: scale(1); opacity: 0.8; }
                    100% { transform: scale(3); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    public setVariant(variant: PulseVariant): void {
        this.updateProps({ variant });
    }
}
