import { google } from "googleapis";
import path from "path";
import { GoogleAuth } from "google-auth-library";
import crypto from "crypto";
import fs from "fs";

const scope = process.env.G_DRIVE_SCOPE as string;
const serviceAc = process.env.G_DRIVE_SERVICE_AC as string;
const drivefolderId = process.env.G_DRIVE_FOLDER_ID as string;
const gdriveUri = process.env.G_DRIVE_IMAGE_URI as string;

const auth = new GoogleAuth({
  scopes: scope,
  keyFile: path.resolve(__dirname, serviceAc),
});

export const createFile = async (multerFile: Express.Multer.File) => {
  try {
    const service = google.drive({ version: "v3", auth: auth });
    let name = crypto.randomBytes(32).toString("hex");
    let imageTail = multerFile.mimetype.split("/")[1];

    const requestBody = {
      name: `${name}.${imageTail}`,
      parents: [`${drivefolderId}`],
      fields: "id,name",
    };

    const media = {
      mimeType: multerFile.mimetype,
      body: fs.createReadStream(multerFile.path),
    };

    console.log(
      "Uploading file to Google Drive with requestBody:",
      requestBody
    );

    let file = await service.files.create({
      requestBody,
      media,
      supportsAllDrives: true,
    });

    console.log("File uploaded successfully:", file.data);
    return file;
  } catch (error) {
    console.error("Error uploading file to Google Drive:", error);
    throw error;
  }
};

export const getFileById = async (fileId: string) => {
  try {
    const service = google.drive({ version: "v3", auth: auth });
    const file = await service.files.get({
      fileId,
      fields: "id, name, mimeType, webViewLink, createdTime",
      supportsAllDrives: true,
    });
    return {
      id: file.data.id,
      name: file.data.name,
      mimeType: file.data.mimeType,
      createdTime: file.data.createdTime,
      webViewLink: file.data.webViewLink,
      imgUrl: `${gdriveUri}${file.data.id}`,
    };
  } catch (error: any) {
    console.log("error getting images", error.message);
    return error;
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
