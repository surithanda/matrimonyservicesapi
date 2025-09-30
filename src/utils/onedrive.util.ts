import fs from "fs";
import path from "path";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { ClientSecretCredential } from "@azure/identity";
import "isomorphic-fetch";

// Env config
const TENANT_ID = process.env.MS_TENANT_ID as string;
const CLIENT_ID = process.env.MS_CLIENT_ID as string;
const CLIENT_SECRET = process.env.MS_CLIENT_SECRET as string;

// Choose target: user or site drive
// ONEDRIVE_MODE=user|site
const ONEDRIVE_MODE = (process.env.ONEDRIVE_MODE || "user").toLowerCase();
const ONEDRIVE_USER_ID = process.env.ONEDRIVE_USER_ID as string; // user object id or UPN
const ONEDRIVE_SITE_ID = process.env.ONEDRIVE_SITE_ID as string; // site id when using SharePoint
const ONEDRIVE_DRIVE_ID = process.env.ONEDRIVE_DRIVE_ID as string; // document library drive id when using SharePoint

const SCOPES = ["https://graph.microsoft.com/.default"]; // app perms

let graphClient: Client | null = null;

const getGraphClient = () => {
  if (graphClient) return graphClient;
  if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("Missing MS_TENANT_ID/MS_CLIENT_ID/MS_CLIENT_SECRET envs for OneDrive.");
  }

  const credential = new ClientSecretCredential(TENANT_ID, CLIENT_ID, CLIENT_SECRET);

  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: SCOPES,
  });

  graphClient = Client.initWithMiddleware({ authProvider });

  return graphClient;
};

