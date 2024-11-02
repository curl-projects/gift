import styles from './JustifyCard.module.css';
import { EditorContent, useEditor } from '@tiptap/react';
import { useState, useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Link from "@tiptap/extension-link";
import * as showdown from 'showdown';
import Placeholder from '@tiptap/extension-placeholder'
import { useStarFireSync } from "~/components/synchronization/StarFireSync"

export function JustifyCard({ covenant }){
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
            placeholder: "Offer up something...",
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
           <EditorContent 
                editor={editor} 
                className="journal-tiptap"
            />
        </div>
    )
}