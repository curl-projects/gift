import React, { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from "@tiptap/extension-link";
import ListItem from '@tiptap/extension-list-item'
import OrderedList from '@tiptap/extension-ordered-list'
import BulletList from '@tiptap/extension-bullet-list'

import * as showdown from 'showdown';


export default function ExcerptMediaEditor({ media }) {
  const converter = new showdown.Converter();
  const [htmlContent, setHtmlContent] = useState(converter.makeHtml(media?.content || ""));

  useEffect(() => {
    console.log("HMTL CONTENT:", htmlContent)
  }, [htmlContent]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      ListItem,
      OrderedList,
      BulletList,
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