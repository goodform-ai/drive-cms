import { drive_v3 } from "googleapis";

export interface DriveCMSConfig {
    /** Default options used to prepare HTML */
    docOptions?: Partial<DocumentOptions>;
    /** Specifies which fields to include when retrieving files from Google Drive */
    fields?: string;
    /** Specifies which permissions are required for Google Drive */
    scopes?: string[];
}

/** Default document metadata. Has a title, snippet, and cover_image */
export interface DefaultDocMeta {
    [key: string]: string | undefined;
    title: string;
    snippet: string;
    cover_image: string;
}

/** A document from Google Drive, including the HTML content, file metadata, and generic document metadata */
export interface DriveCMSDocument<
    MetaType extends DefaultDocMeta = DefaultDocMeta,
> {
    /** HTML string content */
    content: string;
    /** Document Metadata */
    meta: MetaType;
    /** Drive File Metadata */
    file: DriveFileMeta;
}

/** Google Drive Document Metadata (file-level) */
export interface DriveFileMeta extends drive_v3.Schema$File {
    id: string;
    name: string;
}

export interface DocumentOptions {
    /** Whether to keep inline styles */
    keepStyles?: boolean;
    /** Whether to keep empty `a`, `div`, `p`, `span` elements */
    keepEmptyText?: boolean;
    /** Whether to keep Google links */
    keepGoogleLinks?: boolean;
    /** Whether to keep image referrer */
    keepReferrer?: boolean;
    /** Whether to ignore metadata */
    ignoreMeta?: boolean;
    /** Whether to ignore the snippet */
    ignoreSnippet?: boolean;
    /** How many characters to include in snippet */
    snippetLength?: number;
    /** Whether to ignore the title */
    ignoreTitle?: boolean;
    /** Whether to ignore the first image */
    ignoreCover?: boolean;
}
