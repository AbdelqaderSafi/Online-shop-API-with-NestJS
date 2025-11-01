import { ImageKit } from '@imagekit/nodejs/client.mjs';
import { Inject, Injectable } from '@nestjs/common';
import { ImageKitToken } from './imagekit.provider';
import { StorageEngine } from 'multer';
import { toFile } from '@imagekit/nodejs';

@Injectable()
export class FilesService {
  constructor(@Inject(ImageKitToken) private imageKit: ImageKit) {}

  imageKitMulterStorage() {
    const imageKitStorage: StorageEngine = {
      _handleFile: (req, file, cb) => {
        toFile(file.stream)
          .then((fileData) =>
            this.imageKit.files
              .upload({
                file: fileData,
                fileName: file.originalname,
                folder: 'products',
                useUniqueFileName: true,
              })
              .then((res) => {
                cb(null, res);
              }),
          )
          .catch(cb);
      },
      _removeFile: (req, file, cb) => {
        if (!file.fileId) return cb(null);
        console.log('_removeFile of custom storage called');
        this.imageKit.files
          .delete(file.fileId)
          .then(() => cb(null))
          .catch(cb);
      },
    };
    return imageKitStorage;
  }
}
