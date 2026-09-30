import { Min, Max, IsOptional } from 'class-validator';

export class CreateProductDto {
  @Min(3)
  @Max(255)
  name: string;

  @Min(3)
  @Max(255)
  @IsOptional()
  description: string;

  @Min(1)
  @Max(255)
  price: number;
}
