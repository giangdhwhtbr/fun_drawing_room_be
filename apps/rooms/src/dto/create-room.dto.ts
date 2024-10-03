import {
    IsNotEmpty,
    IsString
} from 'class-validator';

export class CreateRoomDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    description: string;
}
