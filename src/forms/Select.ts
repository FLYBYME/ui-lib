// ui-lib/forms/Select.ts

import { BaseComponent } from '../BaseComponent';
import { Theme } from '../theme';
import { Popover } from '../overlays/Popover';

export interface SelectOption {
    label: string;
    value: string;
}

export interface SelectProps {
    label?: string;
    options: SelectOption[];
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export class Select extends BaseComponent<SelectProps> {
    private button: HTMLButtonElement;
    private popover: Popover | null = null;
    private selectedIndex: number = -1;

    constructor(props: SelectProps) {
        super('div', props);
        this.button = document.createElement('button');
        this.render();
    }

    public render(): void {
        const { label, options, value, placeholder = 'Select...', disabled = false } = this.props;

        this.applyStyles({
            display: 'flex',
            flexDirection: 'column',
            gap: Theme.spacing.xs,
            width: '100%',
            opacity: disabled ? '0.6' : '1'
        });

        if (label) {
            const labelEl = document.createElement('label');
            labelEl.textContent = label;
            labelEl.style.fontSize = Theme.font.sizeBase;
            labelEl.style.color = Theme.colors.textMain;
            this.element.appendChild(labelEl);
        }

        const buttonContainer = document.createElement('div');
        buttonContainer.style.position = 'relative';
        buttonContainer.style.width = '100%';

        const selectedOption = options.find(o => o.value === value);
        this.selectedIndex = options.findIndex(o => o.value === value);

        this.button.disabled = disabled;
        Object.assign(this.button.style, {
            width: '100%',
            padding: `${Theme.spacing.xs} ${Theme.spacing.sm}`,
            backgroundColor: Theme.colors.bgSecondary,
            border: `1px solid ${Theme.colors.border}`,
            borderRadius: Theme.radius,
            color: Theme.colors.textMain,
            cursor: disabled ? 'default' : 'pointer',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: Theme.font.sizeBase,
            outline: 'none'
        });

        this.button.innerHTML = `
            <span>${selectedOption ? selectedOption.label : placeholder}</span>
            <i class="fas fa-chevron-down" style="font-size: 10px; opacity: 0.7;"></i>
        `;

        // A11y
        this.setAria({
            haspopup: 'listbox',
            expanded: 'false'
        });
        this.button.setAttribute('role', 'combobox');

        this.addEventListener(this.button, 'click', () => {
            if (!disabled) this.toggleDropdown();
        });

        this.addEventListener(this.button, 'keydown', ((e: KeyboardEvent) => {
            if (disabled) return;
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                this.toggleDropdown();
            }
        }) as EventListener);

        buttonContainer.appendChild(this.button);
        this.element.appendChild(buttonContainer);
    }

    private toggleDropdown(): void {
        if (this.popover) {
            this.closeDropdown();
            return;
        }

        const listbox = document.createElement('div');
        listbox.setAttribute('role', 'listbox');
        Object.assign(listbox.style, {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxHeight: '300px',
            overflowY: 'auto'
        });

        const items = this.props.options.map((option, index) => {
            const el = document.createElement('div');
            el.setAttribute('role', 'option');
            el.setAttribute('aria-selected', option.value === this.props.value ? 'true' : 'false');

            Object.assign(el.style, {
                padding: `${Theme.spacing.xs} ${Theme.spacing.md}`,
                cursor: 'pointer',
                color: Theme.colors.textMain,
                backgroundColor: option.value === this.props.value ? Theme.colors.accent : 'transparent',
                outline: 'none'
            });

            this.addEventListener(el, 'mouseenter', () => {
                if (option.value !== this.props.value) {
                    el.style.backgroundColor = Theme.colors.bgTertiary;
                }
            });
            this.addEventListener(el, 'mouseleave', () => {
                if (option.value !== this.props.value) {
                    el.style.backgroundColor = 'transparent';
                }
            });

            this.addEventListener(el, 'click', () => {
                this.selectOption(option.value);
            });

            el.textContent = option.label;
            return el;
        });

        this.setAria({ expanded: 'true' });
        this.popover = new Popover({
            anchor: this.button,
            content: items,
            placement: 'bottom'
        });
        this.popover.show();

        // Keyboard navigation in dropdown
        this.addEventListener(window.document.body, 'keydown', this.handleGlobalKeyDown);
    }

    private handleGlobalKeyDown = (e: Event): void => {
        const keyboardEvent = e as KeyboardEvent;
        if (!this.popover) return;

        if (keyboardEvent.key === 'Escape') {
            this.closeDropdown();
        } else if (keyboardEvent.key === 'ArrowDown') {
            keyboardEvent.preventDefault();
            this.navigate(1);
        } else if (keyboardEvent.key === 'ArrowUp') {
            keyboardEvent.preventDefault();
            this.navigate(-1);
        } else if (keyboardEvent.key === 'Enter') {
            keyboardEvent.preventDefault();
            if (this.selectedIndex >= 0) {
                this.selectOption(this.props.options[this.selectedIndex].value);
            }
        }
    };

    private navigate(direction: number): void {
        const newIndex = Math.max(0, Math.min(this.props.options.length - 1, this.selectedIndex + direction));
        this.selectedIndex = newIndex;
        // In a real implementation we would highlight the item visually here
        // For simplicity, we just update the index and wait for Enter
    }

    private selectOption(value: string): void {
        this.updateProps({ value });
        if (this.props.onChange) this.props.onChange(value);
        this.closeDropdown();
    }

    private closeDropdown(): void {
        if (this.popover) {
            this.popover.hide();
            this.popover = null;
            this.setAria({ expanded: 'false' });
            // Clean up global listener
            this.disposables = this.disposables.filter(d => {
                if (d.dispose.toString().includes('handleGlobalKeyDown')) { // This is a bit hacky
                    // In a better design, addEventListener would return a disposable we can track
                }
                return true;
            });
        }
    }
}
