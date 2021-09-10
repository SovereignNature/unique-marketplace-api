import { ApiProperty } from "@nestjs/swagger";
import { Dto } from "src/dto";
import { ClassToDto } from "src/type-generators/class-to-dto";

export class OffersFilter
{
  @ApiProperty({name: 'collectionId', items: { type: 'number', default: '' }, required: false})
  public collectionId?: number[];

  @ApiProperty({required: false, type: String})
  public minPrice?: BigInt;

  @ApiProperty({required: false, type: String})
  public maxPrice?: BigInt;

  @ApiProperty({required: false})
  public seller?: string;

  @ApiProperty({items: {type: 'number', default: ''}, required: false})
  public traitsCount?: number[];

  @ApiProperty({required: false})
  public searchText?: string;

  @ApiProperty({required: false})
  public searchLocale?: string;

  constructor(value: ClassToDto<OffersFilter>) {
    Dto.init(this, value);
  }
}