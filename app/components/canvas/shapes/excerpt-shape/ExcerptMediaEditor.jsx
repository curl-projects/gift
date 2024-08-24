import React, { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from "@tiptap/extension-link";
import * as showdown from 'showdown';
import { Heading } from '@tiptap/extension-heading';
import { Paragraph } from '@tiptap/extension-paragraph';
import { createShapeId } from 'tldraw';
import { ColorHighlighter } from "~/components/canvas/custom-ui/text-editor/HighlightExtension"

export default function ExcerptMediaEditor({ excerpt, tldrawEditor }) {
  const converter = new showdown.Converter();
  const [htmlContent, setHtmlContent] = useState(converter.makeHtml(excerpt.props.media?.content || ""));

  useEffect(() => {
    console.log("HTML CONTENT:", htmlContent);
  }, [htmlContent]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: true,
        paragraph: true
      }),
      ColorHighlighter.configure({
        data: ['Hello']
      }),
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
        console.log("FROM:", from)
        console.log("TO:", to)
    
        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        
        const fragment = editor.state.doc.cut(from, to);
        const nodes = [];
        fragment.forEach(node => {
          nodes.push(node.toJSON());
        });

        const tempAnnotationId = createShapeId('temp-annotation')

        if(nodes && nodes.length !== 0){
            // set visible if not visible 
            const tempAnnotation = tldrawEditor.getShape({type: "annotation", id: tempAnnotationId})
            if(!tempAnnotation){
                console.log("CREATING TEMP ANNOTATION")
                tldrawEditor.createShape({
                    id: tempAnnotationId,
                    type: 'annotation',
                    isLocked: false,
                    opacity: 1,
                }).createBinding({
                    fromId: tempAnnotationId,
                    toId: excerpt.id,
                    type: "annotation" ,
                    props: {

                    }
                })
            }
            else{
                tldrawEditor.updateShape({
                    id: tempAnnotationId,
                    type: 'annotation',
                    isLocked: false,
                    opacity: 1
                })
            }
            
        }
        else if(nodes && nodes.length === 0){
            tldrawEditor.updateShape({
                id: tempAnnotationId,
                type: 'annotation',
                isLocked: true,
                opacity: 0
            })
        }

        
        console.log("SELECTED TEXT:", selectedText)
        console.log("NODES:", nodes)


      const selection = window.getSelection();
      if(selection.rangeCount > 0){
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        console.log("RECT", rect)
    }
    }
  });
  
  useEffect(()=>{
    editor.commands.updateData({
        highlights: [excerpt.props.content],
        color: "rgb(130, 162, 223)"
    })

    setTimeout(() => {
        const firstHighlight = document.querySelector('.concept-highlight');
        console.log("FIRST HIGHLIGHT:", firstHighlight)
        if (firstHighlight) {
          firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
  

  }, [editor, excerpt.props.content])

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(htmlContent);
    }
  }, [htmlContent, editor]);

  return (
      <EditorContent 
        editor={editor}
      />
  );
}