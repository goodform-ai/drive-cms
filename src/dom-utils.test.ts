import { JSDOM } from "jsdom";
import {
    extractLinkUrl,
    replaceGoogleHrefs,
    removeDocumentStyles,
    removeEmptySpans,
    replaceEmptyPara,
    extractTableMetadata,
    extractDocumentHtml,
    prepareDocument,
    DriveDocument,
} from "./dom-utils";
import config from "./config";

config.METADATA_FLAG = "metadata";

describe("DOM Utils", () => {
    describe("extractLinkUrl()", () => {
        it("should return the url from the q parameter", () => {
            const href = "https://www.google.com/url?q=https://google.com";
            expect(extractLinkUrl(href)).toBe("https://google.com");
        });

        it("should return the original href if it does not contain a q parameter", () => {
            const href = "https://google.com";
            expect(extractLinkUrl(href)).toBe(href);
        });

        it("should return the original href if it is not a valid URL", () => {
            const href = "aaaa";
            expect(extractLinkUrl(href)).toBe(href);
        });
    });

    describe("replaceGoogleHrefs()", () => {
        const dom = new JSDOM(
            `<body><a href="https://www.google.com/url?q=https://goodform.ai&sa=D&source=editors&ust=1687201983029285&usg=AOvVaw1rAn9SVKfKng0nzQ5NvsLG">Link</a><a href="https://www.google.com/url?q=https://openai.com&sa=D&source=editors&ust=1687201983029285&usg=AOvVaw1rAn9SVKfKng0nzQ5NvsLG">Another Link</a></body>`,
        );
        it("should replace hrefs in a DOM object", () => {
            replaceGoogleHrefs(dom);
            const linkElements = dom.window.document.querySelectorAll("a");

            expect(linkElements[0].href).toBe("https://goodform.ai/");
            expect(linkElements[1].href).toBe("https://openai.com/");
        });
    });

    describe("removeDocumentStyles", () => {
        it("should remove all inline styles from the document", () => {
            const dom = new JSDOM(
                `<html><body><div style="color: red;"></div><p style="font-size: 16px;"></p><a style="text-decoration: none;"></a></body></html>`,
            );

            removeDocumentStyles(dom);

            const elements = dom.window.document.querySelectorAll("*");

            elements.forEach((element) => {
                expect(element.hasAttribute("style")).toBe(false);
            });
        });

        it("should not throw an error if there are no elements with style attributes", () => {
            const dom = new JSDOM(
                `<html><body><div></div><p></p><a></a></body></html>`,
            );

            expect(() => removeDocumentStyles(dom)).not.toThrow();
        });
    });

    describe("removeEmptySpans", () => {
        it("should remove any a and span elements that have no content", () => {
            const dom = new JSDOM(
                `<html><body><a href="http://example.com">Link with content</a><a href="http://example.com"></a><span>Span with content</span><span></span></body></html>`,
            );

            removeEmptySpans(dom);

            const links = dom.window.document.querySelectorAll("a");
            const spans = dom.window.document.querySelectorAll("span");

            expect(links.length).toBe(1);
            expect(spans.length).toBe(1);
        });

        it("should remove any a and span elements that have only whitespace as content", () => {
            const dom = new JSDOM(
                `<html><body><a href="http://example.com"> </a><span> </span></body></html>`,
            );

            removeEmptySpans(dom);

            const links = dom.window.document.querySelectorAll("a");
            const spans = dom.window.document.querySelectorAll("span");

            expect(links.length).toBe(0);
            expect(spans.length).toBe(0);
        });

        it("should not throw an error if there are no a or span elements", () => {
            const dom = new JSDOM("<html><body></body></html>");

            expect(() => removeEmptySpans(dom)).not.toThrow();
        });
    });

    describe("replaceEmptyParagraphs", () => {
        it("should replace empty p tags with br tags", () => {
            const dom = new JSDOM(
                `<html><body><p>Paragraph with content</p><p></p></body></html>`,
            );

            replaceEmptyPara(dom);

            const paragraphs = dom.window.document.querySelectorAll("p");
            const breaks = dom.window.document.querySelectorAll("br");

            expect(paragraphs.length).toBe(1);
            expect(breaks.length).toBe(1);
        });

        it("should replace p tags with only whitespace with br tags", () => {
            const dom = new JSDOM(`<html><body><p> </p></body></html>`);

            replaceEmptyPara(dom);

            const paragraphs = dom.window.document.querySelectorAll("p");
            const breaks = dom.window.document.querySelectorAll("br");

            expect(paragraphs.length).toBe(0);
            expect(breaks.length).toBe(1);
        });

        it("should not throw an error if there are no p elements", () => {
            const dom = new JSDOM("<html><body></body></html>");

            expect(() => replaceEmptyPara(dom)).not.toThrow();
        });
    });

    describe("extractTableMetadata", () => {
        it("should extract metadata from a table", () => {
            const dom = new JSDOM(
                `<html><body><table><thead><tr><th>metadata</th></tr></thead><tr><td>key1</td><td>value1</td></tr><tr><td>key2</td><td>value2</td></tr></table></body></html>`,
            );

            const metadata = extractTableMetadata(dom);
            expect(metadata).toEqual({
                key1: "value1",
                key2: "value2",
            });
        });

        it("should return an empty object if no table with metadata is present", () => {
            const dom = new JSDOM("<html><body></body></html>");

            const metadata = extractTableMetadata(dom);
            expect(metadata).toEqual({});
        });

        it("should remove the metadata table from the document", () => {
            const dom = new JSDOM(
                `<html><body><table><thead><tr><th>metadata</th></tr></thead><tr><td>key</td><td>value</td></tr></table></body></html>`,
            );

            extractTableMetadata(dom);
            const tables = dom.window.document.querySelectorAll("table");
            expect(tables.length).toBe(0);
        });

        it("should ignore tables without a thead element", () => {
            const dom = new JSDOM(
                `<html><body><table><tr><td>key</td><td>value</td></tr></table></body></html>`,
            );

            const metadata = extractTableMetadata(dom);
            expect(metadata).toEqual({});
        });

        it("should ignore tables whose thead does not contain the metadata flag", () => {
            const dom = new JSDOM(
                `<html><body><table><thead><tr><th>something else</th></tr></thead><tr><td>key</td><td>value</td></tr></table></body></html>`,
            );

            const metadata = extractTableMetadata(dom);
            expect(metadata).toEqual({});
        });
    });

    describe("extractDocumentHtml", () => {
        it("should extract the HTML content from the document body", () => {
            const dom = new JSDOM(
                `<html><head><title>Test</title></head><body><p>Hello World</p></body></html>`,
            );

            const content = extractDocumentHtml(dom);
            expect(content).toBe("<p>Hello World</p>");
        });

        it("should return an empty string if the document body is empty", () => {
            const dom = new JSDOM("<html><body></body></html>");

            const content = extractDocumentHtml(dom);
            expect(content).toBe("");
        });

        it("should not include content from the document head", () => {
            const dom = new JSDOM(
                `<html><head><title>Test</title></head><body><p>Hello World</p></body></html>`,
            );

            const content = extractDocumentHtml(dom);
            expect(content).not.toContain("<title>Test</title>");
        });
    });

    describe("prepareDocument", () => {
        const html = `<html><head><style type="text/css">p{color:red;}</style></head><body><table><thead><tr><th>metadata</th></tr></thead><tr><td>Title</td><td>Test Document</td></tr></table><p style="color: red;">Hello World</p><span></span><p></p><a href="https://google.com/url?q=http://example.com&other=param">link</a></body></html>`;

        let defaultResult: DriveDocument;

        beforeAll(() => {
            defaultResult = prepareDocument(html);
        });

        it("should extract metadata by default", () => {
            expect(defaultResult.meta).toEqual({ Title: "Test Document" });
        });

        it("should remove styles by default", () => {
            expect(defaultResult.content).not.toContain('style="color: red;"');
        });

        it("should remove empty text nodes by default", () => {
            expect(defaultResult.content).not.toContain("<span></span>");
        });

        it("should replace empty paragraphs with br tags by default", () => {
            expect(defaultResult.content).toContain("<br>");
            expect(defaultResult.content).not.toContain("<p></p>");
        });

        it("should replace Google link hrefs with actual URLs by default", () => {
            expect(defaultResult.content).toContain(
                '<a href="http://example.com">link</a>',
            );
        });

        it("should ignore metadata when ignoreMeta is true", () => {
            const result = prepareDocument(html, { ignoreMeta: true });
            expect(result.meta).toEqual({});
        });

        it("should keep styles when keepStyles is true", () => {
            const result = prepareDocument(html, { keepStyles: true });
            expect(result.content).toContain('style="color: red;"');
        });

        it("should keep empty text nodes when keepEmptyText is true", () => {
            const result = prepareDocument(html, { keepEmptyText: true });
            expect(result.content).toContain("<span></span>");
        });

        it("should keep empty paragraphs when keepEmptyPara is true", () => {
            const result = prepareDocument(html, { keepEmptyPara: true });
            expect(result.content).toContain("<p></p>");
            expect(result.content).not.toContain("<br>");
        });

        it("should keep Google link hrefs when keepGoogleLinks is true", () => {
            const result = prepareDocument(html, { keepGoogleLinks: true });
            expect(result.content).toContain(
                "https://google.com/url?q=http://example.com&other=param",
            );
        });
    });
});
