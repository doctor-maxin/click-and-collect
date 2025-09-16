import { Client } from "basic-ftp";
import { readFile, stat } from "fs/promises";
import { createWriteStream } from "fs";
import { XMLParser, XMLBuilder, XMLValidator } from "fast-xml-parser";

export default defineEventHandler(async (event) => {
  const client = new Client();
  client.ftp.verbose = true;
  const fileLink = "localfile.xml";

  try {
    const isHaveFile = await stat(fileLink);

    if (!isHaveFile) {
      await client.access({
        host: process.env.FTP_HOST as string,
        user: process.env.FTP_USER as string,
        password: process.env.FTP_PASS as string,
      });
      await client.downloadTo(createWriteStream(fileLink), "XML СИН.xml");
    }

    const file = await readFile(fileLink, {
      encoding: "utf-8",
    });
    const parser = new XMLParser();

    const points = await parser.parse(file);
    return points.companies.company;
  } catch (err) {
    console.error(err);
  }

  return [];
});
