
import {
    IsArray
} from 'class-validator';

export class FindUsersDto {
    @IsArray()
    ids: number[];
}
