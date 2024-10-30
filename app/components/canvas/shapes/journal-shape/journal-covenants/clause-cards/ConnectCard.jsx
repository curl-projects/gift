import styles from './ConnectCard.module.css'
import { EditorContent, useEditor } from '@tiptap/react';
import { useState, useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Link from "@tiptap/extension-link";
import * as showdown from 'showdown';

export function ConnectCard({ selectionFragment }){
    const [htmlContent, setHtmlContent] = useState("");
    const converter = new showdown.Converter();

    // load data
    useEffect(() => {
    console.log("SELECTION FRAGMENT:", selectionFragment)

        if (selectionFragment) {
            setHtmlContent(converter.makeHtml(selectionFragment.textContent) || "")
        }
        else {
      setHtmlContent("")
    }
  }, [selectionFragment])  


  
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
        <div className={styles.connectCard}>
            <EditorContent 
                editor={editor} 
                className="journal-tiptap"
            />
        
        </div>
    )
}