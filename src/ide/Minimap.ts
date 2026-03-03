// ui-lib/ide/Minimap.ts

import { BaseComponent, BaseComponentProps } from '../BaseComponent';
import { Theme } from '../theme';

export interface MinimapProps extends BaseComponentProps {
    target: HTMLElement | BaseComponent<any>;
    scale?: number;
}

export class Minimap extends BaseComponent<MinimapProps> {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null;

    constructor(props: MinimapProps) {
        super('div', props);
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.render();
    }

    public render(): void {
        const { scale = 0.1 } = this.props;

        this.applyStyles({
            width: '120px',
            height: '100%',
            backgroundColor: Theme.colors.bgSecondary,
            borderLeft: `1px solid ${Theme.colors.border}`,
            position: 'relative',
            overflow: 'hidden'
        });

        this.element.innerHTML = '';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.element.appendChild(this.canvas);

        // In a real implementation, we would use a requestAnimationFrame loop
        // to sync with the target's content and scroll position.
        this.sync();
    }

    public sync(): void {
        const targetEl = this.props.target instanceof BaseComponent
            ? this.props.target.getElement()
            : this.props.target;

        if (!this.ctx) return;

        // Simplified rendering: draw rectangles for lines of text
        const rect = targetEl.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;

        this.ctx.fillStyle = Theme.colors.textMuted;
        this.ctx.globalAlpha = 0.3;

        // Mock rendering for demo - in reality, we'd traverse the targetEl's text nodes
        for (let i = 0; i < 100; i++) {
            const y = i * 15;
            const width = 40 + Math.random() * 100;
            const x = 5 + Math.random() * 5;
            this.ctx.fillRect(x, y, width, 10);
        }

        // Draw viewport indicator
        this.drawViewportIndicator(targetEl);
    }

    private drawViewportIndicator(targetEl: HTMLElement): void {
        // This would draw a highlighted rectangle representing the visible area
        const viewport = document.createElement('div');
        Object.assign(viewport.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '10%',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${Theme.colors.accent}`,
            cursor: 'ns-resize'
        });
        this.element.appendChild(viewport);
    }
}
