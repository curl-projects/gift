import { useState, useEffect } from 'react';
import styles from './ModernJournal.module.css';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from "@tiptap/extension-link";
import * as showdown from 'showdown';
import { useLoaderData } from '@remix-run/react';

const pages = [
    { page: 'elevator-pitch', 
      content: 'elevator-pitch' },
]
export function ModernJournal({ shape, journalMode, contentRef }){
    const data = useLoaderData();
    const converter = new showdown.Converter();
    const [htmlContent, setHtmlContent] = useState("");

    useEffect(()=>{
      console.log("DATA:", data.journalEntries)
        setHtmlContent(converter.makeHtml(data.journalEntries[0].content) || "")
    }, [data])

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
        ],
        content: htmlContent,
        onUpdate: ({ editor }) => {
          setHtmlContent(editor.getHTML());
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
        <div className={styles.shapeContent}
            ref={contentRef}
            onPointerDown={(e) => {
                e.stopPropagation();
            }}
            onScrollCapture={(e) => e.stopPropagation()}
            onWheelCapture={(e) => {
                e.stopPropagation();
            }}
        >
            <EditorContent 
                editor={editor}
                className="journal-tiptap"
            />
        </div>
    )
}