import { useState, useEffect } from 'react';
import styles from './ModernJournal.module.css';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from "@tiptap/extension-link";
import * as showdown from 'showdown';
import { useLoaderData } from '@remix-run/react';
import { JournalThread } from '~/components/canvas/shapes/journal-shape/parchment-journal/journal-thread/JournalThread.jsx'

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
      const page = data.journalEntries.filter(entry => entry.type === 'journalPage').find(page => page.url === journalMode.page)
        setHtmlContent(converter.makeHtml(page.content) || "")
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
      <>
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

        <svg className={styles.animatedLine} viewBox={`0 0 ${shape.props.w} ${shape.props.h}`}>
          <JournalThread 
            d={`M -5 -5 L ${shape.props.w + 5} -5 L ${shape.props.w + 5} ${shape.props.h + 5} L -5 ${shape.props.h + 5} Z`} 
            delay={0} 
            duration={1} 
            strokeWidth={1} 
            pageContainer 
            />
        </svg>
        </>
    )
}