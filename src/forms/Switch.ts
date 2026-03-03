// ui-lib/forms/Switch.ts

import { BaseComponent } from '../BaseComponent';
import { Theme } from '../theme';

export interface SwitchProps {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    label?: string;
}

export class Switch extends BaseComponent<SwitchProps> {
    private track: HTMLDivElement;
    private thumb: HTMLDivElement;

    constructor(props: SwitchProps) {
        super('div', props);
        this.track = document.createElement('div');
        this.thumb = document.createElement('div');
        this.render();
    }

    public render(): void {
        const { checked = false, label } = this.props;

        this.addClasses('ui-switch');
        this.applyStyles({
            display: 'inline-flex',
            alignItems: 'center',
            gap: Theme.spacing.sm,
            cursor: 'pointer',
            userSelect: 'none',
            outline: 'none'
        });

        // A11y
        this.element.setAttribute('role', 'switch');
        this.element.setAttribute('aria-checked', String(checked));
        this.element.setAttribute('tabindex', '0');
        if (label) {
            this.setAria({ label });
        }

        Object.assign(this.track.style, {
            width: '32px',
            height: '18px',
            backgroundColor: checked ? 'var(--ui-accent, #3b82f6)' : 'var(--ui-bg-tertiary, #27272a)',
            borderRadius: '9px',
            position: 'relative',
            transition: 'background-color 0.2s'
        });

        Object.assign(this.thumb.style, {
            width: '14px',
            height: '14px',
            backgroundColor: '#fff',
            borderRadius: '50%',
            position: 'absolute',
            top: '2px',
            left: checked ? '16px' : '2px',
            transition: 'left 0.2s'
        });

        this.track.innerHTML = '';
        this.track.appendChild(this.thumb);

        this.element.innerHTML = '';
        this.element.appendChild(this.track);

        if (label) {
            const labelEl = document.createElement('span');
            labelEl.textContent = label;
            labelEl.style.fontSize = Theme.font.sizeBase;
            labelEl.style.color = Theme.colors.textMain;
            this.element.appendChild(labelEl);
        }

        this.addEventListener(this.element, 'click', () => {
            this.toggle();
        });

        this.addEventListener(this.element, 'keydown', ((e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            }
        }) as EventListener);
    }

    private toggle(): void {
        const nextChecked = !this.props.checked;
        this.updateProps({ checked: nextChecked });
        if (this.props.onChange) this.props.onChange(nextChecked);
    }
}
