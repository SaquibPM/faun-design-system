/** A node in a hierarchy: a leaf has a `value`; a branch gets the sum of its children. */
export interface HierarchyNode {
  /** Stable id. Defaults to the path of labels. */
  id?: string;
  label: string;
  /** Leaves: the size of the node. Branches ignore it and take the sum of their children. */
  value?: number;
  /** A second measure on leaves, such as change against last year; colours a diverging treemap. */
  change?: number;
  children?: HierarchyNode[];
}

export interface HNode {
  id: string;
  label: string;
  value: number;
  change?: number;
  depth: number;
  /** Labels from the root's children down to this node. */
  path: string[];
  /** Index among the root's children: the colour group. -1 for the root. */
  group: number;
  parent: HNode | null;
  children: HNode[];
}

/** Builds the working tree: sums values up, drops empty leaves (a treemap or circle cannot draw a zero), numbers colour groups by top-level child. */
export function buildHierarchy(root: HierarchyNode, keepEmpty = false): HNode {
  const walk = (n: HierarchyNode, parent: HNode | null, depth: number, group: number, path: string[]): HNode => {
    const here = depth === 0 ? [] : [...path, n.label];
    const node: HNode = { id: n.id ?? (here.join("/") || n.label), label: n.label, value: 0, change: n.change, depth, path: here, group, parent, children: [] };
    const kids = n.children ?? [];
    node.children = kids.map((c, i) => walk(c, node, depth + 1, depth === 0 ? i : group, here));
    node.value = kids.length > 0 ? node.children.reduce((s, c) => s + c.value, 0) : Math.max(n.value ?? 0, 0);
    if (!keepEmpty) node.children = node.children.filter((c) => c.value > 0 || c.children.length > 0);
    return node;
  };
  return walk(root, null, 0, -1, []);
}

export const leavesOf = (n: HNode): HNode[] => (n.children.length === 0 ? [n] : n.children.flatMap(leavesOf));
export const nodesOf = (n: HNode): HNode[] => [n, ...n.children.flatMap(nodesOf)];

export interface Rect { x: number; y: number; w: number; h: number }

/** Squarified treemap (Bruls, Huizing and van Wijk): rectangles of area proportional to value, kept close to square. Items with no value are skipped. */
export function squarify<T>(items: { item: T; value: number }[], rect: Rect): { item: T; rect: Rect }[] {
  const list = items.filter((i) => i.value > 0).sort((a, b) => b.value - a.value);
  const total = list.reduce((s, i) => s + i.value, 0);
  if (list.length === 0 || rect.w <= 0 || rect.h <= 0) return [];
  const scale = (rect.w * rect.h) / total;
  const scaled = list.map((i) => ({ item: i.item, a: i.value * scale }));
  const out: { item: T; rect: Rect }[] = [];
  let { x, y, w, h } = rect;
  const worst = (row: { a: number }[], side: number) => {
    const s = row.reduce((n, r) => n + r.a, 0);
    const mx = Math.max(...row.map((r) => r.a)); const mn = Math.min(...row.map((r) => r.a));
    return Math.max((side * side * mx) / (s * s), (s * s) / (side * side * mn));
  };
  let i = 0;
  while (i < scaled.length) {
    const side = Math.min(w, h);
    let row = [scaled[i]!]; i += 1;
    while (i < scaled.length && worst([...row, scaled[i]!], side) <= worst(row, side)) { row = [...row, scaled[i]!]; i += 1; }
    const s = row.reduce((n, r) => n + r.a, 0);
    if (w >= h) {
      const cw = s / h; let cy = y;
      for (const r of row) { const rh = r.a / cw; out.push({ item: r.item, rect: { x, y: cy, w: cw, h: rh } }); cy += rh; }
      x += cw; w -= cw;
    } else {
      const rh = s / w; let cx = x;
      for (const r of row) { const rw = r.a / rh; out.push({ item: r.item, rect: { x: cx, y, w: rw, h: rh } }); cx += rw; }
      y += rh; h -= rh;
    }
  }
  return out;
}

export interface Circle { x: number; y: number; r: number }

