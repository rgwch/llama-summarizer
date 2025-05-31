import fs from "fs/promises";

const tika = process.env.TIKA_URL || "http://localhost:9998/tika"; // Apache Tika server URL
const tikaExtensions = [".pdf", ".html", ".xml", ".docx", ".xlsx", ".pptx", ".odt", ".rtf"];

/**
 * Extract text contents from a number of file formats using apache Tika 
 * If no suitable file type was found, try to interpret file contents as Plaintext
*/
export async function extractTextFromFile(filename: string): Promise<string> {

    let text = "";
    const contents = await fs.readFile(filename);
    if (tikaExtensions.some(ext => filename.endsWith(ext))) {
        console.log("Extracting text from " + filename + " using Apache Tika...");
        const response = await fetch(tika, {
            method: "PUT",
            body: contents
        });
        if (response.status !== 200) {
            throw new Error("Error extracting text from PDF: " + response.statusText);
        } else {
            text = await response.text();
        }
    } else {
        console.log("Reading text from file...");
        text = contents.toString();
    }
    return text;
}

export async function extractTextFromBlob(blob: Buffer): Promise<string> {
    console.log("Extracting text from buffer using Apache Tika...");
    console.log("Buffer size: " + blob.length + " bytes");
    const response = await fetch(tika, {
        method: "PUT",
        body: blob
    });
    if (response.status !== 200) {
        throw new Error("Error extracting text from PDF: " + response.statusText);
    } else {
        const text = await response.text();
        return text
    }
}