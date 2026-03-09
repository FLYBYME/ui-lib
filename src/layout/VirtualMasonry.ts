// ui-lib/layout/VirtualMasonry.ts

import { BaseComponent } from '../BaseComponent';
import { Theme } from '../theme';

export interface VirtualMasonryProps<T> {
    items: T[];
    columnCount: number;
    renderItem: (item: T, index: number) => BaseComponent<any> | HTMLElement;
    gap?: number;
    itemHeightFallback?: number;
}

export class VirtualMasonry<T> extends BaseComponent<VirtualMasonryProps<T>> {
    private container: HTMLDivElement;
    private content: HTMLDivElement;
    private itemPositions: { top: number, left: number, width: number, height: number, index: number }[] = [];
    private columnHeights: number[] = [];

    constructor(props: VirtualMasonryProps<T>) {
        super('div', props);

        this.container = document.createElement('div');
        this.content = document.createElement('div');

        this.element.appendChild(this.container);
        this.container.appendChild(this.content);

        this.addEventListener(this.element, 'scroll', () => this.updateVisibleItems());
        this.initResizeObserver();
        
        this.render();
    }

    private initResizeObserver(): void {
        const observer = new ResizeObserver(() => {
            this.recalculateMasonry();
        });
        observer.observe(this.element);
        this.disposables.push({ dispose: () => observer.disconnect() });
    }

    private recalculateMasonry(): void {
        const { items, columnCount, gap = 16, itemHeightFallback = 200 } = this.props;
        const containerWidth = this.element.clientWidth;
        const columnWidth = (containerWidth - (columnCount - 1) * gap) / columnCount;

        this.columnHeights = Array(columnCount).fill(0);
        this.itemPositions = [];

        items.forEach((item, index) => {
            // Find the shortest column
            let shortestColumnIndex = 0;
            let minHeight = this.columnHeights[0];
            for (let i = 1; i < columnCount; i++) {
                if (this.columnHeights[i] < minHeight) {
                    minHeight = this.columnHeights[i];
                    shortestColumnIndex = i;
                }
            }

            const left = shortestColumnIndex * (columnWidth + gap);
            const top = minHeight;
            
            // Assume fallback height for layout calculation if not already known
            // In a more advanced version, we'd adjust after measuring
            const height = itemHeightFallback;

            this.itemPositions.push({ top, left, width: columnWidth, height, index });
            this.columnHeights[shortestColumnIndex] += height + gap;
        });

        const maxHeight = Math.max(...this.columnHeights);
        this.container.style.height = `${maxHeight}px`;

        this.updateVisibleItems();
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

        this.recalculateMasonry();
    }

    private updateVisibleItems(): void {
        const scrollTop = this.element.scrollTop;
        const viewportHeight = this.element.clientHeight;
        const buffer = 300; // Extra pixels to render

        const visibleItems = this.itemPositions.filter(pos => 
            pos.top + pos.height > scrollTop - buffer && 
            pos.top < scrollTop + viewportHeight + buffer
        );

        this.clear();
        
        visibleItems.forEach(pos => {
            const { items, renderItem } = this.props;
            const item = items[pos.index];
            const rendered = renderItem(item, pos.index);
            let renderedEl: HTMLElement;

            if (rendered instanceof BaseComponent) {
                this.appendChild(rendered);
                renderedEl = rendered.getElement();
            } else {
                renderedEl = rendered;
            }

            renderedEl.style.position = 'absolute';
            renderedEl.style.top = `${pos.top}px`;
            renderedEl.style.left = `${pos.left}px`;
            renderedEl.style.width = `${pos.width}px`;
            
            this.content.appendChild(renderedEl);

            // If we didn't have a known height, we should measure and re-trigger layout
            // but for simplicity we rely on fallback height in this implementation
        });
    }

    public setItems(items: T[]): void {
        this.updateProps({ items });
    }
}
