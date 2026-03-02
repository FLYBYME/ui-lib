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

        this.applyBaseStyles(); // Inject styles via TS
        this.render();
    }

    /**
     * Replaces the missing ui-lib.css by applying critical layout properties.
     */
    private applyBaseStyles(): void {
        Object.assign(this.element.style, {
            display: 'flex',
            flexDirection: this.orientation === 'horizontal' ? 'row' : 'column',
            width: '100%',
            height: '100%',
            overflow: 'hidden'
        });
    }

    render(): void {
        this.element.innerHTML = '';
        this.panes.forEach((pane, index) => {
            Object.assign(pane.style, {
                overflow: 'auto',
                boxSizing: 'border-box',
                position: 'relative'
            });
            this.element.appendChild(pane);

            if (index < this.panes.length - 1) {
                this.element.appendChild(this.createResizer(index));
            }
        });
        this.updateDOM();
    }

    private createResizer(index: number): HTMLElement {
        const resizer = document.createElement('div');
        // Standard IDE resizer styling
        Object.assign(resizer.style, {
            flex: '0 0 4px', // flex-shrink: 0 prevents the resizer from disappearing
            backgroundColor: 'rgba(0,0,0,0.2)',
            cursor: this.orientation === 'horizontal' ? 'col-resize' : 'row-resize',
            zIndex: '100',
            transition: 'background-color 0.2s'
        });

        resizer.addEventListener('pointerdown', (e) => this.handlePointerDown(index, e));
        return resizer;
    }

    private handlePointerDown(index: number, e: PointerEvent): void {
        this.activeResizerIndex = index;
        this.startX = e.clientX;
        this.startY = e.clientY;

        // Accurate pixel snapshots [cite: 213, 214]
        this.startSizes = this.panes.map(p =>
            this.orientation === 'horizontal' ? p.offsetWidth : p.offsetHeight
        );

        // Fixes the "splitting resizer" bug by using stable references
        document.addEventListener('pointermove', this.handlePointerMove);
        document.addEventListener('pointerup', this.handlePointerUp);

        this.element.setPointerCapture(e.pointerId);
        document.body.style.cursor = this.orientation === 'horizontal' ? 'col-resize' : 'row-resize';
    }

    /**
     * Logic for pane constraints and adjacent pane updates
     */
    private handlePointerMove = (e: PointerEvent): void => {
        if (this.activeResizerIndex === null) return;

        const delta = this.orientation === 'horizontal'
            ? e.clientX - this.startX
            : e.clientY - this.startY;

        const i = this.activeResizerIndex;
        let newPrevSize = this.startSizes[i] + delta;
        let newNextSize = this.startSizes[i + 1] - delta;

        const minPrev = this.minSizes[i] || 40;
        const minNext = this.minSizes[i + 1] || 40;

        // Constraint Enforcement: prevents panels from hiding on the right 
        if (newPrevSize < minPrev) {
            newPrevSize = minPrev;
            newNextSize = this.startSizes[i] + this.startSizes[i + 1] - minPrev;
        } else if (newNextSize < minNext) {
            newNextSize = minNext;
            newPrevSize = this.startSizes[i] + this.startSizes[i + 1] - minNext;
        }

        this.sizes[i] = newPrevSize;
        this.sizes[i + 1] = newNextSize;

        this.updateDOM();
    };

    private handlePointerUp = (e: PointerEvent): void => {
        document.removeEventListener('pointermove', this.handlePointerMove);
        document.removeEventListener('pointerup', this.handlePointerUp);
        this.element.releasePointerCapture(e.pointerId);
        this.activeResizerIndex = null;
        document.body.style.cursor = '';
    };

    private updateDOM(): void {
        this.panes.forEach((pane, index) => {
            // Using pixels for absolute stability in complex layouts 
            const sizeStyle = this.orientation === 'horizontal' ? 'width' : 'height';
            const minStyle = this.orientation === 'horizontal' ? 'minWidth' : 'minHeight';

            pane.style.flex = `0 0 ${this.sizes[index]}px`;
            pane.style[sizeStyle] = `${this.sizes[index]}px`;
            pane.style[minStyle] = `${this.minSizes[index] || 0}px`;
        });
    }
}