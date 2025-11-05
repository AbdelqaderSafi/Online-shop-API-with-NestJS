import { ImageKit } from '@imagekit/nodejs/client.mjs';
import { Inject, Injectable } from '@nestjs/common';
import { ImageKitToken } from './imagekit.provider';
import { StorageEngine } from 'multer';
import { toFile } from '@imagekit/nodejs';
import { Prisma } from 'generated/prisma';
import { SideEffectQueue } from '../utils/side.effects';
import { TransactionClient } from 'src/types/util.types';

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

  createFileAssetData(
    file: Express.Multer.File,
    userId: number | bigint,
  ): Prisma.AssetUncheckedCreateInput {
    return {
      fileId: file.fileId!,
      fileSizeInKB: Math.ceil(file.size / 1024),
      url: file.url!,
      fileType: file.mimetype,
      ownerId: userId,
    };
  }

  async deleteProductAsset(
    prismaTX: TransactionClient,
    productID: number,
    userID: number,
    sideEffects: SideEffectQueue,
  ) {
    const whereClause = {
      where: {
        productId: productID,
        ownerId: userID,
      },
    };

    const existingAssets = await prismaTX.asset.findMany(whereClause);

    await prismaTX.asset.deleteMany(whereClause);

    existingAssets.forEach((asset) => {
      sideEffects.add('delete imagekit file', async () => {
        await this.imageKit.files.delete(asset.fileId);
      });
    });
  }
}
