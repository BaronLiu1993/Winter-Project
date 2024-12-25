import { uploadFile } from '../services/api';

const FileUpload: React.FC = () => {
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        try {
            const result = await uploadFile(file);
            console.log('Upload successful:', result);
        } catch (error) {
            console.error('Upload failed:', error);
        }
    };

    return (
        <input 
            type="file" 
            onChange={handleUpload}
            accept=".csv,.json"
        />
    );
}; 