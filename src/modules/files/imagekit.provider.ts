import ImageKit from '@imagekit/nodejs';
import { ConfigService } from '@nestjs/config';
import { EnvVariables } from 'src/types/declartion-mergin';

export const ImageKitToken = 'IMAGE_KIT_PROVIDER';

export const ImageKitProvider = {
  provide: ImageKitToken,
  useFactory: (configService: ConfigService<EnvVariables>) => {
    return new ImageKit({
      privateKey: 'private_L2J9pjPG/2y8LWrN8KJ6wmejzDg=',
    });
  },
  inject: [ConfigService],
};
