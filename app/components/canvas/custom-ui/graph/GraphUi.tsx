import { useEditor } from "@tldraw/tldraw";
import { useEffect } from "react";
import styles from "./GraphUi.module.css";
import { useCollection } from "~/components/canvas/custom-ui/collections";

export const GraphUi = () => {
	const editor = useEditor();
	const { collection, size } = useCollection('graph')

	const handleAdd = () => {
		if (collection) {
			collection.add(editor.getSelectedShapes());
			editor.selectNone();
		}
	}

	const handleRemove = () => {
		if (collection) {
			collection.remove(editor.getSelectedShapes());
			editor.selectNone();
		}
	}

	const handleUpsert = () => {
		if (collection) {
			editor.getSelectedShapes().forEach(shape => collection.upsert(shape));
			editor.selectNone();
		}
	};

	const handleShortcut = () => {
		if (!collection) return;
		const empty = collection.getShapes().size === 0;
		if (empty)
			collection.add(editor.getCurrentPageShapes());
		else
			collection.clear();
	};

	const handleHighlight = () => {
		if (collection) {
			editor.setHintingShapes([...collection.getShapes().values()]);
		}
	}

	const handleHelp = () => {
		alert("Use the 'Add' and 'Remove' buttons to add/remove selected shapes, or hit 'G' to add/remove all shapes. \n\nUse the highlight button (🔦) to visualize shapes in the simulation. \n\nBLUE shapes are constrained horizontally, RED shapes are constrained vertically. This is just to demo basic constraints, I plan to demo more interesting constraints in the future. \n\nFor more details, check the project's README.");
	}

    const handleStartSimulation = () => {
		if (collection) {
			collection.startSimulation();
		}
	}

	const handleStopSimulation = () => {
		if (collection) {
			collection.stopSimulation();
		}
	}

	useEffect(() => {
		window.addEventListener('toggleGraphLayoutEvent', handleShortcut);

		return () => {
			window.removeEventListener('toggleGraphLayoutEvent', handleShortcut);
		};
	}, [handleShortcut]);

	return (
		<div className={styles.customLayout}>
			<div className={styles.customToolbar} id='helloFinn!'>
				<div>{size} shapes</div>
				<button
					type="button"
					title="Add Selected"
					className={styles.customButton}
					onClick={handleAdd}
				>
					Add
				</button>
				<button
					type="button"
					title="Remove Selected"
					className={styles.customButton}
					onClick={handleRemove}
				>
					Remove
				</button>
				<button
					type="button"
					title="Upsert Selected"
					className={styles.customButton}
					onClick={handleUpsert}
				>
					Upsert
				</button>
				<button
					type="button"
					title="Highlight Collection"
					className={styles.customButton}
					onClick={handleHighlight}
				>
					🔦
				</button>
				<button
					type="button"
					title="Show Help"
					className={styles.customButton}
					onClick={handleHelp}
				>
					⁉️
				</button>
                <button
					type="button"
					title="Start Simulation"
					className={styles.customButton}
					onClick={handleStartSimulation}
				>
					Start
				</button>
				<button
					type="button"
					title="Stop Simulation"
					className={styles.customButton}
					onClick={handleStopSimulation}
				>
					Stop
				</button>
			</div>
		</div>
	);
};