import { Plugin } from '@tiptap/pm/state'
import { Node } from '@tiptap/pm/model'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { Extension } from '@tiptap/core'

function rgbToRgba(rgbString, alpha = 0.3) {
  // Match the RGB values using a regular expression
  console.log("RGB STRING:", rgbString)
  const rgbMatch = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

  if(rgbMatch){
    // Extract the R, G, and B values
    const [r, g, b] = rgbMatch.slice(1).map(Number);
    // Return the RGBA string
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  console.warn("No RGB String Found")
  return rgbString
}

function findColors(doc: Node, highlights: { from: number, to: number }[], color: string): DecorationSet {
  const decorations: Decoration[] = []

  highlights.forEach(({ from, to }) => {
    const decoration = Decoration.inline(from, to, {
      class: 'concept-highlight',
      style: `--concept-highlight-color-border: ${color}; --concept-highlight-color: ${rgbToRgba(color)}`,
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
      updateData: (attributes?: { highlights: { from: number, to: number }[], color: string }) => ReturnType,
    }
  }
}

export const ColorHighlighter = Extension.create({
  name: 'colorHighlighter',

  addCommands() {
    return {
      updateData: ({ highlights, color }) => ({ commands }) => {
        console.log("NEW HIGHLIGHT DATA:", highlights)
        this.storage.highlights = highlights;
        this.storage.color = color;
        return true;
      },
    }
  },

  addStorage() {
    return {
      highlights: this.options?.highlights || [],
      color: this.options?.color || "rgb(130, 162, 223)"
    }
  },

  addOptions() {
    return {
      highlights: [],
      color: "rgb(130, 162, 223)"
    }
  },

  addProseMirrorPlugins() {
    const findColorsWithStorage = (doc) => findColors(doc, this.storage.highlights, this.storage.color)

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
        },
      }),
    ]
  },
})