/** Places circles so none overlap, packed towards the origin; returns the enclosing circle. Circles are positioned in place. */
export function packSiblings(circles: Circle[]): Circle {
  const placed: Circle[] = [];
  const order = [...circles].sort((a, b) => b.r - a.r);
  for (const c of order) {
    if (placed.length === 0) { c.x = 0; c.y = 0; placed.push(c); continue; }
    if (placed.length === 1) { const a = placed[0]!; c.x = a.x + a.r + c.r; c.y = a.y; placed.push(c); continue; }
    let best: { x: number; y: number } | null = null; let bestD = Infinity;
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const a = placed[i]!; const b = placed[j]!;
        const ra = a.r + c.r; const rb = b.r + c.r;
        const dx = b.x - a.x; const dy = b.y - a.y; const d = Math.hypot(dx, dy);
        if (d > ra + rb || d < Math.abs(ra - rb) || d === 0) continue;
        const l = (ra * ra - rb * rb + d * d) / (2 * d);
        const hh = Math.sqrt(Math.max(ra * ra - l * l, 0));
        const mx = a.x + (l * dx) / d; const my = a.y + (l * dy) / d;
        for (const sign of [1, -1]) {
          const p = { x: mx + (sign * hh * -dy) / d, y: my + (sign * hh * dx) / d };
          if (placed.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < q.r + c.r - 1e-6)) continue;
          const dist = Math.hypot(p.x, p.y);
          if (dist < bestD) { bestD = dist; best = p; }
        }
      }
    }
    if (best) { c.x = best.x; c.y = best.y; } else { const last = placed[placed.length - 1]!; c.x = last.x + last.r + c.r; c.y = last.y; }
    placed.push(c);
  }
  return enclose(circles);
}

/** Centres the circles on their bounding box and returns the circle that contains all of them. */
export function enclose(circles: Circle[]): Circle {
  if (circles.length === 0) return { x: 0, y: 0, r: 0 };
  const minX = Math.min(...circles.map((c) => c.x - c.r)); const maxX = Math.max(...circles.map((c) => c.x + c.r));
  const minY = Math.min(...circles.map((c) => c.y - c.r)); const maxY = Math.max(...circles.map((c) => c.y + c.r));
  const cx = (minX + maxX) / 2; const cy = (minY + maxY) / 2;
  for (const c of circles) { c.x -= cx; c.y -= cy; }
  return { x: 0, y: 0, r: Math.max(...circles.map((c) => Math.hypot(c.x, c.y) + c.r)) };
}

export interface PackedNode { node: HNode; x: number; y: number; r: number }

/** Nested circle packing: leaf area is proportional to value; each branch circle encloses its children with a little padding. */
export function packHierarchy(root: HNode, pad = 3): PackedNode[] {
  type Packed = { node: HNode; r: number; x: number; y: number; kids: Packed[] };
  const build = (n: HNode): Packed => {
    if (n.children.length === 0) return { node: n, r: Math.sqrt(n.value), x: 0, y: 0, kids: [] };
    const kids = n.children.map(build);
    const outer = packSiblings(kids);
    return { node: n, r: outer.r + pad, x: 0, y: 0, kids };
  };
  const top = build(root);
  const out: PackedNode[] = [];
  const place = (p: Packed, ox: number, oy: number) => {
    const x = ox + p.x; const y = oy + p.y;
    out.push({ node: p.node, x, y, r: p.r });
    p.kids.forEach((k) => place(k, x, y));
  };
  place(top, 0, 0);
  return out;
}

export interface TreeLayoutNode { node: HNode; depth: number; leafIndex: number; row: number }

/** Tidy tree rows: leaves take consecutive rows, a parent sits at the mean row of its children. Returns nodes in reading (depth-first) order. */
export function treeRows(root: HNode): { nodes: { node: HNode; row: number; leaf: boolean }[]; rows: number; depth: number } {
  let next = 0; let maxDepth = 0;
  const out: { node: HNode; row: number; leaf: boolean }[] = [];
  const walk = (n: HNode): number => {
    maxDepth = Math.max(maxDepth, n.depth);
    const entry = { node: n, row: 0, leaf: n.children.length === 0 };
    out.push(entry);
    if (n.children.length === 0) { entry.row = next; next += 1; return entry.row; }
    const rows = n.children.map(walk);
    entry.row = (rows[0]! + rows[rows.length - 1]!) / 2;
    return entry.row;
  };
  walk(root);
  return { nodes: out, rows: next, depth: maxDepth };
}
