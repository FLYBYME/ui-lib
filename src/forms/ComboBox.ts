// ui-lib/forms/ComboBox.ts

import { BaseComponent } from '../BaseComponent';
import { Theme } from '../theme';
import { Popover } from '../overlays/Popover';
import { TextInput } from './TextInput';
import { VirtualList } from '../navigation/VirtualList';

export interface ComboBoxOption {
    label: string;
    value: string;
}

export interface ComboBoxProps {
    label?: string;
    options: ComboBoxOption[];
    value?: string;
    placeholder?: string;
    onChange?: (value: string) => void;
    onCustomValue?: (value: string) => void;
    allowCustomValue?: boolean;
    disabled?: boolean;
}

export class ComboBox extends BaseComponent<ComboBoxProps> {
    private input: TextInput;
    private popover: Popover | null = null;
    private filteredOptions: ComboBoxOption[] = [];
    private selectedIndex: number = -1;

    constructor(props: ComboBoxProps) {
        super('div', props);
        this.input = new TextInput({
            placeholder: props.placeholder,
            value: props.options.find(o => o.value === props.value)?.label || props.value || '',
            disabled: props.disabled,
            onChange: (val) => this.handleInputChange(val)
        });
        this.render();
    }

    public render(): void {
        this.element.innerHTML = '';

        if (this.props.label) {
            const label = document.createElement('label');
            label.textContent = this.props.label;
            label.style.display = 'block';
            label.style.marginBottom = Theme.spacing.xs;
            label.style.fontSize = Theme.font.sizeBase;
            label.style.color = Theme.colors.textMuted;
            this.element.appendChild(label);
        }

        this.appendChild(this.input);
        this.element.appendChild(this.input.getElement());

        // A11y & Event setup
        const inputEl = this.input.getElement() as HTMLInputElement;
        if (inputEl) {
            inputEl.setAttribute('role', 'combobox');
            inputEl.setAttribute('aria-autocomplete', 'list');
            inputEl.setAttribute('aria-expanded', 'false');
            inputEl.setAttribute('aria-haspopup', 'listbox');

            this.addEventListener(inputEl, 'focus', () => {
                this.showDropdown(inputEl.value);
            });

            this.addEventListener(inputEl, 'keydown', ((e: KeyboardEvent) => {
                this.handleKeyDown(e);
            }) as EventListener);
        }
    }

    private handleInputChange(value: string): void {
        this.showDropdown(value);
        if (this.props.allowCustomValue && this.props.onCustomValue) {
            this.props.onCustomValue(value);
        }
    }

    private showDropdown(filter: string): void {
        this.filteredOptions = this.props.options.filter(o =>
            o.label.toLowerCase().includes(filter.toLowerCase())
        );

        if (this.filteredOptions.length === 0 && !this.props.allowCustomValue) {
            this.closeDropdown();
            return;
        }

        const virtualList = new VirtualList<ComboBoxOption>({
            items: this.filteredOptions,
            itemHeight: 32,
            height: '300px',
            renderItem: (option, index) => {
                const item = document.createElement('div');
                item.textContent = option.label;
                item.setAttribute('role', 'option');
                Object.assign(item.style, {
                    padding: '8px 12px',
                    cursor: 'pointer',
                    backgroundColor: index === this.selectedIndex ? 'var(--ui-bg-hover)' : 'transparent',
                    color: 'var(--ui-text-main)',
                    height: '32px',
                    boxSizing: 'border-box'
                });

                this.addEventListener(item, 'mouseenter', () => {
                    this.selectedIndex = index;
                    this.updatePopoverContent();
                });

                this.addEventListener(item, 'click', () => {
                    this.selectOption(option);
                });

                return item;
            }
        });

        if (this.popover) {
            this.popover.updateProps({ content: [virtualList.getElement()] });
        } else {
            this.popover = new Popover({
                anchor: this.input.getElement(),
                content: [virtualList.getElement()],
                placement: 'bottom'
            });
            this.popover.show();
            (this.input.getElement() as HTMLInputElement).setAttribute('aria-expanded', 'true');
        }
        this.appendChild(virtualList);
    }

    private updatePopoverContent(): void {
        this.showDropdown(this.input.getValue());
    }

    private handleKeyDown(e: KeyboardEvent): void {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredOptions.length - 1);
            this.updatePopoverContent();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
            this.updatePopoverContent();
        } else if (e.key === 'Enter') {
            if (this.selectedIndex >= 0 && this.selectedIndex < this.filteredOptions.length) {
                this.selectOption(this.filteredOptions[this.selectedIndex]);
            } else if (this.props.allowCustomValue) {
                const val = (e.target as HTMLInputElement).value;
                this.props.onCustomValue?.(val);
                this.closeDropdown();
            }
        } else if (e.key === 'Escape') {
            this.closeDropdown();
        }
    }

    private selectOption(option: ComboBoxOption): void {
        this.input.setValue(option.label);
        if (this.props.onChange) this.props.onChange(option.value);
        this.closeDropdown();
    }

    private closeDropdown(): void {
        if (this.popover) {
            this.popover.hide();
            this.popover = null;
            this.selectedIndex = -1;
            (this.input.getElement() as HTMLInputElement).setAttribute('aria-expanded', 'false');
        }
    }
}
