// ui-lib/forms/TransferList.ts

import { BaseComponent } from '../BaseComponent';
import { Theme } from '../theme';
import { Button } from './Button';

export interface TransferItem {
    id: string;
    label: string;
}

export interface TransferListProps {
    leftItems: TransferItem[];
    rightItems: TransferItem[];
    onTransfer?: (leftItems: TransferItem[], rightItems: TransferItem[]) => void;
    leftTitle?: string;
    rightTitle?: string;
}

export class TransferList extends BaseComponent<TransferListProps> {
    private leftListEl: HTMLDivElement;
    private rightListEl: HTMLDivElement;
    private selectedLeft: Set<string> = new Set();
    private selectedRight: Set<string> = new Set();

    constructor(props: TransferListProps) {
        super('div', props);
        this.leftListEl = document.createElement('div');
        this.rightListEl = document.createElement('div');
        this.render();
    }

    public render(): void {
        const { leftTitle = 'Available', rightTitle = 'Selected' } = this.props;

        this.applyStyles({
            display: 'flex',
            alignItems: 'center',
            gap: Theme.spacing.md,
            height: '300px',
            width: '100%'
        });

        this.element.innerHTML = '';

        // Left Section
        const leftSection = this.createSection(leftTitle, this.props.leftItems, this.selectedLeft, this.leftListEl);

        // Control Buttons
        const controls = document.createElement('div');
        Object.assign(controls.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: Theme.spacing.sm
        });

        const toRight = new Button({
            icon: 'fas fa-chevron-right',
            disabled: this.selectedLeft.size === 0,
            onClick: () => this.transfer('right')
        });
        const toLeft = new Button({
            icon: 'fas fa-chevron-left',
            disabled: this.selectedRight.size === 0,
            onClick: () => this.transfer('left')
        });

        this.appendChild(toRight);
        this.appendChild(toLeft);
        controls.appendChild(toRight.getElement());
        controls.appendChild(toLeft.getElement());

        // Right Section
        const rightSection = this.createSection(rightTitle, this.props.rightItems, this.selectedRight, this.rightListEl);

        this.element.appendChild(leftSection);
        this.element.appendChild(controls);
        this.element.appendChild(rightSection);
    }

    private createSection(title: string, items: TransferItem[], selection: Set<string>, listEl: HTMLDivElement): HTMLElement {
        const section = document.createElement('div');
        Object.assign(section.style, {
            flex: '1',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            border: `1px solid ${Theme.colors.border}`,
            borderRadius: Theme.radius,
            backgroundColor: Theme.colors.bgSecondary
        });

        const header = document.createElement('div');
        header.textContent = title;
        Object.assign(header.style, {
            padding: Theme.spacing.sm,
            borderBottom: `1px solid ${Theme.colors.border}`,
            fontSize: '11px',
            fontWeight: '600',
            color: Theme.colors.textMuted,
            textTransform: 'uppercase'
        });

        listEl.innerHTML = '';
        Object.assign(listEl.style, {
            flex: '1',
            overflowY: 'auto'
        });

        items.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.textContent = item.label;
            const isSelected = selection.has(item.id);
            Object.assign(itemEl.style, {
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: Theme.font.sizeBase,
                color: Theme.colors.textMain,
                backgroundColor: isSelected ? 'var(--ui-bg-hover)' : 'transparent'
            });

            this.addEventListener(itemEl, 'click', () => {
                if (isSelected) selection.delete(item.id);
                else selection.add(item.id);
                this.render();
            });

            listEl.appendChild(itemEl);
        });

        section.appendChild(header);
        section.appendChild(listEl);
        return section;
    }

    private transfer(direction: 'left' | 'right'): void {
        const { leftItems, rightItems } = this.props;
        let newLeft = [...leftItems];
        let newRight = [...rightItems];

        if (direction === 'right') {
            const moving = newLeft.filter(i => this.selectedLeft.has(i.id));
            newLeft = newLeft.filter(i => !this.selectedLeft.has(i.id));
            newRight = [...newRight, ...moving];
            this.selectedLeft.clear();
        } else {
            const moving = newRight.filter(i => this.selectedRight.has(i.id));
            newRight = newRight.filter(i => !this.selectedRight.has(i.id));
            newLeft = [...newLeft, ...moving];
            this.selectedRight.clear();
        }

        this.updateProps({ leftItems: newLeft, rightItems: newRight });
        if (this.props.onTransfer) this.props.onTransfer(newLeft, newRight);
    }
}
