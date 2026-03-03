// ui-lib/layout/Splitter.ts

import { BaseComponent, BaseComponentProps } from '../BaseComponent';
import { Theme } from '../theme';

export interface SplitterProps extends BaseComponentProps {
    orientation: 'horizontal' | 'vertical';
    onResize?: (delta: number) => void;
}

export class Splitter extends BaseComponent<SplitterProps> {
    private isDragging = false;
    private startPos = 0;

    constructor(props: SplitterProps) {
        super('div', props);
        this.render();
    }

    public render(): void {
        const { orientation } = this.props;

        this.applyStyles({
            width: orientation === 'vertical' ? '4px' : '100%',
            height: orientation === 'horizontal' ? '4px' : '100%',
            cursor: orientation === 'vertical' ? 'col-resize' : 'row-resize',
            backgroundColor: 'transparent',
            zIndex: '10',
            transition: 'background-color 0.2s',
            position: 'relative'
        });

        this.addEventListener(this.element, 'mouseenter', () => {
            this.element.style.backgroundColor = 'var(--ui-accent)';
        });
        this.addEventListener(this.element, 'mouseleave', () => {
            if (!this.isDragging) this.element.style.backgroundColor = 'transparent';
        });

        this.addEventListener(this.element, 'mousedown', ((e: MouseEvent) => {
            this.isDragging = true;
            this.startPos = this.props.orientation === 'vertical' ? e.clientX : e.clientY;
            this.element.style.backgroundColor = 'var(--ui-accent)';

            this.addEventListener(window.document.body, 'mousemove', this.handleMouseMove);
            this.addEventListener(window.document.body, 'mouseup', this.handleMouseUp);

            window.document.body.style.cursor = this.props.orientation === 'vertical' ? 'col-resize' : 'row-resize';
        }) as EventListener);
    }

    private handleMouseMove = (e: Event): void => {
        if (!this.isDragging) return;
        const mouseEvent = e as MouseEvent;
        const currentPos = this.props.orientation === 'vertical' ? mouseEvent.clientX : mouseEvent.clientY;
        const delta = currentPos - this.startPos;
        this.startPos = currentPos;

        if (this.props.onResize) this.props.onResize(delta);
    };

    private handleMouseUp = (): void => {
        this.isDragging = false;
        this.element.style.backgroundColor = 'transparent';
        window.document.body.style.cursor = '';
        // In a real implementation we would remove listeners here
    };
}
