import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import sanitizeHtml = require('sanitize-html');

/**
 * SanitizePipe - Prevents XSS attacks by sanitizing user input
 *
 * This pipe recursively sanitizes all string values in the input,
 * removing any HTML tags and potentially malicious content.
 *
 * Usage:
 * - Apply globally: app.useGlobalPipes(new SanitizePipe())
 * - Apply to specific endpoints: @UsePipes(new SanitizePipe())
 * - Apply to specific parameters: @Body(new SanitizePipe()) dto: CreateDto
 */
@Injectable()
export class SanitizePipe implements PipeTransform {
  /**
   * Transform the input value by sanitizing all strings
   * @param value - The input value to sanitize
   * @param metadata - Metadata about the argument being transformed
   * @returns The sanitized value
   */
  transform(value: any, metadata: ArgumentMetadata): any {
    if (value === null || value === undefined) {
      return value;
    }

    return this.sanitize(value);
  }

  /**
   * Recursively sanitize the value
   * @param value - The value to sanitize
   * @returns The sanitized value
   */
  private sanitize(value: any): any {
    // Handle strings - remove all HTML tags
    if (typeof value === 'string') {
      return sanitizeHtml(value, {
        allowedTags: [], // No HTML tags allowed
        allowedAttributes: {}, // No attributes allowed
        disallowedTagsMode: 'discard', // Remove disallowed tags entirely
        textFilter: (text: string) => {
          // Additional text filtering if needed
          return text;
        },
      });
    }

    // Handle arrays - sanitize each element
    if (Array.isArray(value)) {
      return value.map(item => this.sanitize(item));
    }

    // Handle objects - sanitize all string properties
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = {};

      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          sanitized[key] = this.sanitize(value[key]);
        }
      }

      return sanitized;
    }

    // Return other types as-is (numbers, booleans, etc.)
    return value;
  }
}
