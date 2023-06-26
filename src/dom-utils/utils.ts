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

export const findElementsWithMatcher = (
    dom: JSDOM,
    selector: string,
    matcher: (element: Element) => boolean,
) => {
    const elements = Array.from(dom.window.document.querySelectorAll(selector));
    return elements.filter(matcher);
};
