// ui-lib/ide/NodeEditor.ts

import { BaseComponent, BaseComponentProps } from '../BaseComponent';
import { Theme } from '../theme';

export interface NodePosition {
    x: number;
    y: number;
}

export interface NodeData {
    id: string;
    label: string;
    position: NodePosition;
    type?: 'input' | 'output' | 'process';
}

export interface Connection {
    from: string;
    to: string;
}

export interface NodeEditorProps extends BaseComponentProps {
    nodes: NodeData[];
    connections: Connection[];
    onNodeMove?: (id: string, pos: NodePosition) => void;
}

export class NodeEditor extends BaseComponent<NodeEditorProps> {
    private svg: SVGSVGElement;
    private nodesContainer: HTMLDivElement;
    private draggingNode: string | null = null;
    private dragStart: NodePosition = { x: 0, y: 0 };

    constructor(props: NodeEditorProps) {
        super('div', props);
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.nodesContainer = document.createElement('div');
        this.render();
    }

    public render(): void {
        const { nodes, connections } = this.props;

        this.applyStyles({
            width: '100%',
            height: '100%',
            backgroundColor: Theme.colors.bgPrimary,
            position: 'relative',
            overflow: 'hidden',
            backgroundImage: `radial-gradient(${Theme.colors.border} 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
        });

        this.element.innerHTML = '';

        Object.assign(this.svg.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
        });

        Object.assign(this.nodesContainer.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%'
        });

        this.element.appendChild(this.svg);
        this.element.appendChild(this.nodesContainer);

        this.renderConnections();
        this.renderNodes();
    }

    private renderNodes(): void {
        this.nodesContainer.innerHTML = '';
        this.props.nodes.forEach(node => {
            const nodeEl = document.createElement('div');
            nodeEl.textContent = node.label;
            Object.assign(nodeEl.style, {
                position: 'absolute',
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
                minWidth: '100px',
                padding: '8px 12px',
                backgroundColor: Theme.colors.bgSecondary,
                border: `1px solid ${Theme.colors.border}`,
                borderRadius: Theme.radius,
                color: Theme.colors.textMain,
                fontSize: Theme.font.sizeBase,
                cursor: 'grab',
                userSelect: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            });

            this.addEventListener(nodeEl, 'mousedown', ((e: MouseEvent) => {
                this.draggingNode = node.id;
                this.dragStart = { x: e.clientX - node.position.x, y: e.clientY - node.position.y };
                nodeEl.style.cursor = 'grabbing';

                const onMouseMove = (me: MouseEvent) => {
                    if (this.draggingNode === node.id) {
                        const newPos = { x: me.clientX - this.dragStart.x, y: me.clientY - this.dragStart.y };
                        node.position = newPos;
                        nodeEl.style.left = `${newPos.x}px`;
                        nodeEl.style.top = `${newPos.y}px`;
                        this.renderConnections();
                        if (this.props.onNodeMove) this.props.onNodeMove(node.id, newPos);
                    }
                };

                const onMouseUp = () => {
                    this.draggingNode = null;
                    nodeEl.style.cursor = 'grab';
                    window.removeEventListener('mousemove', onMouseMove);
                    window.removeEventListener('mouseup', onMouseUp);
                };

                window.addEventListener('mousemove', onMouseMove);
                window.addEventListener('mouseup', onMouseUp);
            }) as EventListener);

            this.nodesContainer.appendChild(nodeEl);
        });
    }

    private renderConnections(): void {
        this.svg.innerHTML = '';
        this.props.connections.forEach(conn => {
            const fromNode = this.props.nodes.find(n => n.id === conn.from);
            const toNode = this.props.nodes.find(n => n.id === conn.to);

            if (fromNode && toNode) {
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const x1 = fromNode.position.x + 50;
                const y1 = fromNode.position.y + 20;
                const x2 = toNode.position.x + 50;
                const y2 = toNode.position.y + 20;

                const dx = Math.abs(x1 - x2) * 0.5;
                const d = `M ${x1} ${y1} C ${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}`;

                path.setAttribute('d', d);
                path.setAttribute('stroke', Theme.colors.accent);
                path.setAttribute('stroke-width', '2');
                path.setAttribute('fill', 'none');
                this.svg.appendChild(path);
            }
        });
    }
}
