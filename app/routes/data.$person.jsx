// app/routes/api/world-content.$person.js
import { json } from "@remix-run/node";
import { getWorldContent, getJournalEntries } from "~/models/world-model.server";

export async function loader({ params }) {
    const { person } = params; // Access the dynamic parameter

    const user = await getWorldContent(person);
    const journalEntries = await getJournalEntries(person);

    return json({ user, journalEntries });
}