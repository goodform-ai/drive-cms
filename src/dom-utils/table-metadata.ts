import { JSDOM } from "jsdom";
import {
    findNextSiblingWithContent,
    findPriorSiblingWithContent,
} from "./utils";

/** Finds the metadata table, if it exists
 *
 * A metadata table is either the first or last element in the document
 *
 * Since Google Docs appends paragraphs to the top and bottom of the document
 * we must check if any prior or subsequent siblings have content.
 *
 * @param {JSDOM} dom JSDOM Instance
 * @returns {HTMLTableElement | null}
 */
export const findMetaTable = (dom: JSDOM): HTMLTableElement | null => {
    let metaTable = null;
    const tables = dom.window.document.querySelectorAll("table");
    for (const table of tables) {
        const isFirstElement = !findPriorSiblingWithContent(table);
        const isLastElement = !findNextSiblingWithContent(table);
        if (isFirstElement || isLastElement) metaTable = table;
    }
    return metaTable;
};

export const getTableMetadata = (metaTable: HTMLTableElement) => {
    const metadata: { [key: string]: string } = {};
    const rows = metaTable.querySelectorAll("tr");
    rows.forEach((row) => {
        const [key, value] = Array.from(row.getElementsByTagName("td")).map(
            (cell) => cell.textContent,
        );
        if (typeof key !== "string" || typeof value !== "string") return;
        metadata[key] = value;
    });
    return metadata;
};

/** Removes the metadata table and returns its values.
 *
 * If the first or last element with content in the document is a table, it will be considered a metadata table.
 *
 * If there is no table at the start or end of the document, the metadata output will be an empty object.
 *
 * @param {JSDOM} dom JSDOM Instance
 * @returns Object with metadata keys and values
 */
export const extractTableMetadata = (dom: JSDOM) => {
    const metaTable = findMetaTable(dom);

    if (!metaTable) return {};

    const metadata = getTableMetadata(metaTable);

    metaTable.remove();
    return metadata;
};
