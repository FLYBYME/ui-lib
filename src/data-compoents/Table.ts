// src/client/ui-lib/data/Table.ts
import { BaseComponent } from '../BaseComponent';
import { Theme } from '../theme';
import { VirtualList } from '../navigation/VirtualList';

export interface TableColumn<T> {
    key: keyof T | string;
    header: string;
    width?: string;
    sortable?: boolean;
    render?: (item: T) => (BaseComponent<any> | HTMLElement | string);
}

export interface TableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    onRowSelect?: (item: T) => void;
    stickyHeader?: boolean;
    height?: string;
    selectable?: boolean;
    onSelectionChange?: (selectedRows: T[]) => void;
    onScroll?: (scrollTop: number, maxScroll: number) => void;
}

export class Table<T = any> extends BaseComponent<TableProps<T>> {
    private sortKey: string | null = null;
    private sortDir: 'asc' | 'desc' = 'asc';
    private selectedItems: T[] = [];
    private rowElements: Map<T, HTMLTableRowElement> = new Map();

    constructor(props: TableProps<T>) {
        super('div', props);
        this.render();
    }

    public render(): void {
        const { data, columns, stickyHeader, height, selectable } = this.props;

        this.applyStyles({
            width: '100%',
            overflowX: 'auto',
            overflowY: height ? 'auto' : 'visible',
            height: height || 'auto',
            border: `1px solid ${Theme.colors.border}`,
            borderRadius: Theme.radius || '8px',
            backgroundColor: Theme.colors.bgSecondary,
            fontFamily: Theme.font.family,
            fontSize: '12px',
            position: 'relative'
        });

        this.element.innerHTML = '';
        this.rowElements.clear();

        const table = document.createElement('table');
        Object.assign(table.style, {
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left'
        });

        // Header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        if (stickyHeader) {
            thead.style.position = 'sticky';
            thead.style.top = '0';
            thead.style.zIndex = '10';
        }

        columns.forEach(col => {
            const th = document.createElement('th');
            Object.assign(th.style, {
                padding: '8px 12px',
                borderBottom: `2px solid ${Theme.colors.border}`,
                backgroundColor: Theme.colors.bgTertiary,
                color: Theme.colors.textMuted,
                fontWeight: '600',
                whiteSpace: 'nowrap',
                width: col.width || 'auto'
            });

            const content = document.createElement('div');
            content.style.display = 'flex';
            content.style.alignItems = 'center';
            content.style.gap = '4px';
            content.textContent = col.header;

            if (col.sortable) {
                th.style.cursor = 'pointer';
                const sortIcon = document.createElement('i');
                sortIcon.className = 'fas fa-sort';
                sortIcon.style.fontSize = '10px';
                sortIcon.style.opacity = '0.5';
                content.appendChild(sortIcon);

                this.addEventListener(th, 'click', () => {
                    this.handleSort(col.key as string);
                });
            }

            th.appendChild(content);
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        this.element.appendChild(table);

        // Body (Virtualized)
        let displayData = [...data];
        if (this.sortKey) {
            displayData.sort((a, b) => {
                const valA = (a as any)[this.sortKey!];
                const valB = (b as any)[this.sortKey!];
                if (valA < valB) return this.sortDir === 'asc' ? -1 : 1;
                if (valA > valB) return this.sortDir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        const virtualList = new VirtualList<T>({
            items: displayData,
            itemHeight: 40,
            height: height ? `calc(${height} - 32px)` : '400px',
            renderItem: (item: T) => this.renderRow(item)
        });

        this.appendChild(virtualList);
        this.element.appendChild(virtualList.getElement());

        if (this.props.onScroll) {
            this.addEventListener(virtualList.getElement(), 'scroll', () => {
                const scrollTop = virtualList.getElement().scrollTop;
                const maxScroll = virtualList.getElement().scrollHeight - virtualList.getElement().clientHeight;
                this.props.onScroll!(scrollTop, maxScroll);
            });
        }
    }

    private renderRow(item: T): HTMLElement {
        const tr = document.createElement('tr');
        this.rowElements.set(item, tr);
        const { columns, selectable } = this.props;

        Object.assign(tr.style, {
            borderBottom: `1px solid ${Theme.colors.border}`,
            transition: 'background-color 0.1s',
            display: 'table',
            width: '100%',
            tableLayout: 'fixed'
        });

        this.addEventListener(tr, 'mouseenter', () => {
            if (!this.selectedItems.includes(item)) {
                tr.style.backgroundColor = Theme.colors.bgTertiary;
            }
        });
        this.addEventListener(tr, 'mouseleave', () => {
            if (!this.selectedItems.includes(item)) {
                tr.style.backgroundColor = 'transparent';
            }
        });

        if (selectable) {
            tr.style.cursor = 'pointer';
            this.addEventListener(tr, 'click', ((e: MouseEvent) => {
                this.handleRowClick(item, e);
            }) as EventListener);
        }

        this.updateRowStyle(item);

        columns.forEach(col => {
            const td = document.createElement('td');
            td.style.padding = '8px 12px';
            td.style.width = col.width || 'auto';

            if (col.render) {
                const rendered = col.render(item);
                if (rendered instanceof BaseComponent) {
                    this.appendChild(rendered);
                    td.appendChild(rendered.getElement());
                } else if (rendered instanceof HTMLElement) {
                    td.appendChild(rendered);
                } else {
                    td.textContent = rendered;
                }
            } else {
                td.textContent = String((item as any)[col.key]);
            }
            tr.appendChild(td);
        });

        return tr;
    }

    private handleRowClick(item: T, e: MouseEvent): void {
        const oldSelection = [...this.selectedItems];

        if (e.ctrlKey || e.metaKey) {
            const index = this.selectedItems.indexOf(item);
            if (index > -1) {
                this.selectedItems.splice(index, 1);
            } else {
                this.selectedItems.push(item);
            }
        } else {
            this.selectedItems = [item];
        }

        // Only update affected rows
        const affectedItems = new Set([...oldSelection, ...this.selectedItems]);
        affectedItems.forEach(affectedItem => this.updateRowStyle(affectedItem));

        if (this.props.onRowSelect) this.props.onRowSelect(item);
        if (this.props.onSelectionChange) this.props.onSelectionChange([...this.selectedItems]);
    }

    private updateRowStyle(item: T): void {
        const tr = this.rowElements.get(item);
        if (!tr) return;

        const isSelected = this.selectedItems.includes(item);
        tr.style.backgroundColor = isSelected ? 'var(--ui-bg-hover, rgba(255, 255, 255, 0.1))' : 'transparent';
        tr.style.fontWeight = isSelected ? '600' : '400';

        if (isSelected) {
            tr.setAttribute('aria-selected', 'true');
        } else {
            tr.removeAttribute('aria-selected');
        }
    }

    public updateData(newData: T[]): void {
        this.updateProps({ data: newData });
    }

    public scrollToBottom(): void {
        this.element.scrollTop = this.element.scrollHeight;
    }

    public scrollToTop(): void {
        this.element.scrollTop = 0;
    }

    public setSelection(items: T[]): void {
        const oldSelection = [...this.selectedItems];
        this.selectedItems = items;

        const affectedItems = new Set([...oldSelection, ...this.selectedItems]);
        affectedItems.forEach(affectedItem => this.updateRowStyle(affectedItem));

        if (this.props.onSelectionChange) {
            this.props.onSelectionChange([...this.selectedItems]);
        }
    }

    private handleSort(key: string): void {
        if (this.sortKey === key) {
            this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortKey = key;
            this.sortDir = 'asc';
        }
        this.render();
    }
}
