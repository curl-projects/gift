import React, { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from "@tiptap/extension-link";
import * as showdown from 'showdown';
import { Heading } from '@tiptap/extension-heading';
import { Paragraph } from '@tiptap/extension-paragraph';
import { stopEventPropagation } from 'tldraw';
import { ColorHighlighter } from "~/components/canvas/custom-ui/text-editor/HighlightExtension"

export default function ExcerptMediaEditor({ content, media }) {
  const converter = new showdown.Converter();
  const [htmlContent, setHtmlContent] = useState(converter.makeHtml(media?.content || ""));

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
    onSelectionUpdate: () => {
    }
  });
  
  useEffect(()=>{
    console.log("CONTENT:", content)
    editor.commands.updateData({
        highlights: [content],
        color: "rgb(130, 162, 223)"
    })

    setTimeout(() => {
        const firstHighlight = document.querySelector('.concept-highlight');
        console.log("FIRST HIGHLIGHT:", firstHighlight)
        if (firstHighlight) {
          firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500); // Adjust the delay as needed
  

  }, [editor, content])

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(htmlContent);
    }
  }, [htmlContent, editor]);

  return (
      <EditorContent editor={editor}
      />
  );
}