import { IsString, IsNotEmpty, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
}

export class CreateMessageDto {
  @ApiProperty({
    description: 'Content of the message',
    example: 'Hello everyone!',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Type of message',
    enum: MessageType,
    example: MessageType.TEXT,
  })
  @IsEnum(MessageType)
  type: MessageType;

  @ApiProperty({
    description: 'Chat room ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  chatRoomId: string;
}