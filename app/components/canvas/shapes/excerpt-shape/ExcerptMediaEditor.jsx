import React, { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from "@tiptap/extension-link";
import * as showdown from 'showdown';
import { Heading } from '@tiptap/extension-heading';
import { Paragraph } from '@tiptap/extension-paragraph';

// const CustomHeading = Heading.extend({
//   renderHTML({ node, HTMLAttributes }) {
//     const tag = `h${node.attrs.level}`;
//     const content = node.textContent;
//     const wrappedContent = Array.from(content).map(char => ['span', {}, char]);

//     return [
//       tag,
//       HTMLAttributes,
//       ...wrappedContent,
//     ];
//   },
// });

// const CustomParagraph = Paragraph.extend({
//     renderHTML({ node, HTMLAttributes }) {
//       const content = node.textContent;
//       const wrappedContent = Array.from(content).map(char => ['span', {}, char]);
  
//       return [
//         'p',
//         HTMLAttributes,
//         ...wrappedContent,
//       ];
//     },
//   });

export default function ExcerptMediaEditor({ media }) {
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
    //   CustomHeading,
    //   CustomParagraph,
      Link,
    ],
    content: htmlContent,
    onUpdate: ({ editor }) => {
      setHtmlContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(htmlContent);
    }
  }, [htmlContent, editor]);

  return (
    <div style={{
        height: "100%",
        width: '100%',
    }}>
      <EditorContent editor={editor} />
    </div>
  );
}