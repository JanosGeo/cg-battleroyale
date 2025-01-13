import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { z } from "zod";

const CsvRowSchema = z.object({
  username: z.string(),
  totalScore: z.string().transform((val) => {
    const parsed = Number(val);
    if (isNaN(parsed)) {
      throw new Error("Invalid number format");
    }
    return parsed;
  }),
});

export type CsvRow = z.infer<typeof CsvRowSchema>;
const ArraySchema = z.array(CsvRowSchema);

type CsvDropzoneProps = {
  onParsedData: (data: CsvRow[]) => void;
};

export function CsvDropzone({ onParsedData }: CsvDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        const reader = new FileReader();

        reader.onload = () => {
          const csvData = reader.result;
          if (typeof csvData === "string") {
            Papa.parse(csvData, {
              header: true,
              skipEmptyLines: true,
              complete: (result) => {
                try {
                  const parsedData = ArraySchema.parse(result.data);
                  onParsedData(parsedData);
                } catch (error) {
                  console.error("Validation error:", error);
                }
              },
            });
          } else {
            console.error("Unexpected file format");
          }
        };

        reader.onerror = () => {
          console.error("Error reading file");
        };

        reader.readAsText(file);
      });
    },
    [onParsedData]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  return (
    <div
      {...getRootProps()}
      className={`w-1/2 m-4 text-gray-400 border-2 border-dashed p-6 rounded-md cursor-pointer text-center ${
        isDragActive ? "border-blue-500" : "border-gray-400"
      }`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="">Drop the files here...</p>
      ) : (
        <p>Drag & drop a CSV file here, or click to select a file</p>
      )}
    </div>
  );
}
