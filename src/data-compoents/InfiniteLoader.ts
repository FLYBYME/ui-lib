// ui-lib/data-components/InfiniteLoader.ts

import { BaseComponent } from '../BaseComponent';
import { Spinner } from '../feedback/Spinner';
import { Theme } from '../theme';

export interface InfiniteLoaderProps {
    onLoadMore: () => Promise<void>;
    threshold?: number;
    loading?: boolean;
    hasMore?: boolean;
}

export class InfiniteLoader extends BaseComponent<InfiniteLoaderProps> {
    private spinner: Spinner;
    private isIntersecting: boolean = false;
    private observer: IntersectionObserver;

    constructor(props: InfiniteLoaderProps) {
        super('div', props);
        this.spinner = new Spinner({ size: 'md', variant: 'accent' });
        
        this.observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !this.props.loading && this.props.hasMore !== false) {
                this.props.onLoadMore();
            }
        }, {
            rootMargin: `${props.threshold || 200}px`
        });

        this.render();
    }

    public render(): void {
        this.element.innerHTML = '';
        this.applyStyles({
            width: '100%',
            padding: Theme.spacing.md,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50px'
        });

        if (this.props.loading) {
            this.appendChild(this.spinner);
        }

        this.observer.observe(this.element);
    }

    public updateLoading(loading: boolean): void {
        this.updateProps({ loading });
    }

    public dispose(): void {
        this.observer.disconnect();
        super.dispose();
    }
}
