import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsInt, IsPositive, ValidateNested } from "class-validator";

export class CreateOrderItemDto {
  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @IsPositive()
  productId: number;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @IsPositive()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({
    type: [CreateOrderItemDto],
    example: [
      { productId: 1, quantity: 2 },
      { productId: 5, quantity: 1 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
