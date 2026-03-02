// ui-lib/layout/Stack.ts

import { BaseComponent, BaseComponentProps } from '../BaseComponent';
import { Theme } from '../theme';

export interface StackProps extends BaseComponentProps {
    direction?: 'row' | 'column' | 'vertical' | 'horizontal';
    align?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
    justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
    gap?: keyof typeof Theme.spacing | 'none';
    padding?: keyof typeof Theme.spacing | 'none';
    margin?: keyof typeof Theme.spacing | 'none';
    fill?: boolean; // If true, applies flex: 1 (grows to fill available space)
    scrollable?: boolean; // Useful for long file trees or lists
    width?: string;
    height?: string;
    minWidth?: string;
    minHeight?: string;
    glassmorphism?: boolean;
    children?: (BaseComponent<any> | Node | string)[];
}

export class Stack extends BaseComponent<StackProps> {
    constructor(props: StackProps = {}) {
        super('div', props);
        this.render();
    }

    public render(): void {
        const {
            direction = 'column',
            align = 'stretch',
            justify = 'flex-start',
            gap = 'none',
            padding = 'none',
            margin = 'none',
            fill = false,
            scrollable = false,
            width,
            height,
            minWidth,
            minHeight,
            glassmorphism = false,
            children = []
        } = this.props;

        const flexDir = direction === 'vertical' ? 'column' : (direction === 'horizontal' ? 'row' : direction);

        this.applyStyles({
            display: 'flex',
            flexDirection: flexDir,
            alignItems: align,
            justifyContent: justify,
            gap: gap !== 'none' ? Theme.spacing[gap] : '0',
            padding: padding !== 'none' ? Theme.spacing[padding] : '0',
            margin: margin !== 'none' ? Theme.spacing[margin] : '0',
            flex: fill ? '1' : '0 0 auto',
            overflow: scrollable ? 'auto' : 'visible',
            boxSizing: 'border-box',
            width: width || (fill ? '100%' : 'auto'),
            height: height || (fill ? '100%' : 'auto'),
            minWidth: minWidth || '0',
            minHeight: minHeight || '0',
            backgroundColor: glassmorphism ? 'rgba(24, 24, 27, 0.4)' : 'transparent',
            backdropFilter: glassmorphism ? 'blur(12px) saturate(180%)' : 'none',
            border: glassmorphism ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        });

        if (children.length > 0) {
            this.appendChildren(...children);
        }
    }
}