export const getFileStream = async (fileId: string) => {
  const client = getGraphClient();

  let driveBaseUrl: string;
  if (ONEDRIVE_MODE === "site") {
    if (!ONEDRIVE_SITE_ID || !ONEDRIVE_DRIVE_ID) {
      throw new Error("ONEDRIVE_SITE_ID and ONEDRIVE_DRIVE_ID are required for site mode");
    }
    driveBaseUrl = `/sites/${encodeURIComponent(ONEDRIVE_SITE_ID)}/drives/${encodeURIComponent(ONEDRIVE_DRIVE_ID)}`;
  } else {
    if (!ONEDRIVE_USER_ID) {
      throw new Error("ONEDRIVE_USER_ID is required for user mode");
    }
    driveBaseUrl = `/users/${encodeURIComponent(ONEDRIVE_USER_ID)}/drive`;
  }

  console.log("[OneDrive] Fetching file stream for item ID:", fileId, driveBaseUrl);
  // Get a short-lived download URL for the item
  const item = await client
    .api(`${driveBaseUrl}/items/${encodeURIComponent(fileId)}`)
    .select(["@microsoft.graph.downloadUrl", "name"].join(","))
    .get();
  console.log("[OneDrive] Retrieved item metadata:", item);
  const downloadUrl = item["@microsoft.graph.downloadUrl"] as string;
  if (!downloadUrl) throw new Error("downloadUrl not available for this item");

  const resp = await fetch(downloadUrl);
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Failed to fetch file content: ${resp.status} ${resp.statusText} - ${text}`);
  }

  return {
    stream: resp.body as any,
    contentType: resp.headers.get("content-type") || "application/octet-stream",
    contentLength: resp.headers.get("content-length") || undefined,
    fileName: item?.name as string,
  };
};

const ensureFolderPath = async (names: string[]): Promise<{ id: string; webUrl?: string; path: string }> => {
  const client = getGraphClient();

  let parentPath = "/"; // root
  let parentId: string | undefined;

  // Resolve the chosen drive root/base
  let driveRootUrl: string;
  let driveBaseUrl: string;
  if (ONEDRIVE_MODE === "site") {
    if (!ONEDRIVE_SITE_ID || !ONEDRIVE_DRIVE_ID) {
      throw new Error("ONEDRIVE_SITE_ID and ONEDRIVE_DRIVE_ID are required for site mode");
    }
    driveRootUrl = `/sites/${encodeURIComponent(ONEDRIVE_SITE_ID)}/drives/${encodeURIComponent(ONEDRIVE_DRIVE_ID)}/root`;
    driveBaseUrl = `/sites/${encodeURIComponent(ONEDRIVE_SITE_ID)}/drives/${encodeURIComponent(ONEDRIVE_DRIVE_ID)}`;
  } else {
    if (!ONEDRIVE_USER_ID) {
      throw new Error("ONEDRIVE_USER_ID is required for user mode");
    }
    driveRootUrl = `/users/${encodeURIComponent(ONEDRIVE_USER_ID)}/drive/root`;
    driveBaseUrl = `/users/${encodeURIComponent(ONEDRIVE_USER_ID)}/drive`;
  }

  // Walk and create folders as needed
  for (const name of names) {
    const escapedName = name.replace(/\//g, "_").trim();
    // Try path-based get first
    try {
      const checkPath = `${driveRootUrl}:${parentPath}${escapedName}`;
      console.log("[OneDrive] Checking path:", checkPath);
      const existing = await client.api(checkPath).get();
      parentId = existing.id;
      parentPath = `${parentPath}${escapedName}/`;
      continue;
    } catch (_) {
      // not found, create under parent
    }

    // If we have a parentId, create by parent id; else create under root by path
    if (parentId) {
      const created = await client
        .api(`${driveBaseUrl}/items/${parentId}/children`)
        .post({ name: escapedName, folder: {}, "@microsoft.graph.conflictBehavior": "fail" });
      parentId = created.id;
      parentPath = `${parentPath}${escapedName}/`;
    } else {
      // First level under root
      const created = await client
        .api(`${driveRootUrl}/children`)
        .post({ name: escapedName, folder: {}, "@microsoft.graph.conflictBehavior": "fail" });
      parentId = created.id;
      parentPath = `${parentPath}${escapedName}/`;
    }
  }

  if (!parentId) throw new Error("Failed to resolve or create target folder path");
  console.log("[OneDrive] Resolved folder:", { parentId, parentPath });
  return { id: parentId, path: parentPath };
};

export const createFile = async (
  multerFile: Express.Multer.File,
  accountId: string,
  profileId: string
) => {
  const client = getGraphClient();

  // Build folder structure
  const folders = ["uploads", "accounts", accountId, "profiles", profileId, "photos"];
  const { id: folderId, path: folderPath } = await ensureFolderPath(folders);

  // Upload file (<= 4MB with simple upload; our MAX is 5MB so still okay in practice but safer to use upload session if >4MB)
  const filename = path.basename(multerFile.filename);
  const fileStream = fs.createReadStream(multerFile.path);

  // Build both root URL (for path lookups) and base URL (for items/{id} endpoints)
  let driveRootUrl: string;
  let driveBaseUrl: string;
  if (ONEDRIVE_MODE === "site") {
    driveRootUrl = `/sites/${encodeURIComponent(ONEDRIVE_SITE_ID)}/drives/${encodeURIComponent(ONEDRIVE_DRIVE_ID)}/root`;
    driveBaseUrl = `/sites/${encodeURIComponent(ONEDRIVE_SITE_ID)}/drives/${encodeURIComponent(ONEDRIVE_DRIVE_ID)}`;
  } else {
    driveRootUrl = `/users/${encodeURIComponent(ONEDRIVE_USER_ID)}/drive/root`;
    driveBaseUrl = `/users/${encodeURIComponent(ONEDRIVE_USER_ID)}/drive`;
  }

  console.log("[OneDrive] Upload context:", { driveRootUrl, driveBaseUrl, folderId, folderPath, filename });
  // Prefer path-based createUploadSession to avoid id-context issues
  const sessionPath = `${driveRootUrl}:${folderPath}${encodeURIComponent(filename)}:/createUploadSession`;
  console.log("[OneDrive] Creating upload session:", sessionPath);
  const session = await client
    .api(sessionPath)
    .post({ item: { "@microsoft.graph.conflictBehavior": "rename" } });

  const uploadUrl: string = session.uploadUrl;

  // Upload whole file in one PUT (works for files up to ~60MB, but chunking is recommended; our files are small)
  const stats = fs.statSync(multerFile.path);
  const buffer = fs.readFileSync(multerFile.path);

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Length": `${buffer.length}`,
      "Content-Range": `bytes 0-${buffer.length - 1}/${stats.size}`,
    },
    body: buffer,
  });

  if (!putRes.ok) {
    const text = await putRes.text();
    throw new Error(`OneDrive upload failed: ${putRes.status} ${putRes.statusText} - ${text}`);
  }

  const uploaded = await putRes.json();

  return {
    data: {
      id: uploaded.id as string,
      name: uploaded.name as string,
      webUrl: uploaded.webUrl as string,
    },
  } as any;
};

export const deleteFile = async (fileId: string) => {
  const client = getGraphClient();

  let driveBase: string;
  if (ONEDRIVE_MODE === "site") {
    driveBase = `/sites/${encodeURIComponent(ONEDRIVE_SITE_ID)}/drives/${encodeURIComponent(ONEDRIVE_DRIVE_ID)}`;
  } else {
    driveBase = `/users/${encodeURIComponent(ONEDRIVE_USER_ID)}/drive`;
  }

  await client.api(`${driveBase}/items/${encodeURIComponent(fileId)}`).delete();
  return true;
};

export const getFileById = async (filePath: string) => {
  try {
    const client = getGraphClient();

    let driveRootUrl: string;
    if (ONEDRIVE_MODE === "site") {
      if (!ONEDRIVE_SITE_ID || !ONEDRIVE_DRIVE_ID) {
        throw new Error("ONEDRIVE_SITE_ID and ONEDRIVE_DRIVE_ID are required for site mode");
      }
      driveRootUrl = `/sites/${encodeURIComponent(ONEDRIVE_SITE_ID)}/drives/${encodeURIComponent(ONEDRIVE_DRIVE_ID)}/root`;
    } else {
      if (!ONEDRIVE_USER_ID) {
        throw new Error("ONEDRIVE_USER_ID is required for user mode");
      }
      driveRootUrl = `/users/${encodeURIComponent(ONEDRIVE_USER_ID)}/drive/root`;
    }

    const cleanPath = `/${filePath.replace(/^\/+/, "")}`; // ensure leading slash and no duplicates

    // Resolve by path without creating
    const item = await client.api(`${driveRootUrl}:${cleanPath}`).get();

    return {
      id: item.id as string,
      name: item.name as string,
      webUrl: item.webUrl as string,
      imgUrl: item.webUrl as string,
    } as any;
  } catch (error: any) {
    return { error: error.message } as any;
  }
};
