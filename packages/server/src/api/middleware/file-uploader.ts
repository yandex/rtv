/**
 * File uploader middleware
 */
import path from 'path';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import { values as config } from '../../config';

const storage = multer.diskStorage({
  destination: path.join(config.rtvDataPath, 'uploads'),
  filename: function (_req, file, cb) {
    const pathname = uuid().replace(/-/g, ''); //Replace "-" for Orsay, seems it is not supported in download links
    cb(null, `${pathname}${path.extname(file.originalname)}`);
  },
});

export default multer({ storage }).single('file');
