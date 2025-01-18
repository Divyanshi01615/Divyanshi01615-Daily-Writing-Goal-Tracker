class MindMap {
    constructor() {
        this.nodes = new Map();
        this.connections = new Set();
        this.draggedNode = null;
        this.selectedNode = null;
        this.isConnecting = false;
        this.connectionStart = null;
        this.nextNodeId = 0;

        this.initElements();
        this.initEventListeners();
        this.loadMindMap();
    }

    initElements() {
        this.canvas = document.getElementById('canvas');
        this.nodesContainer = document.getElementById('nodes');
        this.connectionsContainer = document.getElementById('connections');
        this.contextMenu = document.getElementById('contextMenu');
        this.modal = document.getElementById('modal');
        this.nodeTextInput = document.getElementById('nodeText');
    }

    initEventListeners() {
        document.getElementById('addNode').addEventListener('click', () => this.createNode());
        document.getElementById('connect').addEventListener('click', () => this.toggleConnectionMode());
        document.getElementById('save').addEventListener('click', () => this.saveMindMap());
        document.getElementById('load').addEventListener('click', () => this.loadMindMap());
        document.getElementById('clear').addEventListener('click', () => this.clearMindMap());
        
        document.getElementById('editNode').addEventListener('click', () => this.editNode());
        document.getElementById('deleteNode').addEventListener('click', () => this.deleteNode());
        document.getElementById('changeColor').addEventListener('click', () => this.showColorPicker());
        
        document.getElementById('saveEdit').addEventListener('click', () => this.saveNodeEdit());
        document.getElementById('cancelEdit').addEventListener('click', () => this.closeModal());

        document.addEventListener('click', (e) => {
            if (!this.contextMenu.contains(e.target)) {
                this.contextMenu.style.display = 'none';
            }
        });

        // Color picker options
        document.querySelectorAll('.color-option').forEach(option => {
            option.style.backgroundColor = option.dataset.color;
            option.addEventListener('click', () => this.changeNodeColor(option.dataset.color));
        });
    }

    createNode(x = 100, y = 100) {
        const node = document.createElement('div');
        const id = `node-${this.nextNodeId++}`;
        node.id = id;
        node.className = 'node';
        node.textContent = 'New Node';
        node.style.left = `${x}px`;
        node.style.top = `${y}px`;
        node.style.backgroundColor = '#ffffff';

        this.nodes.set(id, node);
        this.nodesContainer.appendChild(node);
        this.initNodeEvents(node);
    }

    initNodeEvents(node) {
        let offsetX, offsetY;

        node.addEventListener('mousedown', (e) => {
            if (this.isConnecting) {
                if (!this.connectionStart) {
                    this.connectionStart = node;
                } else if (this.connectionStart !== node) {
                    this.createConnection(this.connectionStart, node);
                    this.connectionStart = null;
                    this.isConnecting = false;
                }
                return;
            }

            this.draggedNode = node;
            offsetX = e.clientX - node.offsetLeft;
            offsetY = e.clientY - node.offsetTop;
            node.classList.add('dragging');
        });

        node.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.selectedNode = node;
            this.showContextMenu(e.clientX, e.clientY);
        });
    }

    createConnection(start, end) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.classList.add('connection');
        this.updateConnection(line, start, end);
        this.connectionsContainer.appendChild(line);
        this.connections.add({ line, start, end });
    }

    updateConnection(line, start, end) {
        const startRect = start.getBoundingClientRect();
        const endRect = end.getBoundingClientRect();

        const x1 = startRect.left + startRect.width / 2;
        const y1 = startRect.top + startRect.height / 2;
        const x2 = endRect.left + endRect.width / 2;
        const y2 = endRect.top + endRect.height / 2;

        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
    }

    updateConnections() {
        this.connections.forEach(({ line, start, end }) => {
            this.updateConnection(line, start, end);
        });
    }

    toggleConnectionMode() {
        this.isConnecting = !this.isConnecting;
        this.connectionStart = null;
        document.getElementById('connect').classList.toggle('primary');
    }

    showContextMenu(x, y) {
        this.contextMenu.style.display = 'block';
        this.contextMenu.style.left = `${x}px`;
        this.contextMenu.style.top = `${y}px`;
    }

    editNode() {
        if (this.selectedNode) {
            this.nodeTextInput.value = this.selectedNode.textContent;
            this.modal.classList.add('show');
        }
        this.contextMenu.style.display = 'none';
    }

    saveNodeEdit() {
        if (this.selectedNode && this.nodeTextInput.value) {
            this.selectedNode.textContent = this.nodeTextInput.value;
            this.closeModal();
        }
    }

    closeModal() {
        this.modal.classList.remove('show');
    }

    deleteNode() {
        if (this.selectedNode) {
            // Remove connections
            this.connections = new Set(
                Array.from(this.connections).filter(({ start, end }) => {
                    if (start === this.selectedNode || end === this.selectedNode) {
                        this.connectionsContainer.removeChild(line);
                        return false;
                    }
                    return true;
                })
            );

            this.nodes.delete(this.selectedNode.id);
            this.selectedNode.remove();
            this.selectedNode = null;
        }
        this.contextMenu.style.display = 'none';
    }

    changeNodeColor(color) {
        if (this.selectedNode) {
            this.selectedNode.style.backgroundColor = color;
        }
        this.contextMenu.style.display = 'none';
    }

    saveMindMap() {
        const data = {
            nodes: Array.from(this.nodes.entries()).map(([id, node]) => ({
                id,
                text: node.textContent,
                x: node.offsetLeft,
                y: node.offsetTop,
                color: node.style.backgroundColor
            })),
            connections: Array.from(this.connections).map(({ start, end }) => ({
                startId: start.id,
                endId: end.id
            }))
        };
        localStorage.setItem('mindMap', JSON.stringify(data));
    }

    loadMindMap() {
        const data = JSON.parse(localStorage.getItem('mindMap'));
        if (!data) return;

        this.clearMindMap();

        // Recreate nodes
        data.nodes.forEach(nodeData => {
            const node = document.createElement('div');
            node.id = nodeData.id;
            node.className = 'node';
            node.textContent = nodeData.text;
            node.style.left = `${nodeData.x}px`;
            node.style.top = `${nodeData.y}px`;
            node.style.backgroundColor = nodeData.color;

            this.nodes.set(nodeData.id, node);
            this.nodesContainer.appendChild(node);
            this.initNodeEvents(node);
        });

        // Recreate connections
        data.connections.forEach(({ startId, endId }) => {
            const start = this.nodes.get(startId);
            const end = this.nodes.get(endId);
            if (start && end) {
                this.createConnection(start, end);
            }
        });
    }

    clearMindMap() {
        this.nodes.clear();
        this.connections.clear();
        this.nodesContainer.innerHTML = '';
        this.connectionsContainer.innerHTML = '';
        this.nextNodeId = 0;
    }
}

// Initialize mind map when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const mindMap = new MindMap();

    // Handle dragging
    document.addEventListener('mousemove', (e) => {
        if (mindMap.draggedNode) {
            const x = e.clientX - mindMap.canvas.offsetLeft;
            const y = e.clientY - mindMap.canvas.offsetTop;
            
            mindMap.draggedNode.style.left = `${x}px`;
            mindMap.draggedNode.style.top = `${y}px`;
            mindMap.updateConnections();
        }
    });

    document.addEventListener('mouseup', () => {
        if (mindMap.draggedNode) {
            mindMap.draggedNode.classList.remove('dragging');
            mindMap.draggedNode = null;
        }
    });
});