// CSV helper utilities for parsing simple CSV files with quoted fields and escaped quotes.
// Note: Does not support multiline fields.

export type CsvParseOptions = {
  maxRows?: number;
  requireNonEmptyValues?: boolean;
};

export type CsvParseResult = {
  headers: string[];
  rows: Record<string, string>[];
};

// Split a CSV line into fields, respecting quotes and escaped quotes
export function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote inside a quoted field
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  fields.push(current);

  // Unquote and trim outer whitespace for each field
  return fields.map((f) => {
    const trimmed = f.trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return trimmed.slice(1, -1).replace(/""/g, '"');
    }
    return trimmed;
  });
}

/**
 * Parse CSV text ensuring headers match exactly the requiredHeaders set and returning rows as objects.
 * - Removes BOM if present
 * - Handles CRLF and LF line endings
 * - Supports quoted fields and escaped quotes ("")
 * - Does not support multiline fields
 */
export function parseCsv(
  inputText: string,
  requiredHeaders: string[],
  options: CsvParseOptions = {},
): CsvParseResult {
  const { maxRows, requireNonEmptyValues = true } = options;

  const text = inputText.replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header and one data row');
  }

  const headers = splitCsvLine(lines[0]).map((h) => h.trim());

  // Validate required headers present
  const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
  }

  // Validate no extra headers
  const extraHeaders = headers.filter((h) => !requiredHeaders.includes(h));
  if (extraHeaders.length > 0) {
    throw new Error(`Extra columns found: ${extraHeaders.join(', ')}`);
  }

  const dataRows = lines.slice(1);

  if (typeof maxRows === 'number' && dataRows.length > maxRows) {
    throw new Error(
      `Maximum ${maxRows} rows allowed. Found ${dataRows.length} rows.`,
    );
  }

  const rows: Record<string, string>[] = dataRows.map((row, index) => {
    const values = splitCsvLine(row);
    if (values.length !== headers.length) {
      throw new Error(
        `Row ${index + 2} has ${values.length} values but expected ${
          headers.length
        }`,
      );
    }

    if (requireNonEmptyValues) {
      const emptyColumns: string[] = [];
      headers.forEach((header, i) => {
        if (values[i] === '') emptyColumns.push(header);
      });
      if (emptyColumns.length > 0) {
        throw new Error(
          `Row ${index + 2} has empty value(s) for: ${emptyColumns.join(', ')}`,
        );
      }
    }

    const rowData: Record<string, string> = {};
    headers.forEach((header, i) => {
      rowData[header] = values[i];
    });
    return rowData;
  });

  return { headers, rows };
}
