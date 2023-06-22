/** Specifies which fields to include when retrieving files from Google Drive */
const FILE_FIELDS = `id, name, description, createdTime, modifiedTime, owners, lastModifyingUser, trashed, starred`;

/** Specifies what string to search for to determine which HTML Table is the metadata table */
const METADATA_FLAG = "[metadata]";

/** Default configurations for the package
 *
 * Can be overridden
 * @example
 * // before using drive-cms
 * import { config } from 'drive-cms';
 * config.FILE_FIELDS = "id, name";
 */
export const config = {
    FILE_FIELDS,
    METADATA_FLAG,
};

export default config;
