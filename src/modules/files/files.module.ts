import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { MulterModule } from '@nestjs/platform-express';
import { ImageKitProvider } from './imagekit.provider';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [FilesModule],
      useFactory: (filesService: FilesService) => {
        return {
          // custom storage to imageKit
          // validation limits and media type
          storage: filesService.imageKitMulterStorage(),
          limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
          fileFilter: (req, file, cb) => {
            if (!file.mimetype.startsWith('image/')) {
              return cb(new Error('Only image files are allowed!'), false);
            }
            cb(null, true);
          },
        };
      },
      inject: [FilesService],
    }),
  ],
  providers: [FilesService, ImageKitProvider],
  exports: [FilesService, MulterModule],
})
export class FilesModule {}
