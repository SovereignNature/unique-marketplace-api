import { ApiProperty } from "@nestjs/swagger";
import { Dto } from "src/dto";
import { ClassToDto } from "src/type-generators/class-to-dto";

export class PaginationRequest
{
  @ApiProperty({required: false})
  public page?: number;

  @ApiProperty({required: false})
  public pageSize?: number;

  constructor(value: ClassToDto<PaginationRequest>) {
    Dto.init(this, value);
  }
}
