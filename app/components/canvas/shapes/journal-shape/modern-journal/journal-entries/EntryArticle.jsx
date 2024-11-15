import styles from './EntryArticle.module.css'

import { useEffect, useState } from 'react';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from "@tiptap/extension-link";
import * as showdown from 'showdown';


export function EntryArticle({ content }){
    const [htmlContent, setHtmlContent] = useState("");
    const converter = new showdown.Converter();

    
     // load data
    useEffect(() => {
        if (content) {
        setHtmlContent(converter.makeHtml(content) || "")
        }
        else {
        setHtmlContent("")
    }
  }, [content])

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
      })
    
      // update editor content
      useEffect(() => {
        if (editor) {
          editor.commands.setContent(htmlContent);
        }
      }, [htmlContent, editor]);


    return(
        <div className={styles.entryArticle}>
            <EditorContent editor={editor} className={styles.articleContent} />
        </div>
    )
}