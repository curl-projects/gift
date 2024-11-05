import styles from './JustifyCard.module.css';
import { EditorContent, useEditor } from '@tiptap/react';
import { useState, useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Link from "@tiptap/extension-link";
import * as showdown from 'showdown';
import Placeholder from '@tiptap/extension-placeholder'
import { useStarFireSync } from "~/components/synchronization/StarFireSync"
import { useCardState } from "~/components/canvas/shapes/journal-shape/journal-covenants/CardStateContext.jsx"
import { motion, AnimatePresence } from 'framer-motion';

export function JustifyCard({ covenant }){
    const [htmlContent, setHtmlContent] = useState("");
    const { cardState, setCardState, cardClicked, setCardClicked } = useCardState();
    const converter = new showdown.Converter();
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        if (cardClicked && cardState === "disabled") {
            setShowPrompt(true);
            const timer = setTimeout(() => {
                setShowPrompt(false);
            }, 1000); // Adjust the time (in milliseconds) as needed
            return () => clearTimeout(timer);
        }
    }, [cardClicked]);

    useEffect(() => {
        console.log('CARD STATE', cardState)
    }, [cardState])

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
            placeholder: "Offer up something...",
            emptyNodeClass: styles.isEmpty,
            emptyEditorClass: styles.empty,
            showOnlyWhenEditable: false,
        }),
        ],
        content: htmlContent,
        editable: true,
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
        <div className={styles.justifyCard}>
            <AnimatePresence>
                {showPrompt ? (
                    <motion.p
                        className={styles.justifyCardDisabledPrompt}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                    >
                        Complete the covenant first
                    </motion.p>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <EditorContent 
                            editor={editor} 
                            className={styles.justifyCardEditor}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}