// ui-lib/feedback/Timeline.ts

import { BaseComponent, BaseComponentProps } from '../BaseComponent';
import { Theme } from '../theme';

export interface TimelineEvent {
    id: string;
    title: string;
    timestamp: string;
    description?: string;
    icon?: string;
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

export interface TimelineProps extends BaseComponentProps {
    events: TimelineEvent[];
}

export class Timeline extends BaseComponent<TimelineProps> {
    constructor(props: TimelineProps) {
        super('div', props);
        this.render();
    }

    public render(): void {
        const { events } = this.props;

        this.applyStyles({
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
            width: '100%',
            position: 'relative',
            paddingLeft: '20px'
        });

        this.element.innerHTML = '';

        // The vertical line
        const line = document.createElement('div');
        Object.assign(line.style, {
            position: 'absolute',
            left: '30px',
            top: '10px',
            bottom: '10px',
            width: '2px',
            backgroundColor: Theme.colors.border,
            zIndex: '0'
        });
        this.element.appendChild(line);

        events.forEach((event, index) => {
            const item = document.createElement('div');
            Object.assign(item.style, {
                display: 'flex',
                gap: Theme.spacing.md,
                marginBottom: index === events.length - 1 ? '0' : '24px',
                position: 'relative',
                zIndex: '1'
            });

            // Dot/Icon container
            const dotContainer = document.createElement('div');
            Object.assign(dotContainer.style, {
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: Theme.colors.bgSecondary,
                border: `2px solid ${this.getVariantColor(event.variant)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '4px',
                flexShrink: '0'
            });

            if (event.icon) {
                const icon = document.createElement('i');
                icon.className = event.icon;
                icon.style.fontSize = '10px';
                icon.style.color = this.getVariantColor(event.variant);
                dotContainer.appendChild(icon);
            } else {
                const dot = document.createElement('div');
                Object.assign(dot.style, {
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: this.getVariantColor(event.variant)
                });
                dotContainer.appendChild(dot);
            }

            // Content
            const content = document.createElement('div');
            Object.assign(content.style, {
                flex: '1',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
            });

            const title = document.createElement('div');
            title.textContent = event.title;
            Object.assign(title.style, {
                fontSize: Theme.font.sizeBase,
                fontWeight: '600',
                color: Theme.colors.textMain
            });

            const timestamp = document.createElement('div');
            timestamp.textContent = event.timestamp;
            Object.assign(timestamp.style, {
                fontSize: '11px',
                color: Theme.colors.textMuted
            });

            content.appendChild(title);
            content.appendChild(timestamp);

            if (event.description) {
                const desc = document.createElement('div');
                desc.textContent = event.description;
                Object.assign(desc.style, {
                    fontSize: '12px',
                    color: Theme.colors.textMain,
                    marginTop: '4px',
                    lineHeight: '1.5'
                });
                content.appendChild(desc);
            }

            item.appendChild(dotContainer);
            item.appendChild(content);
            this.element.appendChild(item);
        });
    }

    private getVariantColor(variant?: string): string {
        switch (variant) {
            case 'success': return Theme.colors.success;
            case 'warning': return Theme.colors.warning;
            case 'error': return Theme.colors.error;
            case 'info': return Theme.colors.info;
            case 'primary': return Theme.colors.accent;
            default: return Theme.colors.accent;
        }
    }
}
