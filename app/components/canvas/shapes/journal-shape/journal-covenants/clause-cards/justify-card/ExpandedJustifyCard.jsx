import { useState, useEffect } from 'react';
import styles from './ExpandedJustifyCard.module.css';
import { EditorContent, useEditor } from '@tiptap/react';
import { Node } from "@tiptap/core";
import StarterKit from '@tiptap/starter-kit';

import { Heading } from '@tiptap/extension-heading';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import Link from "@tiptap/extension-link";
import Placeholder from '@tiptap/extension-placeholder'
import * as showdown from 'showdown';
import { CovenantConjunction, CovenantClause } from "~/components/canvas/custom-ui/utilities/ConstellationLabelPainter.jsx"

export function ExpandedJustifyCard({ modifier, currentCount = 1, titleScale=0.6}) {
    const [htmlContent, setHtmlContent] = useState("");
    const converter = new showdown.Converter();

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
            placeholder: "Capture your thoughts",
            showOnlyWhenEditable: false,
            emptyNodeClass: styles.isEmpty,
            emptyEditorClass: styles.empty,
        }),
        ],
        content: htmlContent,
        editable: true,
        onUpdate: ({ editor }) => {
        },
        onSelectionUpdate: ({ editor }) => {
        }
    })

    useEffect(() => {
        if (editor) {
          editor.commands.setContent(htmlContent);
        //   editor.commands.focus(); // Automatically focus the editor
        }
      }, [htmlContent, editor]);

    return (
        <div style={{
            height: '100%',
            width: '100%',
            overflow: 'scroll',
        }}>
            <div className={styles.expandedJustifyCard} style={{
                // this is completely necessary to avoid subpixel antialiasing issues with chrome and other wekbit browsers
                display: 'table', 
                tableLayout: 'fixed',
                width: '100%',
                height: '100%',
                border: '2px solid black',
                // overflow: 'scroll',
                
            }}>
                <p className={styles.clauseTitleContainer} style={{
                    transform: `scale(${titleScale})`,
                    width: `${100/titleScale}%`,
                    transformOrigin: 'top left',
                }}>
                    <CovenantConjunction modifier={modifier} />
                    <CovenantClause modifier={modifier} currentCount={currentCount} />
                </p>
                <EditorContent 
                    editor={editor} 
                    className={styles.justifyCardEditor}
                    style={{
                        transform: `perspective(1px)`,
                    }}
                />
            </div>
        </div>
    )
}