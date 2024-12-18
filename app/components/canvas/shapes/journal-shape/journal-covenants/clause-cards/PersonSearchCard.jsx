import styles from "./PersonSearchCard.module.css"
import { useEffect, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { Node } from "@tiptap/core";
import { Heading } from '@tiptap/extension-heading';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import Link from "@tiptap/extension-link";
import Placeholder from '@tiptap/extension-placeholder'
import * as showdown from 'showdown';

const OneLiner = Node.create({
  name: "oneLiner",
  topNode: true,
  content: "block",
});

export function PersonSearchCard(){
    const [htmlContent, setHtmlContent] = useState("");
    const converter = new showdown.Converter();

    const editor = useEditor({
        extensions: [
          OneLiner,
          Text,
          Paragraph,
          Heading,
          // ColorHighlighter.configure({
          //   data: ['Hello'],
          //   tldrawEditor: tldrawEditor,
          // }),
          //   CustomHeading,
          //   CustomParagraph,
          Link,
          Placeholder.configure({
            placeholder: "Search for a person...",
            showOnlyWhenEditable: false,
        }),
        ],
        content: htmlContent,
        editable: true,
        onUpdate: ({ editor }) => {
        },
        onSelectionUpdate: ({ editor }) => {
        }
    })

    useEffect(() => {
        if (editor) {
          editor.commands.setContent(htmlContent);
        }
      }, [htmlContent, editor]);

    return(
        <div className={styles.personSearchCard}>
            <EditorContent 
                editor={editor} 
                className="journal-tiptap"
            />
        </div>   
    )
}