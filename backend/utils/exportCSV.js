import { createObjectCsvStringifier } from "csv-writer";

export const generateCSV = (records, header) => {
  const csvStringifier = createObjectCsvStringifier({
    header
  });

  const headerRow = csvStringifier.getHeaderString();
  const body = csvStringifier.stringifyRecords(records);

  return headerRow + body;
};
