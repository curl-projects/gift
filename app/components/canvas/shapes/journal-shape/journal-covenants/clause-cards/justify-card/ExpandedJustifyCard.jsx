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


export function ExpandedJustifyCard() {
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
        }
      }, [htmlContent, editor]);



    return (
        <div className={styles.expandedJustifyCard}>
            <EditorContent 
                editor={editor} 
                className={styles.justifyCardEditor}
            />
        </div>
    )
}