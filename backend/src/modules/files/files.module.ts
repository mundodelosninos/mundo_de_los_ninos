import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { StorageService } from '../../services/storage.service';

@Module({
  controllers: [FilesController],
  providers: [StorageService],
  exports: [StorageService], // Export so other modules can use it
})
export class FilesModule {}