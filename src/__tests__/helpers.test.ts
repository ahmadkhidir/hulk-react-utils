import { parseErrorText, hulkFetchErrorParser } from '../helpers';

describe('helpers', () => {
  describe('parseErrorText', () => {
    it('should parse JSON array of strings', () => {
      const errorText = '["Error 1", "Error 2"]';
      const result = parseErrorText(errorText);
      expect(result).toEqual(['Error 1', 'Error 2']);
    });

    it('should parse JSON array of objects with messages', () => {
      const errorText = '[{"message": "Error 1"}, {"message": "Error 2"}]';
      const result = parseErrorText(errorText);
      expect(result).toEqual(['Error 1', 'Error 2']);
    });

    it('should parse JSON object with key-value pairs', () => {
      const errorText = '{"username": ["Required field"], "password": ["Too short"]}';
      const result = parseErrorText(errorText);
      expect(result).toEqual(['Username: Required field', 'Password: Too short']);
    });

    it('should handle detail key specially (no prefix)', () => {
      const errorText = '{"detail": "Authentication failed"}';
      const result = parseErrorText(errorText);
      expect(result).toEqual(['Authentication failed']);
    });

    it('should return plain text as-is for invalid JSON', () => {
      const errorText = 'Simple error message';
      const result = parseErrorText(errorText);
      expect(result).toEqual(['Simple error message']);
    });

    it('should handle nested objects', () => {
      const errorText = '{"user": {"name": "Required"}}';
      const result = parseErrorText(errorText);
      expect(result).toEqual(['User: [object Object]']);
    });
  });

  describe('hulkFetchErrorParser', () => {
    it('should return undefined for successful responses', async () => {
      const response = new Response('success', { status: 200, statusText: 'OK' });
      const result = await hulkFetchErrorParser(response);
      expect(result).toBeUndefined();
    });

    it('should parse error response correctly', async () => {
      const errorBody = '{"message": "Not found"}';
      const response = new Response(errorBody, { 
        status: 404, 
        statusText: 'Not Found' 
      });
      
      const result = await hulkFetchErrorParser(response);
      expect(result).toEqual({
        message: 'Not Found',
        code: 404,
        details: ['Message: Not found']
      });
    });

    it('should handle empty error response', async () => {
      const response = new Response('', { 
        status: 500, 
        statusText: 'Internal Server Error' 
      });
      
      const result = await hulkFetchErrorParser(response);
      expect(result).toEqual({
        message: 'Internal Server Error',
        code: 500,
        details: ['']
      });
    });

    it('should provide default message when statusText is empty', async () => {
      const response = new Response('error', { 
        status: 400, 
        statusText: '' 
      });
      
      const result = await hulkFetchErrorParser(response);
      expect(result).toEqual({
        message: 'An error occurred',
        code: 400,
        details: ['error']
      });
    });
  });
});