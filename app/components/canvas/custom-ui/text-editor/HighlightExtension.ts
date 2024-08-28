import { Plugin } from '@tiptap/pm/state'
import { Node } from '@tiptap/pm/model'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { Extension } from '@tiptap/core'

function rgbToRgba(rgbString, alpha = 0.3) {
  console.log("RGB STRING:", rgbString)
  const rgbMatch = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

  if(rgbMatch){
    const [r, g, b] = rgbMatch.slice(1).map(Number);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
//   console.warn("No RGB String Found")
  return rgbString
}

function findColors(doc: Node, highlights: { from: number, to: number, color: string, shapeId: string }[]): DecorationSet {
  const decorations: Decoration[] = []

  highlights.forEach(({ from, to, color, shapeId }) => {
    const decoration = Decoration.inline(from, to, {
      class: 'concept-highlight',
      style: `--concept-highlight-color-border: ${color}; --concept-highlight-color: ${rgbToRgba(color)}`,
      'data-shape-id': shapeId, // Add a data attribute to identify the decoration
    });
    decorations.push(decoration);
  });

  return DecorationSet.create(doc, decorations);
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    highlight: {
      /**
       * Set a highlight mark
       * @param attributes The highlight attributes
       * @example editor.commands.setHighlight({ color: 'red' })
       */
      updateData: (attributes?: { highlights: { from: number, to: number, color: string }[] }) => ReturnType,
    }
  }
}

export const ColorHighlighter = Extension.create({
  name: 'colorHighlighter',

  addCommands() {
    return {
      updateData: ({ highlights }) => ({ commands }) => {
        console.log("NEW HIGHLIGHT DATA:", highlights)
        this.storage.highlights = highlights;
        return true;
      },
    }
  },

  addStorage() {
    return {
      highlights: this.options?.highlights || [],
      tldrawEditor: this.options?.tldrawEditor || null,
    }
  },

  addOptions() {
    return {
      highlights: [],
      tldrawEditor: null,
    }
  },

  addProseMirrorPlugins() {
    const findColorsWithStorage = (doc) => findColors(doc, this.storage.highlights)
    const tldrawEditor = this.options.tldrawEditor; // Capture tldrawEditor in a closure

    return [
      new Plugin({
        state: {
          init(_, { doc }) {
            return findColorsWithStorage(doc)
          },
          apply(transaction, oldState) {
            return transaction.docChanged ? findColorsWithStorage(transaction.doc) : oldState
          },
        },
        props: {
          decorations(state) {
            return this.getState(state)
          },
          handleClick(view, pos, event) {
            const target = event.target as HTMLElement;
            if (target.classList.contains('concept-highlight')) {
              const shapeId = target.getAttribute('data-shape-id');
              console.log('Clicked on highlight with shapeId:', shapeId);
              
              console.log("TLDRAW EDITOR:", tldrawEditor)
              tldrawEditor.updateShape({
                id: shapeId,
                props: {
                    selected: !tldrawEditor.getShape(shapeId).props.selected
                }
              })
              // Add your custom click handling logic here

              return true; // Prevent default behavior
            }
            return false; // Allow default behavior
          },
        },
      }),
    ]
  },
})