/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { drive_v3, google, Auth } from "googleapis";
import { JSDOM } from "jsdom";

import { FILE_FIELDS, MIME_TYPE_DOCUMENT, SCOPES } from "./constants";
import {
    removeDocumentStyles,
    removeEmptySpans,
    replaceGoogleHrefs,
    removeImageReferrer,
    extractTableMetadata,
    extractSnippet,
    extractDocumentHtml,
    extractTitle,
} from "./dom-utils";
import type {
    DocumentOptions,
    DriveCMSConfig,
    DriveCMSDocument,
    DriveDocMeta,
} from "./types";

/** Interfaces with the Google Drive API to retrieve files */
export class DriveCMS {
    /** Google Drive API Client */
    public drive: drive_v3.Drive;
    /** Options used to prepare HTML */
    _docOptions: Partial<DocumentOptions>;
    /** Specifies which fields to include when retrieving files from Google Drive */
    fields: string;
    /** Specifies which permissions are required for Google Drive */
    scopes: string[];

    /** Pass in a configuration object to create GoogleAuth with
     * @param {Auth.GoogleAuthOptions} authOptions Auth Config Object. Can have credentials, keyFile, etc
     *
     * @example
     * const credentials = JSON.parse(Buffer.from(googleServiceKey, 'base64').toString());
     * const cms = new DriveCMS({ credentials });
     *
     * @see https://www.npmjs.com/package/googleapis#authentication-and-authorization
     */
    constructor(authOptions: Auth.GoogleAuthOptions, config?: DriveCMSConfig);
    /** Pass in an instance of GoogleAuth
     *
     * @param {GoogleAuth} auth GoogleAuth instance
     *
     * @example
     * const scopes = ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/drive.readonly"];
     * const auth = new google.auth.GoogleAuth({scopes, ...});
     * const cms = new DriveCMS(auth);
     */
    constructor(auth: Auth.GoogleAuth, config?: DriveCMSConfig);
    constructor(
        authOptions: Auth.GoogleAuthOptions | Auth.GoogleAuth,
        config?: DriveCMSConfig,
    ) {
        this._docOptions = config?.docOptions ?? {};
        this.fields = config?.fields ?? FILE_FIELDS;
        this.scopes = config?.scopes ?? SCOPES;
        let auth: Auth.GoogleAuth;
        if (authOptions instanceof Auth.GoogleAuth) {
            auth = authOptions;
        } else {
            auth = new google.auth.GoogleAuth({
                scopes: this.scopes,
                ...authOptions,
            });
        }
        this.drive = google.drive({ auth, version: "v3" });
    }

    async getFileDataByName(name: string) {
        const fileId = (await this._getFileIdsByName(name))?.[0];
        if (!fileId) return;
        const data = this._getFileDataById(fileId);
        return data;
    }

    async getFilesByName(name: string) {
        const response = await this.drive.files.list({
            q: `name='${name}'`,
            fields: `files(${this.fields})`,
        });

        return response.data.files ?? [];
    }

    async getFileById(fileId: string) {
        const response = await this.drive.files.get({
            fileId,
            fields: this.fields,
        });

        return response.data;
    }

    async getAllDocs(params?: drive_v3.Params$Resource$Files$List) {
        const defaultParams: drive_v3.Params$Resource$Files$List = {
            q: `mimeType='${MIME_TYPE_DOCUMENT}' and trashed=false`,
            fields: `files(${this.fields})`,
            orderBy: "createdTime desc",
        };

        const response = await this.drive.files.list({
            ...defaultParams,
            ...params,
        });

        const files = response.data.files ?? [];

        const documents = await Promise.all(
            files
                .filter((file) => file.id && file.name)
                .map(async (file) => this._getFileDataById(file.id!)),
        );

        return documents;
    }

    async _getFileDataById(fileId: string): Promise<DriveCMSDocument> {
        const file = (
            await this.drive.files.get({ fileId, fields: this.fields })
        ).data as DriveDocMeta;
        const document = await this.drive.files.export({
            fileId,
            mimeType: "text/html",
        });
        const { content, meta } = prepareDocument(
            document.data as string,
            this._docOptions,
        );

        return { content, meta, file };
    }

    async _getFileIdsByName(name: string): Promise<string[]> {
        const response = await this.drive.files.list({
            q: `name='${name}'`,
            fields: `files(${this.fields})`,
        });
        const ids = (response.data.files ?? [])
            .filter(({ id }) => !!id)
            .map((file) => file.id!);
        if (ids.length > 1)
            console.warn(
                `DriveCMS - Found more than 1 file with name "${name}".`,
            );
        return ids;
    }
}

export const prepareDocument = (
    html: string,
    {
        keepStyles = false,
        keepEmptyText = false,
        keepGoogleLinks = false,
        keepReferrer = false,
        ignoreMeta = false,
        ignoreSnippet = false,
        snippetLength = 200,
        ignoreTitle = false,
    }: DocumentOptions = {},
): Pick<DriveCMSDocument, "meta" | "content"> => {
    let meta: { [key: string]: string } = {};
    const dom = new JSDOM(html);
    if (!keepStyles) removeDocumentStyles(dom);
    if (!keepEmptyText) removeEmptySpans(dom);
    if (!keepGoogleLinks) replaceGoogleHrefs(dom);
    if (!keepReferrer) removeImageReferrer(dom);
    if (!ignoreMeta) meta = extractTableMetadata(dom);
    if (!ignoreSnippet) meta.snippet = extractSnippet(dom, snippetLength);
    if (!ignoreTitle) meta.title = extractTitle(dom);
    const content = extractDocumentHtml(dom);

    return { content, meta };
};
