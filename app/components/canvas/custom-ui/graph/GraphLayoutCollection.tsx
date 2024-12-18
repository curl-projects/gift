import { Layout } from 'webcola';
import { BaseCollection } from "~/components/canvas/custom-ui/collections";
import { Editor, TLGeoShape, TLShape, TLShapeId } from '@tldraw/tldraw';
import { TLThreadBindingProps } from "~/components/canvas/bindings/thread-binding/TLThreadBinding"
import { TLThreadShape } from "~/components/canvas/shapes/thread-shape/threadtypes/TLThreadShape"

const LINK_DISTANCE = 100;


type ColaNode = {
  id: TLShapeId;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color?: string;
};
type ColaIdLink = {
  source: TLShapeId
  target: TLShapeId
};
type ColaNodeLink = {
  source: ColaNode
  target: ColaNode
};

type AlignmentConstraint = {
  type: 'alignment',
  axis: 'x' | 'y',
  offsets: { node: TLShapeId, offset: number }[]
}

type ColaConstraint = AlignmentConstraint

export class GraphLayoutCollection extends BaseCollection {
  override id = 'graph';
  graphSim: Layout;
  animFrame = -1;
  colaNodes: Map<TLShapeId, ColaNode> = new Map();
  colaLinks: Map<TLShapeId, ColaIdLink> = new Map();
  colaConstraints: ColaConstraint[] = [];
  frameCounter: number; // Declare the frame counter

  constructor(editor: Editor) {
    super(editor)
    this.graphSim = new Layout();
    
    this.simLoop = this.simLoop.bind(this); // Bind the simLoop function
    this.simLoop(); // Start the simulation loop
  }

  startSimulation() {
    if (this.animFrame === -1) {
      this.simLoop(); // Restart the simulation loop
    }
  }

  stopSimulation() {
    if (this.animFrame !== -1) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = -1;
    }
  }

  simLoop() {
      this.step();
    this.animFrame = requestAnimationFrame(this.simLoop);
  }

  override onAdd(shapes: TLShape[]) {
    for (const shape of shapes) {
      if (shape.type !== "thread") {
        this.addGeo(shape);
      }
      else {
        this.addThread(shape as TLThreadShape);
      }
    }
    this.refreshGraph();
  }

  override onRemove(shapes: TLShape[]) {
    const removedShapeIds = new Set(shapes.map(shape => shape.id));

    for (const shape of shapes) {
      this.colaNodes.delete(shape.id);
      this.colaLinks.delete(shape.id);
    }

    // Filter out links where either source or target has been removed
    for (const [key, link] of this.colaLinks) {
      if (removedShapeIds.has(link.source) || removedShapeIds.has(link.target)) {
        this.colaLinks.delete(key);
      }
    }

    this.refreshGraph();
  }

  override onShapeChange(prev: TLShape, next: TLShape) {
    if (prev.type === 'geo' && next.type === 'geo') {
      const prevShape = prev as TLGeoShape
      const nextShape = next as TLGeoShape
      // update color if its changed and refresh constraints which use this
      if (prevShape.props.color !== nextShape.props.color) {
        const existingNode = this.colaNodes.get(next.id);
        if (existingNode) {
          this.colaNodes.set(next.id, {
            ...existingNode,
            color: nextShape.props.color,
          });
        }
        this.refreshGraph();
      }
    }
  }

  step = () => {
    this.graphSim.start(0, 0, 1, 0, false, false);
    
    for (const node of this.graphSim.nodes() as ColaNode[]) {

      const shape = this.editor.getShape(node.id);
      const { w, h } = this.editor.getShapeGeometry(node.id).bounds
      if (!shape) continue;

      const { x, y } = getCornerToCenterOffset(w, h, shape.rotation);

      // Fix positions if we're dragging them
      if (this.editor.getSelectedShapeIds().includes(node.id)) {
        node.x = shape.x + x;
        node.y = shape.y + y;
      }

      // Update shape props
      node.width = w;
      node.height = h;
      node.rotation = shape.rotation;

      this.editor.updateShape({
        id: node.id,
        type: "geo",
        x: node.x - x,
        y: node.y - y,
      });
    }
  };

  addThread = (thread: TLThreadShape) => {
  
      const sourceBinding = this.editor.getBindingsFromShape(thread, 'thread')?.find(binding => (binding.props as TLThreadBindingProps).terminal === 'start');
      const targetBinding = this.editor.getBindingsFromShape(thread, 'thread')?.find(binding => (binding.props as TLThreadBindingProps).terminal === 'end');
  
      const source = sourceBinding ? this.editor.getShape(sourceBinding.toId) : undefined;
      const target = targetBinding ? this.editor.getShape(targetBinding.toId) : undefined;
    
    if (source && target) {
      const link: ColaIdLink = {
        source: source.id,
        target: target.id
      };
      this.colaLinks.set(thread.id, link);
    }
  }

  addGeo = (shape: TLShape) => {
    const { w, h } = this.editor.getShapeGeometry(shape).bounds
    const { x, y } = getCornerToCenterOffset(w, h, shape.rotation)
    const node: ColaNode = {
      id: shape.id,
      x: shape.x + x,
      y: shape.y + y,
      width: w,
      height: h,
      rotation: shape.rotation,
      color: (shape.props as any).color
    };
    this.colaNodes.set(shape.id, node);
  }

  upsert(shape: TLShape) {
    if (!this.colaNodes.has(shape.id)) {
      this.addGeo(shape);
      this.refreshGraph();
    }
  }

  refreshGraph() {
    // TODO: remove this hardcoded behaviour
    // this.editor.selectNone()
    this.refreshConstraints();
    const nodes = [...this.colaNodes.values()];
    const nodeIdToIndex = new Map(nodes.map((n, i) => [n.id, i]));
    // Convert the Map values to an array for processing
    const links = Array.from(this.colaLinks.values()).map(l => ({
      source: nodeIdToIndex.get(l.source),
      target: nodeIdToIndex.get(l.target)
    }));

    const constraints = this.colaConstraints.map(constraint => {
      if (constraint.type === 'alignment') {
        return {
          ...constraint,
          offsets: constraint.offsets.map(offset => ({
            node: nodeIdToIndex.get(offset.node),
            offset: offset.offset
          }))
        };
      }
      return constraint;
    });

    this.graphSim
      .alpha(0.1)
      .nodes(nodes)
      // @ts-ignore
      .links(links)
      .constraints(constraints)
    //   you could use .linkDistance(250) too, which is stable but does not handle size/rotation
    //   .linkDistance(250)
    //   .jaccardLinkLengths(200, 2) 
    //   .symmetricDiffLinkLengths(100, 0.7) // Use symmetric difference similarity for link lengths
    // .linkDistance(150)
    //   .convergenceThreshold(0.001)
      .linkDistance((edge) => calcEdgeDistance(edge as ColaNodeLink))
      .avoidOverlaps(true)
      .handleDisconnected(false);
  }

  refreshConstraints() {
    const alignmentConstraintX: AlignmentConstraint = {
      type: 'alignment',
      axis: 'x',
      offsets: [],
    };
    const alignmentConstraintY: AlignmentConstraint = {
      type: 'alignment',
      axis: 'y',
      offsets: [],
    };

    // Iterate over shapes and generate constraints based on conditions
    for (const node of this.colaNodes.values()) {
      if (node.color === "red") {
        // Add alignment offset for red shapes
        alignmentConstraintX.offsets.push({ node: node.id, offset: 0 });
      }
      if (node.color === "blue") {
        // Add alignment offset for red shapes
        alignmentConstraintY.offsets.push({ node: node.id, offset: 0 });
      }
    }

    const constraints = [];
    if (alignmentConstraintX.offsets.length > 0) {
      constraints.push(alignmentConstraintX);
    }
    if (alignmentConstraintY.offsets.length > 0) {
      constraints.push(alignmentConstraintY);
    }
    this.colaConstraints = constraints;
  }
}

