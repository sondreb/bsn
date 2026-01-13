import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService, BSNData } from '../services/data.service';
import { MeService } from '../services/me.service';
import { RouterLink } from '@angular/router';
import { AddressPipe } from '../pipes/address.pipe';
import { FormsModule } from '@angular/forms';
import { NicknameService } from '../services/nickname.service';

interface RelationshipNode {
  address: string;
  name: string;
  x: number;
  y: number;
  connections: number;
  tagTypes: Set<string>;
}

interface RelationshipEdge {
  from: string;
  to: string;
  types: string[];
  bidirectional: boolean;
}

@Component({
  selector: 'app-relationships-explorer',
  imports: [CommonModule, RouterLink, AddressPipe, FormsModule],
  template: `
    <div class="explorer-container">
      <header class="explorer-header">
        <h1>🌐 Relationship Explorer</h1>
        <p class="subtitle">Visualize the social network connections</p>
      </header>

      @if (!meAccount()) {
      <div class="no-me-message">
        <h3>👤 Select "This is me" on your account first</h3>
        <p>To explore relationships from your perspective, visit your account page and click "This is me"</p>
      </div>
      } @else {
      <div class="explorer-content">
        <div class="controls-panel">
          <div class="control-group">
            <label>Center Account:</label>
            <select [(ngModel)]="centerAddress" (change)="buildRelationshipGraph()">
              <option [value]="meAccount()">My Account</option>
              @for (account of getAccountsList(); track account.address) {
              <option [value]="account.address">
                {{ account.name || (account.address | address) }}
              </option>
              }
            </select>
          </div>

          <div class="control-group">
            <label>Depth Level:</label>
            <input type="range" [(ngModel)]="depth" min="1" max="3" (change)="buildRelationshipGraph()" />
            <span>{{ depth }}</span>
          </div>

          <div class="control-group">
            <label>Filter by Tag Type:</label>
            <select [(ngModel)]="selectedTagFilter" (change)="buildRelationshipGraph()">
              <option value="">All Tags</option>
              @for (tag of availableTags; track tag) {
              <option [value]="tag">{{ tag }}</option>
              }
            </select>
          </div>
        </div>

        <div class="graph-container">
          <svg [attr.width]="svgWidth" [attr.height]="svgHeight" class="relationship-graph">
            <!-- Edges -->
            <g class="edges">
              @for (edge of edges; track edge.from + edge.to) {
              <g class="edge-group">
                @if (getNode(edge.from) && getNode(edge.to)) {
                <line
                  [attr.x1]="getNode(edge.from)!.x"
                  [attr.y1]="getNode(edge.from)!.y"
                  [attr.x2]="getNode(edge.to)!.x"
                  [attr.y2]="getNode(edge.to)!.y"
                  [class.bidirectional]="edge.bidirectional"
                  class="edge-line"
                  [attr.stroke-width]="edge.types.length + 1"
                />
                <!-- Edge label -->
                <text
                  [attr.x]="(getNode(edge.from)!.x + getNode(edge.to)!.x) / 2"
                  [attr.y]="(getNode(edge.from)!.y + getNode(edge.to)!.y) / 2"
                  class="edge-label"
                >
                  {{ edge.types.join(', ') }}
                </text>
                }
              </g>
              }
            </g>

            <!-- Nodes -->
            <g class="nodes">
              @for (node of nodes; track node.address) {
              <g class="node-group" [class.center-node]="node.address === centerAddress">
                <circle
                  [attr.cx]="node.x"
                  [attr.cy]="node.y"
                  [attr.r]="node.address === centerAddress ? 25 : 15 + node.connections * 2"
                  class="node-circle"
                  [class.me-node]="node.address === meAccount()"
                />
                <text
                  [attr.x]="node.x"
                  [attr.y]="node.y + 35"
                  class="node-label"
                >
                  {{ node.name }}
                </text>
                <a [routerLink]="['/accounts', node.address]">
                  <text
                    [attr.x]="node.x"
                    [attr.y]="node.y + 50"
                    class="node-link"
                  >
                    View →
                  </text>
                </a>
              </g>
              }
            </g>
          </svg>
        </div>

        <div class="stats-panel">
          <div class="stat-card">
            <div class="stat-value">{{ nodes.length }}</div>
            <div class="stat-label">Accounts</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ edges.length }}</div>
            <div class="stat-label">Connections</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ availableTags.length }}</div>
            <div class="stat-label">Tag Types</div>
          </div>
        </div>

        <div class="legend">
          <h3>Legend</h3>
          <div class="legend-items">
            <div class="legend-item">
              <div class="legend-symbol center-node-symbol"></div>
              <span>Center Account</span>
            </div>
            <div class="legend-item">
              <div class="legend-symbol me-node-symbol"></div>
              <span>My Account</span>
            </div>
            <div class="legend-item">
              <div class="legend-line bidirectional"></div>
              <span>Mutual Relationship</span>
            </div>
            <div class="legend-item">
              <div class="legend-line"></div>
              <span>One-way Relationship</span>
            </div>
          </div>
        </div>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .explorer-container {
        padding: 20px;
        max-width: 1400px;
        margin: 0 auto;
      }

      .explorer-header {
        text-align: center;
        margin-bottom: 30px;
      }

      .explorer-header h1 {
        margin: 0;
        background: var(--accent-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-size: 2.5em;
      }

      .subtitle {
        color: var(--text-secondary);
        margin-top: 10px;
      }

      .no-me-message {
        background: var(--card-bg);
        padding: 40px;
        border-radius: var(--border-radius-md);
        text-align: center;
        border: 2px dashed var(--border-color-light);
      }

      .no-me-message h3 {
        color: var(--text-primary);
        margin-top: 0;
      }

      .explorer-content {
        display: grid;
        gap: 20px;
      }

      .controls-panel {
        background: var(--card-bg);
        padding: 20px;
        border-radius: var(--border-radius-md);
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
        border: 1px solid var(--border-color-light);
      }

      .control-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
        min-width: 200px;
      }

      .control-group label {
        font-weight: 600;
        color: var(--text-primary);
        font-size: 0.9em;
      }

      .control-group select,
      .control-group input[type="range"] {
        padding: 8px;
        border: 2px solid var(--border-color-light);
        border-radius: var(--border-radius-sm);
        background: var(--input-bg);
        color: var(--text-primary);
        transition: all var(--transition-duration) ease;
      }

      .control-group select:focus {
        outline: none;
        border-color: var(--accent-color);
      }

      .graph-container {
        background: var(--card-bg);
        border-radius: var(--border-radius-md);
        padding: 20px;
        overflow: auto;
        border: 1px solid var(--border-color-light);
      }

      .relationship-graph {
        display: block;
        margin: 0 auto;
      }

      .edge-line {
        stroke: var(--accent-color);
        stroke-opacity: 0.6;
        fill: none;
      }

      .edge-line.bidirectional {
        stroke: #4caf50;
        stroke-opacity: 0.8;
      }

      .edge-label {
        fill: var(--text-tertiary);
        font-size: 10px;
        text-anchor: middle;
        pointer-events: none;
      }

      .node-circle {
        fill: var(--accent-color);
        stroke: white;
        stroke-width: 2;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .node-circle:hover {
        fill: var(--link-hover);
        transform: scale(1.2);
      }

      .center-node .node-circle {
        fill: var(--accent-gradient);
        stroke-width: 3;
      }

      .me-node .node-circle {
        fill: #4caf50;
      }

      .node-label {
        fill: var(--text-primary);
        font-size: 12px;
        text-anchor: middle;
        pointer-events: none;
        font-weight: 600;
      }

      .node-link {
        fill: var(--link-color);
        font-size: 10px;
        text-anchor: middle;
        cursor: pointer;
        text-decoration: underline;
      }

      .node-link:hover {
        fill: var(--link-hover);
      }

      .stats-panel {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
      }

      .stat-card {
        background: var(--card-bg);
        padding: 20px;
        border-radius: var(--border-radius-md);
        text-align: center;
        border: 1px solid var(--border-color-light);
      }

      .stat-value {
        font-size: 2em;
        font-weight: 700;
        background: var(--accent-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .stat-label {
        color: var(--text-secondary);
        margin-top: 8px;
        font-size: 0.9em;
      }

      .legend {
        background: var(--card-bg);
        padding: 20px;
        border-radius: var(--border-radius-md);
        border: 1px solid var(--border-color-light);
      }

      .legend h3 {
        margin-top: 0;
        color: var(--text-primary);
      }

      .legend-items {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .legend-symbol {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
      }

      .center-node-symbol {
        background: var(--accent-gradient);
      }

      .me-node-symbol {
        background: #4caf50;
      }

      .legend-line {
        width: 40px;
        height: 3px;
        background: var(--accent-color);
      }

      .legend-line.bidirectional {
        background: #4caf50;
      }
    `,
  ],
})
export class RelationshipsExplorerComponent {
  private dataService = inject(DataService);
  private meService = inject(MeService);
  private nicknameService = inject(NicknameService);

