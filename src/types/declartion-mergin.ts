import ImageKit from '@imagekit/nodejs';
import Multer from 'multer';
import { UserResponseDTO } from 'src/modules/auth/dto/auth.dto';

export type EnvVariables = {
  JWT_SECRET: string;
  IMAGEKIT_PRIVATE_KEY: string;
  NODE_ENV: 'development' | 'production';
};

declare global {
  namespace Express {
    namespace Multer {
      interface File extends ImageKit.Files.FileUploadResponse {
        fileId?: string;
      }
    }
    interface Request {
      user?: UserResponseDTO['userData'];
    }
  }
  namespace NodeJS {
    interface ProcessEnv extends EnvVariables {}
  }
  interface BigInt {
    toJSON(): string;
  }
}
