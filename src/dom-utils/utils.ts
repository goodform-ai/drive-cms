import axios from "axios";
import { JSDOM } from "jsdom";

/** Recursively finds the previous sibling that has content, if any
 *
 * @param {Element | null} element
 * @returns {Element | null}
 */
export const findPriorSiblingWithContent = (
    element: Element | null,
): Element | null => {
    if (!element) return null;
    if (element.previousElementSibling?.textContent)
        return element.previousElementSibling;
    return findPriorSiblingWithContent(element.previousElementSibling);
};

/** Recursively finds the next sibling that has content, if any
 * @param {Element | null} element
 * @returns {Element | null}
 */
export const findNextSiblingWithContent = (
    element: Element | null,
): Element | null => {
    if (!element) return null;
    if (element.nextElementSibling?.textContent)
        return element.nextElementSibling;
    return findNextSiblingWithContent(element.nextElementSibling);
};

export const findElementsWithMatcher = <ElementType extends Element = Element>(
    dom: JSDOM,
    selector: string,
    matcher: (element: ElementType) => boolean,
) => {
    const elements = Array.from(
        dom.window.document.querySelectorAll<ElementType>(selector),
    );
    return elements.filter(matcher);
};

export const toBase64 = async (url: string) => {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "binary").toString("base64");
    return buffer;
};
