import styles from './ConnectCard.module.css'
import { EditorContent, useEditor } from '@tiptap/react';
import { useState, useEffect, useRef } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Link from "@tiptap/extension-link";
import * as showdown from 'showdown';
import Placeholder from '@tiptap/extension-placeholder'
import { useCovenantContext } from "~/components/synchronization/CovenantContext"
import { useEditor as useTldrawEditor } from "tldraw"
import { useStarFireSync } from "~/components/synchronization/StarFireSync"
import { motion, AnimatePresence } from "framer-motion"
import { CovenantMainClause } from "~/components/canvas/custom-ui/utilities/ConstellationLabelPainter.jsx"
import { useCardState } from "~/components/canvas/shapes/journal-shape/journal-covenants/CardStateContext.jsx"
import { ConnectCardStars } from "./ConnectCardStars.jsx"

export function ConnectCard(){
    const [htmlContent, setHtmlContent] = useState("");
    const converter = new showdown.Converter();
  
  useEffect(() => {
    console.log("HTML CONTENT:", htmlContent)
  }, [htmlContent])

    const editor = useEditor({
        extensions: [
          StarterKit.configure({
            heading: true,
            paragraph: true
          }),
          // ColorHighlighter.configure({
          //   data: ['Hello'],
          //   tldrawEditor: tldrawEditor,
          // }),
          //   CustomHeading,
          //   CustomParagraph,
          Link,
          Placeholder.configure({
            placeholder: "Select something...",
            showOnlyWhenEditable: false,
            emptyNodeClass: styles.isEmpty,
            emptyEditorClass: styles.empty,
        }),
        ],
        content: htmlContent,
        editable: false,
        // onUpdate: ({ editor }) => {
        //   setHtmlContent(editor.getHTML());
        // },
        onSelectionUpdate: ({ editor }) => {
        }
    })

    useEffect(() => {
        if (editor) {
          editor.commands.setContent(htmlContent);
        }
      }, [htmlContent, editor]);

    return(
        <div 
            className={styles.connectCardContainer}
            >
            <div className={styles.connectCardSelection}>
            <EditorContent 
                editor={editor} 
                className={styles.connectCardEditor}
            />
            </div>
            {htmlContent !== "" &&
              <div className={styles.connectToThoughtBox}>
                  <ConnectCardStars />
              </div>
            }
        </div>
    )
}