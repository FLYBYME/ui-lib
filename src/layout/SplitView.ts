import { BaseComponent } from '../BaseComponent';

export interface SplitViewOptions {
    orientation?: 'horizontal' | 'vertical';
    panes: HTMLElement[];
    initialSizes?: number[];
    minSizes?: number[];
}

export class SplitView extends BaseComponent {
    public orientation: 'horizontal' | 'vertical';
    public panes: HTMLElement[];
    public sizes: number[];
    public minSizes: number[];
    private activeResizerIndex: number | null = null;
    private startX: number = 0;
    private startY: number = 0;
    private startSizes: number[] = [];

    constructor(options: SplitViewOptions) {
        super('div', options);
        this.orientation = options.orientation || 'horizontal';
        this.panes = options.panes;
        this.sizes = options.initialSizes || this.panes.map(() => 100 / this.panes.length);
        this.minSizes = options.minSizes || this.panes.map(() => 50);

        this.element.classList.add('split-view', this.orientation);
        this.render();
    }

    render(): void {
        this.element.innerHTML = '';
        this.panes.forEach((pane, index) => {
            pane.classList.add('split-pane');
            this.element.appendChild(pane);

            if (index < this.panes.length - 1) {
                const resizer = this.createResizer(index);
                this.element.appendChild(resizer);
            }
        });
        this.updateDOM();
    }

    private createResizer(index: number): HTMLElement {
        const resizer = document.createElement('div');
        resizer.className = 'resizer';
        resizer.addEventListener('pointerdown', (e) => this.handlePointerDown(index, e));
        return resizer;
    }

    private handlePointerDown(index: number, e: PointerEvent): void {
        this.activeResizerIndex = index;
        this.startX = e.clientX;
        this.startY = e.clientY;

        // Capture exact pixel widths at the start of the drag
        this.startSizes = this.panes.map(p =>
            this.orientation === 'horizontal' ? p.getBoundingClientRect().width : p.getBoundingClientRect().height
        );

        // Prevent text selection glitching while dragging
        e.preventDefault();
        document.body.style.cursor = this.orientation === 'horizontal' ? 'col-resize' : 'row-resize';

        // Listeners refer to the arrow functions, so they can be perfectly removed later
        document.addEventListener('pointermove', this.handlePointerMove);
        document.addEventListener('pointerup', this.handlePointerUp);
    }

    // Use an Arrow Function to permanently bind 'this', fixing the memory leak
    private handlePointerMove = (e: PointerEvent): void => {
        if (this.activeResizerIndex === null) return;

        const delta = this.orientation === 'horizontal'
            ? e.clientX - this.startX
            : e.clientY - this.startY;

        let newPrevSize = this.startSizes[this.activeResizerIndex] + delta;
        let newNextSize = this.startSizes[this.activeResizerIndex + 1] - delta;

        const minPrev = this.minSizes[this.activeResizerIndex] || 0;
        const minNext = this.minSizes[this.activeResizerIndex + 1] || 0;

        // Smarter Clamping: Instead of aborting the function if we hit the limit,
        // we forcefully clamp the sizes and transfer the excess to the adjacent pane.
        if (newPrevSize < minPrev) {
            newNextSize = newNextSize - (minPrev - newPrevSize);
            newPrevSize = minPrev;
        } else if (newNextSize < minNext) {
            newPrevSize = newPrevSize - (minNext - newNextSize);
            newNextSize = minNext;
        }

        this.sizes[this.activeResizerIndex] = newPrevSize;
        this.sizes[this.activeResizerIndex + 1] = newNextSize;

        this.updateDOM();
    };

    // Use an Arrow Function here as well
    private handlePointerUp = (): void => {
        document.removeEventListener('pointermove', this.handlePointerMove);
        document.removeEventListener('pointerup', this.handlePointerUp);

        this.activeResizerIndex = null;
        document.body.style.cursor = ''; // Restore cursor
    };

    private updateDOM(): void {
        this.panes.forEach((pane, index) => {
            // Apply flex proportion
            pane.style.flex = `${this.sizes[index]} 1 0%`;

            // CRITICAL FIX: Explicitly enforce the minimum constraints on the DOM element 
            // so Flexbox honors them when the browser window is resized.
            if (this.orientation === 'horizontal') {
                pane.style.minWidth = `${this.minSizes[index] || 0}px`;
            } else {
                pane.style.minHeight = `${this.minSizes[index] || 0}px`;
            }
        });
    }
}