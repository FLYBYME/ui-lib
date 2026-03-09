// ui-lib/navigation/VirtualList.ts

import { BaseComponent } from '../BaseComponent';

export interface VirtualListProps<T> {
    items: T[];
    itemHeight?: number; // fallback height if not specified/measured
    renderItem: (item: T, index: number) => BaseComponent<any> | HTMLElement;
    height?: string;
    useWindowScroll?: boolean;
}

export class VirtualList<T> extends BaseComponent<VirtualListProps<T>> {
    private container: HTMLDivElement;
    private spacer: HTMLDivElement;
    private content: HTMLDivElement;
    private heightCache: Map<number, number> = new Map();
    private totalMeasuredHeight: number = 0;

    constructor(props: VirtualListProps<T>) {
        super('div', props);

        this.container = document.createElement('div');
        this.spacer = document.createElement('div');
        this.content = document.createElement('div');

        this.element.appendChild(this.container);
        this.container.appendChild(this.spacer);
        this.container.appendChild(this.content);

        this.render();
        this.initScrollListener();
        this.initResizeObserver();
    }

    private initResizeObserver(): void {
        const observer = new ResizeObserver(() => {
            this.updateVisibleItems();
        });
        observer.observe(this.element);
        this.disposables.push({ dispose: () => observer.disconnect() });
    }

    public render(): void {
        const { height = '100%', items, useWindowScroll } = this.props;

        this.applyStyles({
            height: useWindowScroll ? 'auto' : height,
            width: '100%',
            overflowY: useWindowScroll ? 'visible' : 'auto',
            position: 'relative',
        });

        this.container.style.position = 'relative';
        this.updateTotalHeight();

        this.content.style.position = 'absolute';
        this.content.style.top = '0';
        this.content.style.left = '0';
        this.content.style.width = '100%';

        this.updateVisibleItems();
    }

    private updateTotalHeight(): void {
        const { items, itemHeight = 40 } = this.props;
        let total = 0;
        for (let i = 0; i < items.length; i++) {
            total += this.heightCache.get(i) || itemHeight;
        }
        this.container.style.height = `${total}px`;
    }

    private initScrollListener(): void {
        const target = this.props.useWindowScroll ? window : this.element;
        this.addEventListener(target as any, 'scroll', () => this.updateVisibleItems());
    }

    private updateVisibleItems(): void {
        const { items, itemHeight = 40, renderItem, useWindowScroll } = this.props;
        
        let scrollTop = useWindowScroll ? window.scrollY : this.element.scrollTop;
        const viewportHeight = useWindowScroll ? window.innerHeight : this.element.clientHeight;

        if (useWindowScroll) {
            const rect = this.element.getBoundingClientRect();
            scrollTop = Math.max(0, -rect.top);
        }

        // Find starting index from cumulative heights
        let currentY = 0;
        let startIndex = 0;
        while (startIndex < items.length - 1 && currentY + (this.heightCache.get(startIndex) || itemHeight) < scrollTop) {
            currentY += this.heightCache.get(startIndex) || itemHeight;
            startIndex++;
        }

        this.clear();
        this.content.style.transform = `translateY(${currentY}px)`;

        let renderedY = currentY;
        let endIndex = startIndex;
        
        // Render enough items to fulfill viewport
        while (endIndex < items.length && renderedY < scrollTop + viewportHeight) {
            const item = items[endIndex];
            const rendered = renderItem(item, endIndex);
            let renderedEl: HTMLElement;

            if (rendered instanceof BaseComponent) {
                this.appendChild(rendered);
                renderedEl = rendered.getElement();
            } else {
                renderedEl = rendered;
            }
            this.content.appendChild(renderedEl);

            // Measure and cache
            const measuredHeight = renderedEl.offsetHeight;
            if (measuredHeight > 0 && this.heightCache.get(endIndex) !== measuredHeight) {
                this.heightCache.set(endIndex, measuredHeight);
                // Total height may have changed, so we trigger a re-render next scroll or manually
            }

            renderedY += measuredHeight || itemHeight;
            endIndex++;
        }

        this.updateTotalHeight();
    }

    public setItems(items: T[]): void {
        this.updateProps({ items });
    }
}
