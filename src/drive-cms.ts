import { drive_v3, google, Auth } from "googleapis";

import { config } from "./config";
import { MIME_TYPE_DOCUMENT, SCOPES } from "./constants";
import { PrepareHtmlOptions, prepareDocument } from "./dom-utils";

/** Interfaces with the Google Drive API to retrieve files */
export class DriveCMS {
    /** Google Drive API Client */
    public drive: drive_v3.Drive;

    /** Pass in a configuration object to create GoogleAuth with
     * @param {Auth.GoogleAuthOptions} options Auth Config Object. Can have credentials, keyFile, keyFilename, and some others
     *
     * @example
     * const credentials = JSON.parse(Buffer.from(googleServiceKey, 'base64').toString());
     * const cms = new DriveCMS({ credentials });
     *
     * @see https://www.npmjs.com/package/googleapis#authentication-and-authorization
     */
    constructor(options: Auth.GoogleAuthOptions);
    /** Pass in an instance of GoogleAuth
     *
     * @param {GoogleAuth} auth GoogleAuth instance
     *
     * @example
     * // don't forget the scopes
     * const scopes = [...];
     * const auth = new google.auth.GoogleAuth({scopes, ...});
     * const cms = new DriveCMS(auth);
     */
    constructor(auth: Auth.GoogleAuth);
    constructor(options: Auth.GoogleAuthOptions | Auth.GoogleAuth) {
        let auth: Auth.GoogleAuth;
        if (options instanceof Auth.GoogleAuth) {
            auth = options;
        } else {
            auth = new google.auth.GoogleAuth({ scopes: SCOPES, ...options });
        }
        const version = "v3";
        this.drive = google.drive({ auth, version });
    }

    async getFilesByName(name: string, fields = config.FILE_FIELDS) {
        const response = await this.drive.files.list({
            q: `name='${name}'`,
            fields: `files(${fields})`,
        });

        return response.data.files ?? [];
    }

    async getFileById(fileId: string, fields = config.FILE_FIELDS) {
        const response = await this.drive.files.get({ fileId, fields });

        return response.data;
    }

    async listDocs(params?: drive_v3.Params$Resource$Files$List) {
        const defaultParams: drive_v3.Params$Resource$Files$List = {
            q: `mimeType='${MIME_TYPE_DOCUMENT}' and trashed=false`,
            fields: `files(${config.FILE_FIELDS})`,
            orderBy: "createdTime desc",
        };

        const response = await this.drive.files.list({
            ...defaultParams,
            ...params,
        });

        return response.data.files ?? [];
    }

    async getDocById(fileId: string, options: PrepareHtmlOptions = {}) {
        const html = await this.exportDocHtml(fileId);
        return prepareDocument(html, options);
    }

    async getDocByName(name: string, options: PrepareHtmlOptions = {}) {
        const file = (await this.getFilesByName(name))?.[0];
        if (!file || !file.id) return;
        const html = await this.exportDocHtml(file.id);
        return prepareDocument(html, options);
    }

    private async exportDocHtml(fileId: string): Promise<string> {
        const response = await this.drive.files.export({
            fileId,
            mimeType: "text/html",
            fields: config.FILE_FIELDS,
        });

        return response.data as string;
    }
}