  centerAddress = '';
  depth = 2;
  selectedTagFilter = '';
  availableTags: string[] = [];

  nodes: RelationshipNode[] = [];
  edges: RelationshipEdge[] = [];
  svgWidth = 1200;
  svgHeight = 800;

  data: BSNData | null = null;
  private accounts: Record<string, any> = {};

  constructor() {
    effect(() => {
      if (this.dataService.data()) {
        this.data = this.dataService.data();
        this.accounts = this.data?.accounts || {};
        this.centerAddress = this.meService.meAccount() || '';
        this.collectAvailableTags();
        if (this.centerAddress) {
          this.buildRelationshipGraph();
        }
      }
    });
  }

  meAccount() {
    return this.meService.meAccount();
  }

  getAccountsList() {
    return Object.keys(this.accounts)
      .map((address) => ({
        address,
        name:
          this.accounts[address]?.profile?.Name?.[0] ||
          this.nicknameService.getNickname(address) ||
          '',
      }))
      .filter((acc) => acc.name)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  collectAvailableTags() {
    const tagSet = new Set<string>();
    for (const account of Object.values(this.accounts)) {
      if (account.tags) {
        Object.keys(account.tags).forEach((tag) => tagSet.add(tag));
      }
    }
    this.availableTags = Array.from(tagSet).sort();
  }

  buildRelationshipGraph() {
    if (!this.centerAddress) return;

    const nodeMap = new Map<string, RelationshipNode>();
    const edgeSet = new Set<string>();
    const tempEdges: RelationshipEdge[] = [];

    // Add center node
    this.addNode(nodeMap, this.centerAddress);

    // BFS to build graph
    const visited = new Set<string>();
    const queue: Array<{ address: string; level: number }> = [
      { address: this.centerAddress, level: 0 },
    ];

    while (queue.length > 0) {
      const { address, level } = queue.shift()!;
      if (visited.has(address) || level >= this.depth) continue;
      visited.add(address);

      const account = this.accounts[address];
      if (!account?.tags) continue;

      for (const [tagType, addresses] of Object.entries(account.tags)) {
        if (this.selectedTagFilter && tagType !== this.selectedTagFilter)
          continue;

        for (const targetAddress of addresses as string[]) {
          if (!this.accounts[targetAddress]) continue;

          // Add node
          this.addNode(nodeMap, targetAddress);

          // Add edge
          const edgeKey = `${address}-${targetAddress}`;
          const reverseKey = `${targetAddress}-${address}`;

          let existingEdge = tempEdges.find(
            (e) => e.from === address && e.to === targetAddress
          );
          if (!existingEdge) {
            existingEdge = tempEdges.find(
              (e) => e.from === targetAddress && e.to === address
            );
            if (existingEdge) {
              existingEdge.bidirectional = true;
              if (!existingEdge.types.includes(tagType)) {
                existingEdge.types.push(tagType);
              }
            } else {
              tempEdges.push({
                from: address,
                to: targetAddress,
                types: [tagType],
                bidirectional: false,
              });
            }
          } else if (!existingEdge.types.includes(tagType)) {
            existingEdge.types.push(tagType);
          }

          // Add to queue
          queue.push({ address: targetAddress, level: level + 1 });
        }
      }
    }

    this.nodes = Array.from(nodeMap.values());
    this.edges = tempEdges;

    // Position nodes in a circular layout
    this.positionNodes();
  }

  addNode(nodeMap: Map<string, RelationshipNode>, address: string) {
    if (!nodeMap.has(address)) {
      const account = this.accounts[address];
      const name =
        account?.profile?.Name?.[0] ||
        this.nicknameService.getNickname(address) ||
        address.substring(0, 8);

      nodeMap.set(address, {
        address,
        name,
        x: 0,
        y: 0,
        connections: 0,
        tagTypes: new Set(),
      });
    }
  }

  positionNodes() {
    const centerX = this.svgWidth / 2;
    const centerY = this.svgHeight / 2;

    // Position center node
    const centerNode = this.nodes.find((n) => n.address === this.centerAddress);
    if (centerNode) {
      centerNode.x = centerX;
      centerNode.y = centerY;
    }

    // Position other nodes in circles
    const otherNodes = this.nodes.filter((n) => n.address !== this.centerAddress);
    const angleStep = (2 * Math.PI) / Math.max(otherNodes.length, 1);
    const radius = Math.min(this.svgWidth, this.svgHeight) * 0.35;

    otherNodes.forEach((node, index) => {
      const angle = index * angleStep;
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
    });

    // Count connections
    this.edges.forEach((edge) => {
      const fromNode = this.nodes.find((n) => n.address === edge.from);
      const toNode = this.nodes.find((n) => n.address === edge.to);
      if (fromNode) fromNode.connections++;
      if (toNode) toNode.connections++;
      edge.types.forEach((type) => {
        fromNode?.tagTypes.add(type);
        toNode?.tagTypes.add(type);
      });
    });
  }

  getNode(address: string): RelationshipNode | undefined {
    return this.nodes.find((n) => n.address === address);
  }
}
