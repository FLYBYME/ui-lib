// ui-lib/forms/MarkdownEditor.ts

import { BaseComponent, BaseComponentProps } from '../BaseComponent';
import { Theme } from '../theme';

export interface MarkdownEditorProps extends BaseComponentProps {
    value?: string;
    placeholder?: string;
    onChange?: (value: string) => void;
    height?: string;
}

export class MarkdownEditor extends BaseComponent<MarkdownEditorProps> {
    private textarea: HTMLTextAreaElement;
    private preview: HTMLDivElement;
    private toolbar: HTMLDivElement;

    constructor(props: MarkdownEditorProps) {
        super('div', props);
        this.textarea = document.createElement('textarea');
        this.preview = document.createElement('div');
        this.toolbar = document.createElement('div');
        this.render();
    }

    public render(): void {
        const { value = '', placeholder = '', height = '400px' } = this.props;

        this.applyStyles({
            display: 'flex',
            flexDirection: 'column',
            border: `1px solid ${Theme.colors.border}`,
            borderRadius: Theme.radius,
            overflow: 'hidden',
            height,
            backgroundColor: Theme.colors.bgPrimary
        });

        this.element.innerHTML = '';
        this.renderToolbar();

        const editorContainer = document.createElement('div');
        Object.assign(editorContainer.style, {
            display: 'flex',
            flex: '1',
            overflow: 'hidden'
        });

        Object.assign(this.textarea.style, {
            flex: '1',
            border: 'none',
            borderRight: `1px solid ${Theme.colors.border}`,
            padding: Theme.spacing.md,
            backgroundColor: Theme.colors.bgSecondary,
            color: Theme.colors.textMain,
            fontFamily: 'Consolas, "Courier New", monospace',
            fontSize: '14px',
            resize: 'none',
            outline: 'none'
        });
        this.textarea.placeholder = placeholder;
        this.textarea.value = value;

        Object.assign(this.preview.style, {
            flex: '1',
            padding: Theme.spacing.md,
            overflowY: 'auto',
            backgroundColor: Theme.colors.bgPrimary,
            color: Theme.colors.textMain,
            fontSize: Theme.font.sizeBase,
            lineHeight: '1.6'
        });

        this.addEventListener(this.textarea, 'input', () => {
            const val = this.textarea.value;
            this.updatePreview(val);
            if (this.props.onChange) this.props.onChange(val);
        });

        editorContainer.appendChild(this.textarea);
        editorContainer.appendChild(this.preview);
        this.element.appendChild(this.toolbar);
        this.element.appendChild(editorContainer);

        this.updatePreview(value);
    }

    private renderToolbar(): void {
        Object.assign(this.toolbar.style, {
            display: 'flex',
            gap: Theme.spacing.sm,
            padding: Theme.spacing.xs,
            backgroundColor: Theme.colors.bgTertiary,
            borderBottom: `1px solid ${Theme.colors.border}`
        });

        const actions = [
            { icon: 'fas fa-bold', action: () => this.insertTag('**', '**') },
            { icon: 'fas fa-italic', action: () => this.insertTag('_', '_') },
            { icon: 'fas fa-heading', action: () => this.insertTag('### ', '') },
            { icon: 'fas fa-link', action: () => this.insertTag('[', '](url)') },
            { icon: 'fas fa-code', action: () => this.insertTag('```\n', '\n```') },
            { icon: 'fas fa-list', action: () => this.insertTag('- ', '') }
        ];

        actions.forEach(act => {
            const btn = document.createElement('button');
            btn.innerHTML = `<i class="${act.icon}"></i>`;
            Object.assign(btn.style, {
                padding: '4px 8px',
                backgroundColor: 'transparent',
                border: 'none',
                color: Theme.colors.textMuted,
                cursor: 'pointer',
                borderRadius: '2px',
                transition: 'background-color 0.1s'
            });

            this.addEventListener(btn, 'mouseenter', () => btn.style.backgroundColor = 'rgba(255,255,255,0.05)');
            this.addEventListener(btn, 'mouseleave', () => btn.style.backgroundColor = 'transparent');
            this.addEventListener(btn, 'click', act.action);

            this.toolbar.appendChild(btn);
        });
    }

    private insertTag(before: string, after: string): void {
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        const val = this.textarea.value;
        const selected = val.substring(start, end);
        const newVal = val.substring(0, start) + before + selected + after + val.substring(end);

        this.textarea.value = newVal;
        this.textarea.focus();
        this.textarea.setSelectionRange(start + before.length, end + before.length);

        this.updatePreview(newVal);
        if (this.props.onChange) this.props.onChange(newVal);
    }

    private updatePreview(markdown: string): void {
        // Simple manual markdown parsing for demo purposes
        // In a real app, use 'marked' or 'dompurify'
        let html = markdown
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
            .replace(/\*(.*)\*/gim, '<i>$1</i>')
            .replace(/_(.*)_/gim, '<i>$1</i>')
            .replace(/`(.*)`/gim, '<code>$1</code>')
            .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" />')
            .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
            .replace(/^\n/gim, '<br />');

        this.preview.innerHTML = html;
    }
}
