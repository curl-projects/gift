import { useEffect, useState } from 'react';
import { useStarFireSync } from '~/components/synchronization/StarFireSync';
import { useDataContext } from '~/components/synchronization/DataContext';
import { useCovenantContext } from "~/components/synchronization/CovenantContext"

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from "@tiptap/extension-link";
import * as showdown from 'showdown';


export function JournalArticle(){
    const { data } = useDataContext();
    const [htmlContent, setHtmlContent] = useState("");
    const converter = new showdown.Converter();
    const { journalMode, setJournalMode } = useStarFireSync();
    const { setSelectedText } = useCovenantContext()

    
     // load data
    useEffect(() => {
        const content = journalMode.content || "";
        if (content) {
        setHtmlContent(converter.makeHtml(content) || "")
        }
        else {
        setHtmlContent("")
    }
  }, [data, journalMode])

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
          const { from, to } = editor.state.selection;
        
          const fragment = editor.state.doc.cut(from, to);
          const nodes = [];
          fragment.forEach(node => {
            nodes.push(node.toJSON());
          });
    
          setSelectedText({value: fragment})


          if(nodes && nodes.length !== 0){
            setJournalMode({...journalMode, position: 'left'})
          }
        }
      })
    
      // update editor content
      useEffect(() => {
        if (editor) {
          editor.commands.setContent(htmlContent);
        }
      }, [htmlContent, editor]);


    return (
        <div style={{
            width: '100%',
            height: '100%',
            overflow: 'scroll',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
        }}>
        <EditorContent editor={editor} className="journal-tiptap" />
        </div>
    )
}