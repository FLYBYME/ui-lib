import { BaseComponent } from '../BaseComponent';
import { Theme } from '../theme';
import { Badge } from '../feedback/Badge';
import { Popover } from '../overlays/Popover';
import { VirtualList } from '../navigation/VirtualList';

export interface MultiSelectProps {
    options: { label: string; value: string }[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
}

export class MultiSelectTagInput extends BaseComponent<MultiSelectProps> {
    private container: HTMLDivElement;
    private activePopover: Popover | null = null;

    constructor(props: MultiSelectProps) {
        super('div', props);
        this.container = document.createElement('div');
        this.render();
    }

    public render(): void {
        this.element.innerHTML = '';
        this.container.innerHTML = '';
        const { options, selectedValues, placeholder = 'Select items...' } = this.props;

        this.applyStyles({
            display: 'flex',
            flexDirection: 'column',
            gap: Theme.spacing.xs,
            width: '100%'
        });

        Object.assign(this.container.style, {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            padding: Theme.spacing.xs,
            backgroundColor: Theme.colors.bgTertiary,
            border: `1px solid ${Theme.colors.border}`,
            borderRadius: Theme.radius,
            minHeight: '30px',
            cursor: 'pointer'
        });

        if (selectedValues.length === 0) {
            const placeholderEl = document.createElement('span');
            placeholderEl.textContent = placeholder;
            placeholderEl.style.color = Theme.colors.textMuted;
            placeholderEl.style.fontSize = Theme.font.sizeBase;
            this.container.appendChild(placeholderEl);
        } else {
            selectedValues.forEach(val => {
                const option = options.find(o => o.value === val);
                if (option) {
                    const badge = new Badge({
                        count: option.label,
                        variant: 'accent',
                        size: 'md'
                    });
                    const badgeEl = badge.getElement();
                    badgeEl.style.cursor = 'pointer';
                    badgeEl.onclick = (e) => {
                        e.stopPropagation();
                        const next = selectedValues.filter(v => v !== val);
                        this.updateProps({ selectedValues: next });
                        if (this.props.onChange) this.props.onChange(next);
                    };
                    this.container.appendChild(badgeEl);
                }
            });
        }

        this.container.onclick = () => this.showDropdown();
        this.element.appendChild(this.container);

        if (this.activePopover) {
            const virtualList = new VirtualList<{ label: string; value: string }>({
                items: this.props.options,
                itemHeight: 32,
                height: '300px',
                renderItem: (opt, index) => this.renderDropdownItem(opt)
            });
            this.activePopover.updateProps({ content: [virtualList.getElement()] });
            this.appendChild(virtualList);
        }
    }

    private showDropdown(): void {
        if (this.activePopover) {
            this.activePopover.hide();
            this.activePopover = null;
            return;
        }

        const virtualList = new VirtualList<{ label: string; value: string }>({
            items: this.props.options,
            itemHeight: 32,
            height: '300px',
            renderItem: (opt, index) => this.renderDropdownItem(opt)
        });

        this.activePopover = new Popover({
            anchor: this.container,
            content: [virtualList.getElement()],
            placement: 'bottom',
            onClose: () => { this.activePopover = null; }
        });
        this.appendChild(virtualList);
        this.activePopover.show();
    }

    private renderDropdownItem(opt: { label: string; value: string }): HTMLElement {
        const isSelected = this.props.selectedValues.includes(opt.value);
        const el = document.createElement('div');
        Object.assign(el.style, {
            padding: `4px ${Theme.spacing.md}`,
            cursor: 'pointer',
            backgroundColor: isSelected ? Theme.colors.bgSecondary : Theme.colors.bgPrimary,
            color: Theme.colors.textMain,
            height: '32px',
            boxSizing: 'border-box'
        });

        el.onmouseenter = () => {
            if (!isSelected) el.style.backgroundColor = Theme.colors.bgTertiary;
        };
        el.onmouseleave = () => {
            if (!isSelected) el.style.backgroundColor = Theme.colors.bgPrimary;
        };

        el.onclick = () => {
            const next = isSelected
                ? this.props.selectedValues.filter(v => v !== opt.value)
                : [...this.props.selectedValues, opt.value];
            this.updateProps({ selectedValues: next });
            if (this.props.onChange) this.props.onChange(next);
        };
        el.textContent = opt.label;
        return el;
    }

    public destroy(): void {
        if (this.activePopover) {
            this.activePopover.hide();
        }
        super.destroy();
    }
}