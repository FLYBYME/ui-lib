import { BaseComponent } from '../BaseComponent';
import { Theme } from '../theme';
import { Row } from '../layout/Row';
import { Stack } from '../layout/Stack';
import { Text } from '../typography/Text';

export interface PropertyItem {
    label: string;
    description?: string;
    control: BaseComponent<any> | HTMLElement;
    group?: string; // Optional group header
}

export interface PropertyGridProps {
    items: PropertyItem[];
}

export class PropertyGrid extends BaseComponent<PropertyGridProps> {
    constructor(props: PropertyGridProps) {
        super('div', props);
        this.render();
    }

    public render(): void {
        this.element.innerHTML = '';

        const container = new Stack({
            direction: 'column',
            gap: 'md',
            width: '100%'
        });

        let currentGroup: string | undefined;

        this.props.items.forEach(item => {
            if (item.group && item.group !== currentGroup) {
                currentGroup = item.group;
                const groupHeader = new Text({
                    text: currentGroup,
                    weight: '700',
                    size: 'lg',
                    variant: 'primary'
                });
                const headerContainer = document.createElement('div');
                headerContainer.style.marginTop = Theme.spacing.lg;
                headerContainer.style.marginBottom = Theme.spacing.xs;
                headerContainer.style.borderBottom = `1px solid ${Theme.colors.border}`;
                headerContainer.style.paddingBottom = Theme.spacing.xs;
                headerContainer.appendChild(groupHeader.getElement());
                container.appendChildren(headerContainer);
            }

            const row = new Row({
                align: 'center',
                justify: 'space-between',
                padding: 'none'
            });

            const labelStack = new Stack({ direction: 'column', gap: 'xs' });
            labelStack.appendChildren(new Text({ text: item.label, weight: '600' }));

            if (item.description) {
                labelStack.appendChildren(new Text({
                    text: item.description,
                    variant: 'muted',
                    size: 'sm'
                }));
            }

            const controlContainer = document.createElement('div');
            controlContainer.style.minWidth = '160px'; // Increased min-width for better control visibility
            controlContainer.style.display = 'flex';
            controlContainer.style.justifyContent = 'flex-end';

            if (item.control instanceof BaseComponent) {
                controlContainer.appendChild(item.control.getElement());
            } else {
                controlContainer.appendChild(item.control);
            }

            row.appendChildren(labelStack, controlContainer);
            container.appendChildren(row);
        });

        this.appendChildren(container);
    }
}