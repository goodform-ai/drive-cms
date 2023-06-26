import { JSDOM } from "jsdom";
import {
    findNextSiblingWithContent,
    findPriorSiblingWithContent,
} from "./utils";

/** Returns true if a table has no more than n cells in each row */
const tableHasNColumns = (table: HTMLTableElement, n: number): boolean => {
    const rows = Array.from(table.querySelectorAll("tr"), (row) =>
        row.querySelectorAll("td"),
    );
    // logic is required in case of a table with a colspan
    return (
        // every row must have at most length n
        rows.every((cells) => cells.length <= n) &&
        // at least some rows must have length n
        rows.some((cells) => cells.length === n)
    );
};

/** Finds the metadata table, if it exists
 *
 * A metadata table is either the first or last 2 column table in the document
 *
 * Since Google Docs appends paragraphs to the top and bottom of the document
 * we must check if any prior or subsequent siblings have content.
 *
 * @param {JSDOM} dom JSDOM Instance
 * @returns {HTMLTableElement | null}
 */
export const findMetaTable = (dom: JSDOM): HTMLTableElement | null => {
    const tables = dom.window.document.querySelectorAll("table");
    for (const table of tables) {
        if (!tableHasNColumns(table, 2)) continue;
        const isFirstElement = !findPriorSiblingWithContent(table);
        const isLastElement = !findNextSiblingWithContent(table);
        if (isFirstElement || isLastElement) return table;
    }
    return null;
};

export const getTableMetadata = (metaTable: HTMLTableElement) => {
    const metadata: { [key: string]: string } = {};
    const rows = metaTable.querySelectorAll("tr");
    rows.forEach((row) => {
        const [key, value] = Array.from(
            row.getElementsByTagName("td"),
            (cell) => {
                const image = cell.querySelector("img");
                if (!image || !image.src) return cell.textContent;
                return image.src;
            },
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
