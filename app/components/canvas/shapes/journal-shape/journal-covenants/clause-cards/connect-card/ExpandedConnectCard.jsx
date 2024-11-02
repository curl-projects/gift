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
import { englishToLepchaMap } from "~/components/canvas/helpers/language-funcs.js"

import { ConstellationLabelSuperscript } from "~/components/canvas/custom-ui/utilities/constellation-label-components/ConstellationLabelSuperscript.jsx"
import { ConstellationLabelTooltip } from "~/components/canvas/custom-ui/utilities/constellation-label-components/ConstellationLabelTooltip.jsx"

const OneLiner = Node.create({
    name: "oneLiner",
    topNode: true,
    content: "block",
});

export function ExpandedConnectCard() {
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

    return (
        <>
            <div className={styles.covenantTitle}>
                <p>
                    <ConstellationLabelTooltip tooltipText="Connect" variant="mainClause">
                        <ConstellationLabelSuperscript 
                        times={1} 
                        currentCount={0}
                        textData={(currentCount) => Array.from({ length: 1 })}
                        charMapper={(item, index) => englishToLepchaMap[String.fromCharCode(65 + index)]}
                        styleMapper={(item, index, currentCount) => index < currentCount ? "inactive" : "active"}
                        rightSpace
                    >
                        Connect 
                    </ConstellationLabelSuperscript>
                </ConstellationLabelTooltip>
                    one 
                <ConstellationLabelSuperscript
                    times={1}
                    currentCount={0}
                    textData={(currentCount, times) =>
                        Array.from(currentCount === 1 || times === 1 ? "idea" : "ideas")
                    }
                    charMapper={(item, index) => englishToLepchaMap[item] || item}
                    styleMapper={(item, index, currentCount) =>
                        index < currentCount ? "inactive" : "active"
                    }
                    superscriptStyles={(index) => ({
                        position: 'relative',
                        left: index === 0 ? '-6px' : `${-9 + index * 11}px`,
                    })}
                    leftSpace
                    rightSpace
                >
                    idea
                </ConstellationLabelSuperscript>

                    to your 
                    <ConstellationLabelTooltip tooltipText="to your own work" variant="mainClause" leftSpace>
                        own work
                    </ConstellationLabelTooltip>
                </p>

            </div>
            <div className={styles.covenantEntrySearch}>
                <EditorContent
                    editor={editor}
                    className={styles.searchText}
                />
            </div>
        </>
    );
}

export function ConnectItem() {
    return (
        <div className={styles.connectItem}>
            <p className={styles.connectItemTitle}>Connect Item Title</p>
            <p className={styles.connectItemDescription}>Connect Item Description</p>
        </div>
    )
}