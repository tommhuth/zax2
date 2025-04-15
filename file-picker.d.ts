
declare global {
    interface Window {
        showSaveFilePicker: (options: FilePickerOptions) => Promise<FileSystemFileHandle>;
        showOpenFilePicker: (options: FilePickerOptions) => Promise<FileSystemFileHandle[]>;
    }

    interface FilePickerAcceptType {
        description?: string;
        accept: Record<string, string[]>;
    }

    interface FilePickerOptions {
        multiple?: boolean;
        types?: FilePickerAcceptType[];
        excludeAcceptAllOption?: boolean;
    }
}

export { }