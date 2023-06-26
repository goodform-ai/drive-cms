import { drive_v3 } from "googleapis";

export interface DriveCMSConfig {
    /** Default options used to prepare HTML */
    docOptions?: Partial<DocumentOptions>;
    /** Specifies which fields to include when retrieving files from Google Drive */
    fields?: string;
    /** Specifies which permissions are required for Google Drive */
    scopes?: string[];
}

export interface DriveCMSDocument<
    MetaType extends { [key: string]: string } = { [key: string]: string },
> {
    /** HTML string content */
    content: string;
    meta: MetaType;
    file: DriveDocMeta;
}

/** Google Drive Document Metadata (file-level) */
export interface DriveDocMeta extends drive_v3.Schema$File {
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
}
