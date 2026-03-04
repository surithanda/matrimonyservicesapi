import { BlobServiceClient } from '@azure/storage-blob';
import dotenv from 'dotenv';
dotenv.config();

async function checkAzure() {
    console.log("Connecting using:", process.env.AZURE_STORAGE_CONNECTION_STRING?.substring(0, 50) + "...");
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING!);
    const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME!);

    console.log(`\nListing blobs in container '${process.env.AZURE_STORAGE_CONTAINER_NAME}':`);

    let i = 1;
    for await (const blob of containerClient.listBlobsFlat()) {
        console.log(`Blob ${i++}: ${blob.name}`);
    }
}

checkAzure().catch(console.error);
