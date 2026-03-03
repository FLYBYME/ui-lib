// ui-lib/forms/DateTimePicker.ts

import { BaseComponent, BaseComponentProps } from '../BaseComponent';
import { Theme } from '../theme';
import { TextInput } from './TextInput';
import { Popover } from '../overlays/Popover';

export interface DateTimePickerProps extends BaseComponentProps {
    value?: Date;
    onChange?: (value: Date) => void;
    placeholder?: string;
    showTime?: boolean;
}

export class DateTimePicker extends BaseComponent<DateTimePickerProps> {
    private input: TextInput;
    private popover: Popover | null = null;

    constructor(props: DateTimePickerProps) {
        super('div', props);
        this.input = new TextInput({
            placeholder: props.placeholder || 'Select date...',
            value: props.value ? this.formatDate(props.value) : '',
            onChange: (val) => this.handleManualInput(val)
        });
        this.render();
    }

    public render(): void {
        this.element.innerHTML = '';
        this.appendChild(this.input);
        this.element.appendChild(this.input.getElement());

        this.addEventListener(this.input.getElement(), 'click', () => {
            this.showPicker();
        });
    }

    private formatDate(date: Date): string {
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear();
        if (this.props.showTime) {
            const h = date.getHours().toString().padStart(2, '0');
            const min = date.getMinutes().toString().padStart(2, '0');
            return `${y}-${m}-${d} ${h}:${min}`;
        }
        return `${y}-${m}-${d}`;
    }

    private handleManualInput(val: string): void {
        const date = new Date(val);
        if (!isNaN(date.getTime())) {
            this.updateProps({ value: date });
            if (this.props.onChange) this.props.onChange(date);
        }
    }

    private showPicker(): void {
        const pickerContent = document.createElement('div');
        Object.assign(pickerContent.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: Theme.spacing.sm,
            padding: Theme.spacing.sm
        });

        // Simple calendar grid for demo purposes
        const calendar = document.createElement('div');
        Object.assign(calendar.style, {
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '2px'
        });

        const now = this.props.value || new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 1; i <= daysInMonth; i++) {
            const day = document.createElement('div');
            day.textContent = String(i);
            Object.assign(day.style, {
                padding: '4px',
                textAlign: 'center',
                cursor: 'pointer',
                borderRadius: '2px',
                fontSize: '11px',
                border: i === now.getDate() ? `1px solid ${Theme.colors.accent}` : 'none',
                backgroundColor: i === now.getDate() ? 'rgba(59, 130, 246, 0.2)' : 'transparent'
            });

            this.addEventListener(day, 'click', () => {
                const selected = new Date(year, month, i);
                if (this.props.showTime) {
                    selected.setHours(now.getHours());
                    selected.setMinutes(now.getMinutes());
                }
                this.selectDate(selected);
            });

            calendar.appendChild(day);
        }

        pickerContent.appendChild(calendar);

        if (this.props.showTime) {
            const timeInput = document.createElement('input');
            timeInput.type = 'time';
            timeInput.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            timeInput.style.marginTop = Theme.spacing.sm;

            this.addEventListener(timeInput, 'change', () => {
                const [h, m] = timeInput.value.split(':');
                const selected = new Date(now);
                selected.setHours(parseInt(h), parseInt(m));
                this.selectDate(selected);
            });
            pickerContent.appendChild(timeInput);
        }

        this.popover = new Popover({
            anchor: this.input.getElement(),
            content: [pickerContent],
            placement: 'bottom'
        });
        this.popover.show();
    }

    private selectDate(date: Date): void {
        this.updateProps({ value: date });
        this.input.setValue(this.formatDate(date));
        if (this.props.onChange) this.props.onChange(date);
        if (!this.props.showTime) {
            this.popover?.hide();
            this.popover = null;
        }
    }
}
