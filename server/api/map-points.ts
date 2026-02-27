import { Client } from "basic-ftp";
import { readFile, rename, stat, unlink } from "fs/promises";
import { XMLParser } from "fast-xml-parser";

const FILE_PATH = "localfile.xml";
const REMOTE_FILE_PATH = "XML СИН.xml";
let downloadPromise: Promise<void> | null = null;

const downloadXmlFile = async (force = false) => {
    if (downloadPromise) {
        console.info("[map-points] waiting for active download");
        await downloadPromise;
        return;
    }

    downloadPromise = (async () => {
        const fileStat = force ? null : await stat(FILE_PATH).catch(() => null);

        if (fileStat && fileStat.size > 0) {
            console.info(
                `[map-points] using cached xml file (size=${fileStat.size} bytes)`,
            );
            return;
        }

        const client = new Client();
        const tmpPath = `${FILE_PATH}.tmp-${process.pid}-${Date.now()}`;

        try {
            console.info(
                `[map-points] downloading xml from ftp (force=${force})`,
            );
            await client.access({
                host: process.env.FTP_HOST as string,
                user: process.env.FTP_USER as string,
                password: process.env.FTP_PASS as string,
            });

            await client.downloadTo(tmpPath, REMOTE_FILE_PATH);
            await rename(tmpPath, FILE_PATH);
            const downloadedStat = await stat(FILE_PATH);
            console.info(
                `[map-points] xml downloaded (size=${downloadedStat.size} bytes)`,
            );
        } finally {
            client.close();
            await unlink(tmpPath).catch(() => null);
        }
    })();

    try {
        await downloadPromise;
    } finally {
        downloadPromise = null;
    }
};

export default defineEventHandler(async () => {
    const parser = new XMLParser();

    try {
        console.info("[map-points] request started");
        await downloadXmlFile();

        const file = await readFile(FILE_PATH, {
            encoding: "utf-8",
        });
        console.info(`[map-points] parsing xml (chars=${file.length})`);
        const points = parser.parse(file);
        const companyCount = Array.isArray(points?.companies?.company)
            ? points.companies.company.length
            : points?.companies?.company
              ? 1
              : 0;
        console.info(`[map-points] parse success (companies=${companyCount})`);

        return points?.companies?.company ?? [];
    } catch (err) {
        console.error(
            "[map-points] parse failed, retrying with force download",
            err,
        );

        // Retry once with a forced re-download in case local cache was corrupted.
        try {
            await downloadXmlFile(true);
            const file = await readFile(FILE_PATH, {
                encoding: "utf-8",
            });
            console.info(
                `[map-points] retry parsing xml (chars=${file.length})`,
            );
            const points = parser.parse(file);
            const companyCount = Array.isArray(points?.companies?.company)
                ? points.companies.company.length
                : points?.companies?.company
                  ? 1
                  : 0;
            console.info(
                `[map-points] retry parse success (companies=${companyCount})`,
            );
            return points?.companies?.company ?? [];
        } catch (retryErr) {
            console.error("[map-points] retry failed", retryErr);
        }
    }

    console.error("[map-points] request finished with empty response");
    return [];
});
