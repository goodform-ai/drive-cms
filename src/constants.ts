export const MIME_TYPE_DOCUMENT = "application/vnd.google-apps.document";
export const MIME_TYPE_FOLDER = "application/vnd.google-apps.folder";

/** Specifies which permissions are required for Google Drive */
export const SCOPES = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.readonly",
];

/** Specifies which fields to include when retrieving files from Google Drive */
// export const FILE_FIELDS = `id, name, description, createdTime, modifiedTime, owners, lastModifyingUser, trashed, starred`;
export const FILE_FIELDS = "*";
