import { useEffect, useState } from 'react';
import styles from './ExpandedConnectCard.module.css'
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

export function ExpandedConnectCard() {
    const [height, setHeight] = useState(0);
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
            placeholder: "Search for something you've written",
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

    useEffect(() => {
        const updateHeight = () => {
            const aspectRatio = window.innerHeight / window.innerWidth;
            const width = document.querySelector(`.${styles.expandedConnectCard}`).offsetWidth;
            setHeight(width * aspectRatio);
        };

        updateHeight();
        window.addEventListener('resize', updateHeight);

        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    return (
        <div className={styles.expandedConnectCard} style={{ height }}>
           {/* <div className={styles.covenantTitle}>
            <h1>Expanded Connect Card</h1>
            <p></p>
           </div> */}
           <div className={styles.covenantEntrySearch}>
            <EditorContent 
                editor={editor} 
                className={styles.searchText}
            />
           </div>
        </div>
    );
}

export function ConnectItem(){
    return(
        <div className={styles.connectItem}>
            <p className={styles.connectItemTitle}>Connect Item Title</p>
            <p className={styles.connectItemDescription}>Connect Item Description</p>
        </div>
    )
}