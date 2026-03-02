// ui-lib/layout/ScrollArea.ts

import { BaseComponent, BaseComponentProps } from '../BaseComponent';
import { Theme } from '../theme';

export interface ScrollAreaProps extends BaseComponentProps {
    children?: (BaseComponent<any> | Node | string)[];
    fill?: boolean;
    height?: string;
    width?: string;
    padding?: keyof typeof Theme.spacing | 'none';
}

export class ScrollArea extends BaseComponent<ScrollAreaProps> {
    constructor(props: ScrollAreaProps = {}) {
        super('div', props);
        this.render();
    }

    public render(): void {
        const {
            children = [],
            fill = false,
            height,
            width,
            padding = 'none'
        } = this.props;

        this.applyStyles({
            overflow: 'auto',
            width: width || (fill ? '100%' : 'auto'),
            height: height || (fill ? '100%' : 'auto'),
            padding: padding !== 'none' ? Theme.spacing[padding] : '0',
            boxSizing: 'border-box',
            position: 'relative' // For absolute positioned children if any
        });

        this.injectScrollbarStyles();

        if (children.length > 0) {
            this.appendChildren(...children);
        }
    }

    private injectScrollbarStyles(): void {
        const styleId = 'ui-lib-scrollarea-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            div::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }
            div::-webkit-scrollbar-track {
                background: transparent;
            }
            div::-webkit-scrollbar-thumb {
                background: #27272a;
                border-radius: 10px;
                border: 2px solid transparent;
                background-clip: content-box;
            }
            div::-webkit-scrollbar-thumb:hover {
                background: #3f3f46;
                background-clip: content-box;
            }
        `;
        document.head.appendChild(style);
    }
}
