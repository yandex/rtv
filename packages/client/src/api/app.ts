/**
 * Node.js App API. Extends browser API and allows to use file system features.
 * For example in `installApp` and `packApp` methods you can pass file path instead of `File` object
 */
import * as os from 'os';
import * as path from 'path';
import { Stream } from 'stream';
import fs from 'fs-extra';
import archiver from 'archiver';
import { v4 as uuid } from 'uuid';
import { FileInfo } from 'rtv-server';
import AppBrowser from './app.browser';

export default class AppNode extends AppBrowser {
  /**
   * [Node.js] Install app on the TV from pkg directory or .ipk/.wgt file.
   */
  async installApp(
    ip: string,
    file: any,
    { noMinify = undefined, appId = undefined }: { noMinify?: boolean; appId?: string } = {}
  ) {
    let stream = file;
    if (typeof file === 'string') {
      const pathStat = await fs.stat(file);
      stream = pathStat.isDirectory() ? await getDirectoryStream(file) : getFileStream(file);
    }

    return AppBrowser.prototype.installApp.call(this, ip, stream, {
      noMinify,
      appId,
    });
  }

  /**
   * [Node.js] Pack app from path on server and write to out file.
   * Platform is detected by out file extension: .wgt for tizen, .ipk for webOS.
   */
  async packApp(file: any, out: string, params = {}): Promise<FileInfo> {
    const stream = typeof file === 'string' ? await getDirectoryStream(file) : file;

    const fileStream = await AppBrowser.prototype.packApp.call(this, stream, out, params);

    fs.ensureDirSync(path.dirname(out));

    const outStream = fs.createWriteStream(out);
    fileStream.pipe(outStream);
    await streamAsPromise(outStream);

    return { file: out };
  }
}

async function getDirectoryStream(inputDir: string) {
  const outDir = path.join(os.tmpdir(), 'rtv-temp');
  await fs.ensureDir(outDir);
  const outZip = path.join(outDir, `${uuid()}.zip`);
  await zipDirectory(inputDir, outZip);

  return getFileStream(outZip);
}

function getFileStream(inputPath: string) {
  return fs.createReadStream(inputPath);
}

async function zipDirectory(inputDir: string, outZip: string) {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip');

    const output = fs.createWriteStream(outZip);
    // Write to temp file because node-archiver fails on large directories ~5MB when pipe not specified
    archive.pipe(output);

    output.on('error', (err) => reject(err));

    output.on('close', () => resolve(archive));

    archive.directory(inputDir, false);

    archive.finalize();
  });
}

function streamAsPromise(stream: Stream) {
  return new Promise((resolve, reject) => {
    stream.on('error', reject);
    // for readable streams
    stream.on('end', resolve);
    // for writable streams
    stream.on('finish', resolve);
  });
}
