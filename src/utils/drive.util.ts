import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";
import fs from "fs";

const scope = process.env.G_DRIVE_SCOPE as string;
const serviceAc = process.env.G_DRIVE_SERVICE_AC as string;
const drivefolderId = process.env.G_DRIVE_FOLDER_ID as string;
const gdriveUri = process.env.G_DRIVE_IMAGE_URI as string;
const credentials = JSON.parse(serviceAc);

let auth = new GoogleAuth({ scopes: scope, credentials });

const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/^.*[\\/]/, "")
    .replace(/[^\w\d.-]/g, "_")
    .toLowerCase();
};

const folderCache = new Map<string, string>();

export const clearFolderCache = () => {
  folderCache.clear();
  console.log("Folder cache cleared");
};

export const getCacheStats = () => {
  return {
    cacheSize: folderCache.size,
    cacheKeys: Array.from(folderCache.keys()),
  };
};

const findOrCreateFolder = async (
  service: any,
  parentId: string,
  folderName: string
): Promise<string> => {
  try {
    const trimmedName = folderName.trim();
    const normalizedKey = `${parentId}_${trimmedName.toLowerCase()}`;

    if (folderCache.has(normalizedKey)) {
      return folderCache.get(normalizedKey)!;
    }

    const query = `'${parentId}' in parents and name='${trimmedName}' and mimeType='application/vnd.google-apps.folder' and trashed = false`;

    const res = await service.files.list({
      q: query,
      fields: "files(id, name)",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const folders = res.data.files || [];
    if (folders.length > 0) {
      const folderId = folders[0].id!;
      folderCache.set(normalizedKey, folderId);
      return folderId;
    }

    const created = await service.files.create({
      requestBody: {
        name: trimmedName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentId],
      },
      fields: "id",
      supportsAllDrives: true,
    });
    const newId = created.data.id!;
    folderCache.set(trimmedName, newId);
    folderCache.set(normalizedKey, newId);
    return newId;
  } catch (err) {
    console.error(`[ERROR] findOrCreateFolder("${folderName}") failed:`, err);
    throw err;
  }
};

const createFolderStructure = async (
  service: any,
  accountId: string,
  profileId: string
) => {
  try {
    const uploadsFolderId = await findOrCreateFolder(
      service,
      drivefolderId,
      "uploads"
    );
    const accountsFolderId = await findOrCreateFolder(
      service,
      uploadsFolderId,
      "accounts"
    );
    const accountFolderId = await findOrCreateFolder(
      service,
      accountsFolderId,
      accountId
    );
    const profilesFolderId = await findOrCreateFolder(
      service,
      accountFolderId,
      "profiles"
    );
    const profileFolderId = await findOrCreateFolder(
      service,
      profilesFolderId,
      profileId
    );
    const photosFolderId = await findOrCreateFolder(
      service,
      profileFolderId,
      "photos"
    );
    return photosFolderId;
  } catch (error) {
    console.error("Error creating folder structure:", error);
    throw error;
  }
};

export const createFile = async (
  multerFile: Express.Multer.File,
  accountId: string,
  profileId: string
) => {
  try {
    const service = google.drive({ version: "v3", auth: auth });
    const photosFolderId = await createFolderStructure(
      service,
      accountId,
      profileId
    );
    const filename = multerFile.filename;
    const requestBody = {
      name: filename,
      parents: [photosFolderId],
      fields: "id,name",
    };

    const media = {
      mimeType: multerFile.mimetype,
      body: fs.createReadStream(multerFile.path),
    };

    const file: any = await service.files.create({
      requestBody,
      media,
      supportsAllDrives: true,
    });

    folderCache.set(filename, file.data.id);
    console.log("file created", file);
    return file;
  } catch (error) {
    console.error("Error uploading file to Google Drive:", error);
    throw error;
  }
};

export const getFileById = async (filePath: string) => {
  try {
    const service = google.drive({ version: "v3", auth: auth });
    const parts = filePath.replace(/^\/+/, "").split("/");
    let fileName = parts[parts.length - 1];
    let cacheExists = folderCache.has(fileName);

    console.log("existing cache", cacheExists);
    if (cacheExists) {
      let fileId = folderCache.get(fileName);
      return {
        id: fileId,
        name: fileName,
        imgUrl: `${gdriveUri}${fileId}`,
      };
    }
    let parentId = drivefolderId;

    // Get the file by querying the filename
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isFile = i === parts.length - 1;
      const query = `'${parentId}' in parents and name='${name}' and trashed = false`;
      const res = await service.files.list({
        q: isFile
          ? `${query} and mimeType != 'application/vnd.google-apps.folder'`
          : `${query} and mimeType = 'application/vnd.google-apps.folder'`,
        fields: "files(id, name, mimeType, webViewLink, createdTime)",
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });
      const items = res.data.files || [];
      if (items.length === 0) {
        throw new Error(`"${name}" not found under parent ID ${parentId}`);
      }
      const found = items[0];
      if (!found.id) {
        throw new Error(`Item "${name}" has no ID`);
      }

      if (isFile) {
        let data: any = {
          id: found.id,
          name: found.name,
          mimeType: found.mimeType,
          createdTime: found.createdTime,
          webViewLink: found.webViewLink,
          imgUrl: `${gdriveUri}${found.id}`,
        };

        folderCache.set(found.name || "", found.id);
        return data;
      }

      parentId = found.id;
    }

    throw new Error("Unexpected path structure");
  } catch (error: any) {
    console.error("Error in getFileByPath:", error.message);
    return { error: error.message };
  }
};

export const deleteFile = async (fileId: string) => {
  try {
    const service = google.drive({ version: "v3", auth: auth });
    await service.files.delete({
      fileId,
      supportsAllDrives: true,
    });
    return true;
  } catch (error) {
    throw error;
  }
};

export const testDriveConnection = async () => {
  try {
    const service = google.drive({ version: "v3", auth: auth });
    const response = await service.about.get({
      fields: "user,storageQuota",
    });
    console.log("Google Drive connection successful:", {
      user: response.data.user?.displayName,
      totalSpace: response.data.storageQuota?.limit,
      usedSpace: response.data.storageQuota?.usage,
    });
    return true;
  } catch (error) {
    console.error("Google Drive connection failed:", error);
    return false;
  }
};
