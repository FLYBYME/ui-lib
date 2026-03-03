// ui-lib/ide/Terminal.ts

import { BaseComponent, BaseComponentProps } from '../BaseComponent';
import { Theme } from '../theme';

export interface TerminalLine {
    text: string;
    type?: 'output' | 'error' | 'info' | 'command';
}

export interface TerminalProps extends BaseComponentProps {
    lines: TerminalLine[];
    autoScroll?: boolean;
}

export class Terminal extends BaseComponent<TerminalProps> {
    constructor(props: TerminalProps) {
        super('div', props);
        this.render();
    }

    public render(): void {
        const { lines } = this.props;

        this.applyStyles({
            backgroundColor: '#000',
            color: '#fff',
            fontFamily: 'Consolas, "Courier New", monospace',
            fontSize: '12px',
            padding: Theme.spacing.md,
            overflowY: 'auto',
            height: '100%',
            width: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
        });

        this.element.innerHTML = '';

        lines.forEach(line => {
            const lineEl = document.createElement('div');
            lineEl.textContent = line.text;

            switch (line.type) {
                case 'error': lineEl.style.color = '#ff5555'; break;
                case 'info': lineEl.style.color = '#5555ff'; break;
                case 'command': lineEl.style.color = '#55ff55'; break;
                default: lineEl.style.color = '#e0e0e0';
            }

            this.element.appendChild(lineEl);
        });

        if (this.props.autoScroll) {
            this.scrollToBottom();
        }
    }

    public appendLine(line: TerminalLine): void {
        const nextLines = [...this.props.lines, line];
        this.updateProps({ lines: nextLines });
    }

    public clear(): BaseComponent<any> {
        this.updateProps({ lines: [] });
        return this;
    }

    public scrollToBottom(): void {
        this.element.scrollTop = this.element.scrollHeight;
    }
}
