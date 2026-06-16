import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

export function useCurrentFile(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('file') ?? 'example.mdx';
}

export interface FileOption {
  label: string;
  value: string;
}

interface FilePickerProps {
  value: string;
  files: FileOption[];
  onChange: (file: string) => void;
}

export function FilePicker({ value, files, onChange }: FilePickerProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-[220px] text-sm">
        <SelectValue placeholder="Select a file" />
      </SelectTrigger>
      <SelectContent>
        {files.map((f) => (
          <SelectItem key={f.value} value={f.value}>
            {f.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
