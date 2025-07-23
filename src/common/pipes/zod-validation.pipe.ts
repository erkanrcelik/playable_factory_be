import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

/**
 * Zod Validation Pipe
 *
 * Custom validation pipe that uses Zod schemas for request payload validation.
 * Provides type-safe validation with detailed error messages and automatic parsing.
 *
 * @description This pipe provides:
 * - Type-safe validation using Zod schemas
 * - Automatic type transformation and parsing
 * - Detailed validation error messages
 * - Integration with NestJS validation system
 *
 * @security Validates and sanitizes incoming request data
 * @performance Efficient schema-based validation
 *
 * @example
 * ```typescript
 * const userSchema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(6)
 * });
 *
 * @Post('register')
 * @UsePipes(new ZodValidationPipe(userSchema))
 * async register(@Body() userData: z.infer<typeof userSchema>) {
 *   // userData is now type-safe and validated
 * }
 * ```
 *
 * @implements {PipeTransform}
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  /**
   * Initialize the validation pipe with a Zod schema
   *
   * @param schema - The Zod schema to use for validation
   *
   * @example
   * ```typescript
   * const pipe = new ZodValidationPipe(mySchema);
   * ```
   */
  constructor(private schema: ZodSchema) {}

  /**
   * Transform and validate the input value using the provided Zod schema
   *
   * @param value - The input value to validate and transform
   * @returns The validated and transformed value with proper typing
   *
   * @throws {BadRequestException} When validation fails with detailed error messages
   *
   * @example
   * ```typescript
   * // Valid input
   * const result = pipe.transform({ email: "user@example.com", password: "secure123" });
   * // Returns validated object with proper types
   *
   * // Invalid input
   * pipe.transform({ email: "invalid", password: "123" });
   * // Throws BadRequestException with validation details
   * ```
   */
  transform(value: unknown) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Validation failed',
      );
    }
  }
}
