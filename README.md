# Llama Analyzer

This project uses node-llama-cpp to extract informations from files of different formats. As of now, only "summary" is supported.


It first extract text contents from a number of different formats using Apache [Tika](https://tika.apache.org/), and then sends this contents to an AI with the request to summarize it.

## Install

```
git clone https://github.com/rgwch/llama-summarizer
cd llama-summarizer
npm i
```
Then download a suitable model for your type of documents. I'm using gemma3-27b-abliterated-dpo.i1-IQ3_XS.gguf from [Hugging Face](https://huggingface.co/) buit probably a different model will do better for your needs. Just try. YMMV.

## Configure

Copy the file `.env.sample` to `.env` and change contents as needed. Note that you need an accessible Apache Tika instance. The easiest way to have one ist the docker image:

`docker run --name tika -p 9998:9998 -d apache/tika:latest`

## Operate

There are two modes of operation

`npm run analyze <filename>` or `bun src/analyze <filename>` will try to load the given file and output the summary to stdout. 

`npm run serve` or `bun run src/server` will launch a REST-service. This Rest-Service has one POST and one GET entpoint. The POST endpoint will interpret the body as docukent and tries to summarize this. The GET endpoint will interpret the path portion of the urel as an absolute filename and tries to load an summarize that file.

Either way, it will return a text/plain answer which is the summary.

## Deploy

Warning: There is no security. This Servcie is intended only for local environments. Never make it accessible from outside.
If you want run it as a service, I recommend using [pm2](https://pm2.keymetrics.io/)