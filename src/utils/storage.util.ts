// OneDrive-only storage facade: keep the same API used by controllers/services
// so callers do not need to change. Internally delegate to onedrive.util

export { createFile, deleteFile, getFileById, getFileStream } from "./onedrive.util";

