import "dotenv/config"
import { createServer, IncomingMessage, ServerResponse } from 'http'
import { logger } from './logger'
import { extractTextFromBuffer, extractTextFromFile } from "./extract"
import { getLlama, LlamaCompletion } from "node-llama-cpp"
const port = process.env.PORT || 3336

createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const method = req.method?.toUpperCase() || 'GET'
    if (method == "PUT" || method == "POST") {
        const body = await parseBody(req).catch(err => {
            error(res, 400, 'Bad Request: ' + err.message)
        })
        if (body) {
            const text = await extractTextFromBuffer(Buffer.from(body))
            await processText(text, res)
        } else {
            error(res, 400, 'Bad Request: No body provided')
        }
    } else if (method == "GET") {
        logger.info('Received GET request')
        // let url: URL = new URL(req.url!, `http://${req.headers.host}`);
        // const fn = url.searchParams.get('filename')
        const filename = req.url?.substring(1) || ''
        const text = await extractTextFromFile(filename).catch(err => {
            error(res, 400, 'Bad Request: ' + err.message)
        })
        if (text) {
            await processText(text, res);
        } else {
            // error(res, 400, 'Could not process file ' + filename)
        }
    }
    else {
        error(res, 405, 'Method Not Allowed: ' + method)
    }
}).listen(port, () => {
    logger.info(`Server running at http://localhost:${port}/`)
}).on('error', (err: any) => {
    logger.error('Server error:', err)

});

function error(res: ServerResponse, code: number, text: string) {
    logger.info("Error: " + text)
    res.statusCode = code
    res.setHeader('Content-Type', 'text/plain')
    res.end(text)
}
async function processText(text: string, res: ServerResponse) {
    try {
        const llama = await getLlama()
        const model = await llama.loadModel({
            modelPath: process.env.LLAMA_MODEL || "models/models/gemma3-27b-abliterated-dpo.i1-IQ3_XS.gguf"
        })
        const context = await model.createContext();
        const completion: LlamaCompletion = new LlamaCompletion({
            contextSequence: context.getSequence()
        });
        const prefix = "Bitte erstelle eine Zusammenfassung des folgenden Textes:\n\n"
        text = prefix + text
        const result = await completion.generateCompletion(text, {
            maxTokens: 1500, // Adjust as needed
            temperature: 0.4, // Adjust as needed
            topP: 0.9, // Adjust as needed
        });
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.writeHead(200)
        res.end(result)
        logger.info(`Processed text of size: ${Buffer.byteLength(text)} bytes`)
    } catch (err: any) {
        logger.error('Error processing file:', err.message)
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end('Internal Server Error: ' + err.message)
        return
    }
}
function parseBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
        let body = ''
        req.on('data', chunk => {
            body += chunk.toString() // convert Buffer to string
        })
        req.on('end', async () => {
            try {
                if (req.headers['content-type']?.toLowerCase() == "application/json") {
                    resolve(JSON.parse(body))
                }
                else {
                    resolve(body) // resolve with the raw body if not JSON
                }
            } catch (err: any) {
                logger.error(err.message)
                reject(err)
            }
        })

    });
}