function getCornerToCenterOffset(w: number, h: number, rotation: number) {

  // Calculate the center coordinates relative to the top-left corner
  const centerX = w / 2;
  const centerY = h / 2;

  // Apply rotation to the center coordinates
  const rotatedCenterX = centerX * Math.cos(rotation) - centerY * Math.sin(rotation);
  const rotatedCenterY = centerX * Math.sin(rotation) + centerY * Math.cos(rotation);

  return { x: rotatedCenterX, y: rotatedCenterY };
}

function calcEdgeDistance(edge: ColaNodeLink) {

  // horizontal and vertical distances between centers
  const dx = edge.target.x - edge.source.x;
  const dy = edge.target.y - edge.source.y;

  // the angles of the nodes in radians
  const sourceAngle = edge.source.rotation;
  const targetAngle = edge.target.rotation;

  // Calculate the rotated dimensions of the nodes
  const sourceWidth = Math.abs(edge.source.width * Math.cos(sourceAngle)) + Math.abs(edge.source.height * Math.sin(sourceAngle));
  const sourceHeight = Math.abs(edge.source.width * Math.sin(sourceAngle)) + Math.abs(edge.source.height * Math.cos(sourceAngle));
  const targetWidth = Math.abs(edge.target.width * Math.cos(targetAngle)) + Math.abs(edge.target.height * Math.sin(targetAngle));
  const targetHeight = Math.abs(edge.target.width * Math.sin(targetAngle)) + Math.abs(edge.target.height * Math.cos(targetAngle));

  // Calculate edge-to-edge distances
  const horizontalGap = Math.max(0, Math.abs(dx) - (sourceWidth + targetWidth) / 2);
  const verticalGap = Math.max(0, Math.abs(dy) - (sourceHeight + targetHeight) / 2);

  // Calculate straight-line distance between the centers of the nodes
  const centerToCenterDistance = Math.sqrt(dx * dx + dy * dy);

  // Adjust the distance by subtracting the edge-to-edge distance and adding the desired travel distance
  const adjustedDistance = centerToCenterDistance -
    Math.sqrt(horizontalGap * horizontalGap + verticalGap * verticalGap) +
    LINK_DISTANCE;

  return adjustedDistance;
};
