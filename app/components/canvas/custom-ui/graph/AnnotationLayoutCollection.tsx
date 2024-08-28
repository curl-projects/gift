import { Layout } from 'webcola';
import { BaseCollection } from "~/components/canvas/custom-ui/collections";
import { Editor, TLShape, TLShapeId } from '@tldraw/tldraw';

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
type AlignmentConstraint = {
  type: 'alignment',
  axis: 'y' | "x",
  offsets: { node: TLShapeId, offset: number }[]
}

type ColaConstraint = AlignmentConstraint

function getCornerToCenterOffset(w: number, h: number, rotation: number) {

    // Calculate the center coordinates relative to the top-left corner
    const centerX = w / 2;
    const centerY = h / 2;
  
    // Apply rotation to the center coordinates
    const rotatedCenterX = centerX * Math.cos(rotation) - centerY * Math.sin(rotation);
    const rotatedCenterY = centerX * Math.sin(rotation) + centerY * Math.cos(rotation);
  
    return { x: rotatedCenterX, y: rotatedCenterY };
  }

export class AnnotationLayoutCollection extends BaseCollection {
  override id = 'annotation';
  graphSim: Layout;
  animFrame = -1;
  colaNodes: Map<TLShapeId, ColaNode> = new Map();
  colaConstraints: ColaConstraint[] = [];

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
      if (shape.type === "annotation") {
        this.addAnnotation(shape);
      }
    }
    this.refreshGraph();
  }

  override onRemove(shapes: TLShape[]) {
    const removedShapeIds = new Set(shapes.map(shape => shape.id));

    for (const shape of shapes) {
      if (shape.type === "annotation") {
        this.colaNodes.delete(shape.id);
      }
    }

    this.refreshGraph();
  }

  override onShapeChange(prev: TLShape, next: TLShape) {
  }


  step = () => {
    console.log("STEPPING!")
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
  
          // update shape position
          this.editor.updateShape({
            id: node.id,
            type: "annotation",
            y: node.y - y,
          });
    }
  };

  addAnnotation = (shape: TLShape) => {
    const { w, h } = this.editor.getShapeGeometry(shape).bounds
    const node: ColaNode = {
      id: shape.id,
      x: shape.x,
      y: shape.y,
      width: w,
      height: h,
      rotation: shape.rotation,
      color: (shape.props as any).color
    };
    this.colaNodes.set(shape.id, node);
  }

  refreshGraph() {
    this.refreshConstraints();
    const nodes = [...this.colaNodes.values()];
    const nodeIdToIndex = new Map(nodes.map((n, i) => [n.id, i]));

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
      .constraints(constraints)
      .avoidOverlaps(true)
      .handleDisconnected(false)
    //   .start(0, 0, 1, 0, false, false); // Ensure the simulation starts with the correct parameters
  }

  refreshConstraints() {
    const constraints: ColaConstraint[] = []; // Explicitly type the constraints array

    // Add vertical spacing constraints for all pairs of annotations
    const annotationNodes = [...this.colaNodes.values()];
    for (let i = 0; i < annotationNodes.length; i++) {
      for (let j = i + 1; j < annotationNodes.length; j++) {
        const nodeA = annotationNodes[i];
        const nodeB = annotationNodes[j];
        const minDistance = (nodeA.height / 2) + (nodeB.height / 2) + 10;
        constraints.push({
          type: 'alignment', 
          axis: 'x',
          offsets: [
            { node: nodeA.id, offset: 0 },
            { node: nodeB.id, offset: 20 }
          ]
        } as AlignmentConstraint); // Explicitly cast to AlignmentConstraint
      }
    }

    this.colaConstraints = constraints;
  }
}