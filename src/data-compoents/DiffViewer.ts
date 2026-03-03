// ui-lib/data-compoents/DiffViewer.ts

import { BaseComponent, BaseComponentProps } from '../BaseComponent';
import { Theme } from '../theme';

export interface DiffViewerProps extends BaseComponentProps {
    oldText: string;
    newText: string;
    mode?: 'side-by-side' | 'unified';
}

export class DiffViewer extends BaseComponent<DiffViewerProps> {
    constructor(props: DiffViewerProps) {
        super('div', props);
        this.render();
    }

    public render(): void {
        const { oldText, newText, mode = 'side-by-side' } = this.props;

        this.applyStyles({
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: Theme.colors.bgPrimary,
            fontFamily: 'Consolas, "Courier New", monospace',
            fontSize: '13px',
            border: `1px solid ${Theme.colors.border}`,
            borderRadius: Theme.radius,
            overflow: 'hidden'
        });

        this.element.innerHTML = '';

        if (mode === 'side-by-side') {
            this.renderSideBySide(oldText, newText);
        } else {
            this.renderUnified(oldText, newText);
        }
    }

    private renderSideBySide(oldText: string, newText: string): void {
        const container = document.createElement('div');
        Object.assign(container.style, {
            display: 'flex',
            height: '100%',
            overflow: 'hidden'
        });

        const leftPanel = this.createDiffPanel(oldText, newText, 'old');
        const rightPanel = this.createDiffPanel(oldText, newText, 'new');

        container.appendChild(leftPanel);
        container.appendChild(rightPanel);
        this.element.appendChild(container);
    }

    private createDiffPanel(oldText: string, newText: string, type: 'old' | 'new'): HTMLElement {
        const panel = document.createElement('div');
        Object.assign(panel.style, {
            flex: '1',
            overflow: 'auto',
            borderRight: type === 'old' ? `1px solid ${Theme.colors.border}` : 'none'
        });

        const oldLines = oldText.split('\n');
        const newLines = newText.split('\n');
        const maxLines = Math.max(oldLines.length, newLines.length);

        for (let i = 0; i < maxLines; i++) {
            const line = document.createElement('div');
            const content = type === 'old' ? (oldLines[i] || '') : (newLines[i] || '');
            const isRemoved = type === 'old' && oldLines[i] !== newLines[i];
            const isAdded = type === 'new' && oldLines[i] !== newLines[i];

            Object.assign(line.style, {
                display: 'flex',
                whiteSpace: 'pre',
                backgroundColor: isRemoved ? 'rgba(255, 0, 0, 0.15)' : (isAdded ? 'rgba(0, 255, 0, 0.15)' : 'transparent'),
                minHeight: '20px'
            });

            const lineNum = document.createElement('div');
            lineNum.textContent = String(i + 1);
            Object.assign(lineNum.style, {
                width: '40px',
                textAlign: 'right',
                paddingRight: '8px',
                color: Theme.colors.textMuted,
                userSelect: 'none',
                borderRight: `1px solid ${Theme.colors.border}`,
                marginRight: '8px'
            });

            const text = document.createElement('div');
            text.textContent = content;

            line.appendChild(lineNum);
            line.appendChild(text);
            panel.appendChild(line);
        }

        return panel;
    }

    private renderUnified(oldText: string, newText: string): void {
        const panel = document.createElement('div');
        Object.assign(panel.style, {
            flex: '1',
            overflow: 'auto'
        });

        // Simple unified diff algorithm (naive line comparison)
        const oldLines = oldText.split('\n');
        const newLines = newText.split('\n');

        // This is a placeholder for a real LCS diff algorithm
        oldLines.forEach((line, i) => {
            if (line !== newLines[i]) {
                this.addDiffLine(panel, '-', line, 'rgba(255, 0, 0, 0.15)');
                if (newLines[i] !== undefined) {
                    this.addDiffLine(panel, '+', newLines[i], 'rgba(0, 255, 0, 0.15)');
                }
            } else {
                this.addDiffLine(panel, ' ', line, 'transparent');
            }
        });

        this.element.appendChild(panel);
    }

    private addDiffLine(container: HTMLElement, prefix: string, content: string, bgColor: string): void {
        const line = document.createElement('div');
        Object.assign(line.style, {
            display: 'flex',
            whiteSpace: 'pre',
            backgroundColor: bgColor,
            minHeight: '20px'
        });

        const pre = document.createElement('div');
        pre.textContent = prefix;
        pre.style.width = '20px';
        pre.style.textAlign = 'center';
        pre.style.color = Theme.colors.textMuted;

        const text = document.createElement('div');
        text.textContent = content;

        line.appendChild(pre);
        line.appendChild(text);
        container.appendChild(line);
    }
}
