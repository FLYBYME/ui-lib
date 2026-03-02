import { BaseComponent } from '../BaseComponent';
import { Theme } from '../theme';

export interface NetworkTimelineProps {
    data: number[];
    maxDataPoints?: number;
    color?: string;
    height?: string;
    width?: string;
    className?: string;
}

export class NetworkTimeline extends BaseComponent<NetworkTimelineProps> {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null;

    constructor(props: NetworkTimelineProps) {
        super('div', props);
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.element.appendChild(this.canvas);
        this.render();
    }

    public render(): void {
        const { height = '30px', width = '100%' } = this.props;

        this.applyStyles({
            height,
            width,
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden'
        });

        this.updateCanvas();
    }

    private updateCanvas(): void {
        if (!this.ctx) return;

        const rect = this.element.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        // Handle initial zero-rect case
        const w = rect.width || 200;
        const h = rect.height || 30;

        this.canvas.width = w * dpr;
        this.canvas.height = h * dpr;
        this.canvas.style.width = `${w}px`;
        this.canvas.style.height = `${h}px`;
        this.ctx.scale(dpr, dpr);

        const { data, color = Theme.colors.accent } = this.props;
        if (data.length < 2) return;

        this.ctx.clearRect(0, 0, w, h);
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1.5;
        this.ctx.lineJoin = 'round';

        const max = Math.max(...data, 100); // Scale relative to at least 100ms
        const step = w / (this.props.maxDataPoints || 50);
        const startX = w - (data.length - 1) * step;

        data.forEach((val, i) => {
            const x = startX + i * step;
            const y = h - (val / max) * (h - 4) - 2;
            if (i === 0) this.ctx!.moveTo(x, y);
            else this.ctx!.lineTo(x, y);
        });

        this.ctx.stroke();

        // Area fill
        this.ctx.lineTo(w, h);
        this.ctx.lineTo(startX, h);
        this.ctx.closePath();
        this.ctx.fillStyle = color.replace(')', ', 0.1)').replace('rgb', 'rgba');
        this.ctx.fill();
    }

    public addDataPoint(point: number): void {
        const maxPoints = this.props.maxDataPoints || 50;
        const newData = [...this.props.data, point];
        if (newData.length > maxPoints) {
            newData.shift();
        }
        this.updateProps({ data: newData });
    }
}
