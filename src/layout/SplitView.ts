import { BaseComponent, BaseComponentProps } from '../BaseComponent';

export interface SplitViewOptions extends BaseComponentProps {
    orientation?: 'horizontal' | 'vertical';
    panes: HTMLElement[];
    initialSizes?: number[]; // Percentages (0-100) or pixels
    minSizes?: number[];     // Pixels
}

export class SplitView extends BaseComponent<SplitViewOptions> {
    private orientation: 'horizontal' | 'vertical';
    private panes: HTMLElement[];
    private sizes: number[];
    private minSizes: number[];

    private activeResizerIndex: number | null = null;
    private startX = 0;
    private startY = 0;
    private startSizes: number[] = [];

    constructor(options: SplitViewOptions) {
        super('div', options);
        this.orientation = options.orientation || 'horizontal';
        this.panes = options.panes;
        this.minSizes = options.minSizes || this.panes.map(() => 50);

        // Initialize sizes as percentages if not provided
        this.sizes = options.initialSizes || this.panes.map(() => 100 / this.panes.length);

        this.setupStyles();
        this.render();
        this.setupResizeObserver();
    }

    private setupStyles(): void {
        this.addClasses('ui-splitview', `is-${this.orientation}`);
        Object.assign(this.element.style, {
            display: 'flex',
            flexDirection: this.orientation === 'horizontal' ? 'row' : 'column',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            position: 'relative'
        });
    }

    /**
     * Watches the container size to ensure internal pixel math stays valid
     * if the window or parent element resizes.
     */
    private setupResizeObserver(): void {
        const observer = new ResizeObserver(() => this.updateDOM());
        observer.observe(this.element);
        this.disposables.push({ dispose: () => observer.disconnect() });
    }

    public render(): void {
        this.element.innerHTML = '';

        this.panes.forEach((pane, index) => {
            Object.assign(pane.style, {
                overflow: 'auto',
                boxSizing: 'border-box',
                flexShrink: '0', // Vital for pixel-based sizing
                flexGrow: '0'
            });

            this.element.appendChild(pane);

            if (index < this.panes.length - 1) {
                const resizer = this.createResizer(index);
                this.element.appendChild(resizer);
            }
        });

        // Use requestAnimationFrame for the initial layout pass
        requestAnimationFrame(() => this.updateDOM());
    }

    private createResizer(index: number): HTMLElement {
        const resizer = document.createElement('div');
        const isHoriz = this.orientation === 'horizontal';

        // Visual Resizer Bar
        Object.assign(resizer.style, {
            flex: `0 0 4px`,
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
            cursor: isHoriz ? 'col-resize' : 'row-resize',
            zIndex: '10',
            position: 'relative',
            transition: 'background-color 0.2s'
        });

        // Invisible "Hit-Box" for easier grabbing (12px wide)
        const hitBox = document.createElement('div');
        Object.assign(hitBox.style, {
            position: 'absolute',
            top: isHoriz ? '0' : '-4px',
            bottom: isHoriz ? '0' : '-4px',
            left: isHoriz ? '-4px' : '0',
            right: isHoriz ? '-4px' : '0',
            zIndex: '11',
            cursor: isHoriz ? 'col-resize' : 'row-resize'
        });
        resizer.appendChild(hitBox);

        // Hover effects
        resizer.onmouseenter = () => resizer.style.backgroundColor = '#007acc';
        resizer.onmouseleave = () => {
            if (this.activeResizerIndex === null) resizer.style.backgroundColor = 'rgba(0,0,0,0.15)';
        };

        const onPointerDown = (e: PointerEvent) => this.handlePointerDown(index, e);
        resizer.addEventListener('pointerdown', onPointerDown);

        return resizer;
    }

    private handlePointerDown(index: number, e: PointerEvent): void {
        this.activeResizerIndex = index;
        this.startX = e.clientX;
        this.startY = e.clientY;

        // Capture current pixel widths/heights
        this.startSizes = this.panes.map(p =>
            this.orientation === 'horizontal' ? p.getBoundingClientRect().width : p.getBoundingClientRect().height
        );

        this.element.setPointerCapture(e.pointerId);

        // Use arrow functions bound to instance for clean removal
        document.addEventListener('pointermove', this.handlePointerMove);
        document.addEventListener('pointerup', this.handlePointerUp);

        document.body.style.cursor = this.orientation === 'horizontal' ? 'col-resize' : 'row-resize';
        this.element.style.userSelect = 'none'; // Prevent text selection while dragging
    }

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

        // Boundary enforcement
        if (newPrevSize < minPrev) {
            newPrevSize = minPrev;
            newNextSize = this.startSizes[i] + this.startSizes[i + 1] - minPrev;
        } else if (newNextSize < minNext) {
            newNextSize = minNext;
            newPrevSize = this.startSizes[i] + this.startSizes[i + 1] - minNext;
        }

        // Update local state
        this.sizes[i] = newPrevSize;
        this.sizes[i + 1] = newNextSize;

        this.updateDOM();
    };

    private handlePointerUp = (e: PointerEvent): void => {
        document.removeEventListener('pointermove', this.handlePointerMove);
        document.removeEventListener('pointerup', this.handlePointerUp);

        if (this.element.hasPointerCapture(e.pointerId)) {
            this.element.releasePointerCapture(e.pointerId);
        }

        this.activeResizerIndex = null;
        document.body.style.cursor = '';
        this.element.style.userSelect = '';
    };

    private updateDOM(): void {
        const isHoriz = this.orientation === 'horizontal';
        const totalAvailable = isHoriz ? this.element.clientWidth : this.element.clientHeight;

        // Subtract resizer widths (4px each) from the available space for calculations
        const resizerSpace = (this.panes.length - 1) * 4;
        const contentSpace = totalAvailable - resizerSpace;

        this.panes.forEach((pane, index) => {
            let size = this.sizes[index];

            // If sizes were initially percentages, convert them to pixels based on current container size
            if (size <= 100 && !this.startSizes.length) {
                size = (size / 100) * contentSpace;
                this.sizes[index] = size;
            }

            const styleDim = isHoriz ? 'width' : 'height';
            pane.style.flex = `0 0 ${size}px`;
            pane.style[styleDim] = `${size}px`;
        });
    }
}