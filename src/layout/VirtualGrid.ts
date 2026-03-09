// ui-lib/layout/VirtualGrid.ts

import { BaseComponent } from '../BaseComponent';
import { Theme } from '../theme';

export interface VirtualGridProps<T> {
    items: T[];
    itemWidth: number;
    itemHeight: number;
    renderItem: (item: T, index: number) => BaseComponent<any> | HTMLElement;
    gap?: number;
}

export class VirtualGrid<T> extends BaseComponent<VirtualGridProps<T>> {
    private container: HTMLDivElement;
    private content: HTMLDivElement;
    private columns: number = 0;

    constructor(props: VirtualGridProps<T>) {
        super('div', props);

        this.container = document.createElement('div');
        this.content = document.createElement('div');

        this.element.appendChild(this.container);
        this.container.appendChild(this.content);

        this.initResizeObserver();
        this.addEventListener(this.element, 'scroll', () => this.updateVisibleItems());
        
        this.render();
    }

    private initResizeObserver(): void {
        const observer = new ResizeObserver(() => {
            this.recalculateColumns();
        });
        observer.observe(this.element);
        this.disposables.push({ dispose: () => observer.disconnect() });
    }

    private recalculateColumns(): void {
        const { itemWidth, gap = 0 } = this.props;
        const containerWidth = this.element.clientWidth;
        const newColumns = Math.max(1, Math.floor((containerWidth + gap) / (itemWidth + gap)));
        
        if (newColumns !== this.columns) {
            this.columns = newColumns;
            this.updateVisibleItems();
        }
    }

    public render(): void {
        this.applyStyles({
            width: '100%',
            height: '100%',
            overflowY: 'auto',
            position: 'relative'
        });

        this.container.style.position = 'relative';
        this.content.style.position = 'absolute';
        this.content.style.top = '0';
        this.content.style.left = '0';
        this.content.style.width = '100%';

        this.recalculateColumns();
    }

    private updateVisibleItems(): void {
        if (this.columns === 0) return;

        const { items, itemWidth, itemHeight, renderItem, gap = 0 } = this.props;
        const scrollTop = this.element.scrollTop;
        const viewportHeight = this.element.clientHeight;

        const rowCount = Math.ceil(items.length / this.columns);
        this.container.style.height = `${rowCount * (itemHeight + gap)}px`;

        const startRow = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)));
        const endRow = Math.min(rowCount, Math.ceil((scrollTop + viewportHeight) / (itemHeight + gap)));

        this.clear();
        this.content.style.transform = `translateY(${startRow * (itemHeight + gap)}px)`;
        
        const grid = document.createElement('div');
        Object.assign(grid.style, {
            display: 'grid',
            gridTemplateColumns: `repeat(${this.columns}, ${itemWidth}px)`,
            gap: `${gap}px`,
            width: 'fit-content',
            margin: '0 auto'
        });
        this.content.appendChild(grid);

        for (let r = startRow; r < endRow; r++) {
            for (let c = 0; c < this.columns; c++) {
                const index = r * this.columns + c;
                if (index >= items.length) break;

                const item = items[index];
                const rendered = renderItem(item, index);
                if (rendered instanceof BaseComponent) {
                    this.appendChild(rendered);
                    grid.appendChild(rendered.getElement());
                } else {
                    grid.appendChild(rendered);
                }
            }
        }
    }

    public setItems(items: T[]): void {
        this.updateProps({ items });
    }
}
