import { BaseComponent, BaseComponentProps } from '../BaseComponent';
import { Theme } from '../theme';
import { Stack } from '../layout/Stack';
import { Tab } from './Tab';

export interface TabPanelItem {
    id: string;
    label: string;
    icon?: string;
    content: BaseComponent<any> | HTMLElement;
}

export interface TabPanelProps extends BaseComponentProps {
    items: TabPanelItem[];
    activeTabId?: string;
    onTabChange?: (id: string) => void;
}

export class TabPanel extends BaseComponent<TabPanelProps> {
    private activeTabId: string;

    constructor(props: TabPanelProps) {
        super('div', props);
        this.activeTabId = props.activeTabId || props.items[0]?.id || '';
        this.render();
    }

    public render(): void {
        this.element.innerHTML = '';
        const { items } = this.props;

        this.applyStyles({
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%'
        });

        const headerContainer = document.createElement('div');
        Object.assign(headerContainer.style, {
            display: 'flex',
            flexDirection: 'row',
            height: '35px',
            width: '100%',
            alignItems: 'center',
            backgroundColor: Theme.colors.bgSecondary,
            borderBottom: `1px solid ${Theme.colors.border}`,
            boxSizing: 'border-box'
        });

        items.forEach(item => {
            const tab = new Tab({
                label: item.label,
                icon: item.icon,
                active: item.id === this.activeTabId,
                closable: false,
                onClick: () => {
                    this.activeTabId = item.id;
                    this.render();
                    if (this.props.onTabChange) this.props.onTabChange(item.id);
                }
            });
            headerContainer.appendChild(tab.getElement());
        });

        const contentArea = new Stack({
            fill: true,
            padding: 'none',
            scrollable: true
        });

        const activeItem = items.find(i => i.id === this.activeTabId);
        if (activeItem) {
            contentArea.appendChildren(activeItem.content);
        }

        this.element.appendChild(headerContainer);
        this.element.appendChild(contentArea.getElement());
    }
}
