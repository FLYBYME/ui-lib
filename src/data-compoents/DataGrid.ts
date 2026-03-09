// ui-lib/data-compoents/DataGrid.ts

import { BaseComponent } from '../BaseComponent';
import { Theme } from '../theme';
import { VirtualList } from '../navigation/VirtualList';
import { Splitter } from '../layout/Splitter';

export interface DataGridColumn<T> {
    key: keyof T | string;
    header: string;
    width: number;
    render?: (item: T) => (BaseComponent<any> | HTMLElement | string);
}

export interface DataGridProps<T> {
    data: T[];
    columns: DataGridColumn<T>[];
    itemHeight?: number;
    height?: string;
}

export class DataGrid<T = any> extends BaseComponent<DataGridProps<T>> {
    private headerEl: HTMLDivElement;
    private bodyWrapperEl: HTMLDivElement;
    private virtualList: VirtualList<T> | null = null;
    private columnWidths: Map<string, number> = new Map();
    private scrollLeft: number = 0;

    constructor(props: DataGridProps<T>) {
        super('div', props);
        this.headerEl = document.createElement('div');
        this.bodyWrapperEl = document.createElement('div');
        props.columns.forEach(col => this.columnWidths.set(col.key as string, col.width));
        this.render();
    }

    public render(): void {
        const { data, columns, itemHeight = 32, height = '400px' } = this.props;

        this.applyStyles({
            display: 'flex',
            flexDirection: 'column',
            height,
            width: '100%',
            backgroundColor: Theme.colors.bgSecondary,
            border: `1px solid ${Theme.colors.border}`,
            borderRadius: Theme.radius,
            overflowX: 'auto',
            overflowY: 'hidden',
            position: 'relative'
        });

        this.element.innerHTML = '';
        this.renderHeader();

        this.bodyWrapperEl.style.flex = '1';
        this.bodyWrapperEl.style.overflow = 'hidden';
        this.bodyWrapperEl.style.position = 'relative';
        this.element.appendChild(this.bodyWrapperEl);

        if (this.virtualList) {
            this.virtualList.dispose();
        }

        const totalWidth = Array.from(this.columnWidths.values()).reduce((a, b) => a + b, 0);

        this.virtualList = new VirtualList<T>({
            items: data,
            itemHeight,
            renderItem: (item) => this.renderRow(item)
        });

        this.appendChild(this.virtualList);
        this.bodyWrapperEl.appendChild(this.virtualList.getElement());
        this.virtualList.getElement().style.width = `${totalWidth}px`;

        this.addEventListener(this.element, 'scroll', () => {
            if (this.scrollLeft !== this.element.scrollLeft) {
                this.scrollLeft = this.element.scrollLeft;
                this.updateVisibleColumns();
            }
        });
    }

    private updateVisibleColumns(): void {
        // Force re-render of current visible items in VirtualList
        this.virtualList?.updateProps({});
    }

    private renderHeader(): void {
        this.headerEl.innerHTML = '';
        const totalWidth = Array.from(this.columnWidths.values()).reduce((a, b) => a + b, 0);
        
        Object.assign(this.headerEl.style, {
            display: 'flex',
            backgroundColor: Theme.colors.bgTertiary,
            borderBottom: `2px solid ${Theme.colors.border}`,
            height: '32px',
            alignItems: 'center',
            width: `${totalWidth}px`
        });

        this.props.columns.forEach((col, index) => {
            const cell = document.createElement('div');
            const width = this.columnWidths.get(col.key as string) || col.width;
            
            Object.assign(cell.style, {
                width: `${width}px`,
                padding: '0 12px',
                fontSize: '11px',
                fontWeight: '600',
                color: Theme.colors.textMuted,
                display: 'flex',
                alignItems: 'center',
                flexShrink: '0',
                position: 'relative'
            });
            cell.textContent = col.header;

            if (index < this.props.columns.length - 1) {
                const splitter = new Splitter({
                    orientation: 'vertical',
                    onResize: (delta) => {
                        const newWidth = Math.max(50, width + delta);
                        this.columnWidths.set(col.key as string, newWidth);
                        this.render(); // Re-render everything if column widths change
                    }
                });
                this.appendChild(splitter);
                cell.appendChild(splitter.getElement());
                splitter.getElement().style.position = 'absolute';
                splitter.getElement().style.right = '-2px';
                splitter.getElement().style.top = '0';
                splitter.getElement().style.bottom = '0';
            }

            this.headerEl.appendChild(cell);
        });

        this.element.appendChild(this.headerEl);
    }

    private renderRow(item: T): HTMLElement {
        const row = document.createElement('div');
        const viewportWidth = this.element.clientWidth;
        
        Object.assign(row.style, {
            display: 'flex',
            borderBottom: `1px solid ${Theme.colors.border}`,
            height: `${this.props.itemHeight || 32}px`,
            alignItems: 'center',
            position: 'relative'
        });

        let currentX = 0;
        this.props.columns.forEach(col => {
            const width = this.columnWidths.get(col.key as string) || col.width;
            
            // Horizontal virtualization check
            const isVisible = (currentX + width > this.scrollLeft) && (currentX < this.scrollLeft + viewportWidth);

            if (isVisible) {
                const cell = document.createElement('div');
                Object.assign(cell.style, {
                    position: 'absolute',
                    left: `${currentX}px`,
                    width: `${width}px`,
                    padding: '0 12px',
                    fontSize: Theme.font.sizeBase,
                    color: Theme.colors.textMain,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flexShrink: '0'
                });

                if (col.render) {
                    const rendered = col.render(item);
                    if (rendered instanceof BaseComponent) {
                        cell.appendChild(rendered.getElement());
                    } else if (rendered instanceof HTMLElement) {
                        cell.appendChild(rendered);
                    } else {
                        cell.textContent = rendered;
                    }
                } else {
                    cell.textContent = String((item as any)[col.key]);
                }
                row.appendChild(cell);
            }
            currentX += width;
        });

        return row;
    }
}
