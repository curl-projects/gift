import styles from './ConnectCard.module.css'
import { EditorContent, useEditor } from '@tiptap/react';
import { useState, useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Link from "@tiptap/extension-link";
import * as showdown from 'showdown';
import Placeholder from '@tiptap/extension-placeholder'
import { useCovenantContext } from "~/components/synchronization/CovenantContext"

export function ConnectCard({ index, selectionFragment, covenant }){
    const [htmlContent, setHtmlContent] = useState("");
    const converter = new showdown.Converter();
    const { covenantCompletion, setCovenantCompletion, setExpandedIndex } = useCovenantContext()

    // load data
    useEffect(() => {
    console.log("SELECTION FRAGMENT:", selectionFragment)

    const existingCovenant = covenantCompletion.find(covenant => covenant.id === covenant.id)

        if (selectionFragment && selectionFragment.textContent) {
            setHtmlContent(converter.makeHtml(selectionFragment.textContent) || "")
            const newCovenant = {
                ...existingCovenant,
                completionPercentage: 50
            }
            setCovenantCompletion(covenantCompletion.map(covenant => covenant.id === covenant.id ? newCovenant : covenant))
            setExpandedIndex(index)
        }
        else {
        setHtmlContent("")
        const newCovenant = {
            ...existingCovenant,
            completionPercentage: 0
        }
        setCovenantCompletion(covenantCompletion.map(covenant => covenant.id === covenant.id ? newCovenant : covenant))
        setExpandedIndex(null)
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
          Placeholder.configure({
            placeholder: "Select something...",
            showOnlyWhenEditable: false,
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
        <div className={styles.connectCardContainer}>
            <div className={styles.connectCardSelection}>
            <EditorContent 
                editor={editor} 
                className="journal-tiptap"
            />
            </div>
            {htmlContent !== "" &&
                <div className={styles.connectToThoughtBox}>
                    Attach thought
                </div>
            }
        </div>
    )
}