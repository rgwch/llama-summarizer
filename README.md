# Llama Analyzer

This project uses node-llama-cpp to extract informations from documents. As of now, only "summary" is supported.


It first extracts text contents from a number of different file formats using Apache [Tika](https://tika.apache.org/), and then sends this contents to an AI with the request to summarize it.

## Install

```
git clone https://github.com/rgwch/llama-summarizer
cd llama-summarizer
npm i
```
Then download a suitable model for your type of documents. I'm using gemma3-27b-abliterated-dpo.i1-IQ3_XS.gguf from [Hugging Face](https://huggingface.co/) but probably a different model will do better for your needs. Just try. YMMV.

## Configure

Copy the file `.env.sample` to `.env` and change contents as needed. Note that you need an accessible Apache Tika instance. The easiest way to have one ist the docker image:

`docker run --name tika -p 9998:9998 -d apache/tika:latest`

## Operate

There are two modes of operation

`npm run analyze <filename>` or `bun src/analyze <filename>` will try to load the given file and output the summary to stdout. 

`npm run serve` or `bun run src/server` will launch a REST-service. This Rest-Service has one POST and one GET entpoint. The POST endpoint will interpret the body as document and tries to summarize this. The GET endpoint will interpret the path portion of the url as an absolute filename and tries to load and summarize that file.

Either way, it will return a text/plain answer which is the summary.

## Test
`curl http://localhost:3336/file.pdf`

Note if you give an absolute filepath, it should start with double slash:

`curl http://localhost:3336//path/to/file.pdf`

Test POST endpoint:

`curl -X POST -H "content-type:application/pdf" --data-binary @/path/to/file.pdf http://localhost:3336`

## Deploy

Warning: There is no security. This Servcie is intended only for local environments. Never make it accessible from outside.
If you want run it as a service, I recommend using [pm2](https://pm2.keymetrics.io/)

## Notes
One interesting thing is: If you send the same document several times, you will get different answers every time. The reason is in the property "temperature" in the call

```typescript
 // src/server.ts 
 const result = await completion.generateCompletion(text, {
            maxTokens: 1500, // Adjust as needed
            temperature: 0.4, // Adjust as needed
            topP: 0.9, // Adjust as needed
        });
```
The higher the "temperature" is, the more freedom the model has to generate its answer. The value should be between 0 and 1. 
