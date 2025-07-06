import React, { useState, useEffect } from 'react';
import { filePersistence } from '../utils/filePersistence';

const MockDataFileManager: React.FC = () => {
    const [currentData, setCurrentData] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadCurrentData();
    }, []);

    const loadCurrentData = async () => {
        setIsLoading(true);
        try {
            const backup = filePersistence.getBackupData();
            if (backup) {
                setCurrentData(JSON.stringify(backup, null, 2));
            } else {
                setCurrentData('No backup data available');
            }
        } catch (error) {
            setCurrentData('Error loading data');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(currentData).then(() => {
            setMessage('✅ Data copied to clipboard!');
            setTimeout(() => setMessage(''), 3000);
        }).catch(() => {
            setMessage('❌ Failed to copy to clipboard');
            setTimeout(() => setMessage(''), 3000);
        });
    };

    const clearBackup = () => {
        localStorage.removeItem('mockData_backup');
        setCurrentData('Backup cleared');
        setMessage('✅ Backup data cleared');
        setTimeout(() => setMessage(''), 3000);
    };

    const resetCache = () => {
        filePersistence.clearCache();
        setMessage('✅ Cache cleared - data will reload from file');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">📁 Mock Data File Manager</h2>

            {message && (
                <div className={`p-3 mb-4 rounded ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message}
                </div>
            )}

            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Current Backup Data</h3>
                <p className="text-gray-600 mb-4">
                    This data represents changes made in mock mode. Copy this to update your mockData.json file.
                </p>

                {isLoading ? (
                    <div className="p-4 bg-gray-100 rounded">Loading...</div>
                ) : (
                    <div className="relative">
                        <textarea
                            value={currentData}
                            readOnly
                            className="w-full h-64 p-3 border rounded font-mono text-sm bg-gray-50"
                            placeholder="No data available"
                        />
                        <button
                            onClick={copyToClipboard}
                            className="absolute top-2 right-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                        >
                            Copy
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button
                    onClick={loadCurrentData}
                    className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    🔄 Reload Data
                </button>

                <button
                    onClick={clearBackup}
                    className="p-3 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    🗑️ Clear Backup
                </button>

                <button
                    onClick={resetCache}
                    className="p-3 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                    🧹 Clear Cache
                </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">📝 Instructions</h3>
                <ol className="list-decimal list-inside text-yellow-700 space-y-1">
                    <li>Make changes in the app (create, edit, delete patients)</li>
                    <li>Click "Copy" to copy the updated data</li>
                    <li>Open <code className="bg-yellow-100 px-1 rounded">src/mock/mockData.json</code></li>
                    <li>Replace the entire content with the copied data</li>
                    <li>Save the file</li>
                    <li>Refresh the app to see the changes</li>
                </ol>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
                <h3 className="font-semibold text-blue-800 mb-2">💡 Tips</h3>
                <ul className="list-disc list-inside text-blue-700 space-y-1">
                    <li>Changes are automatically saved to localStorage as backup</li>
                    <li>Use "Clear Cache" if you want to reload from the file</li>
                    <li>The backup data includes all CRUD operations from mock mode</li>
                    <li>Make sure VITE_DATA_MODE=mock is set in your .env file</li>
                </ul>
            </div>
        </div>
    );
};

export default MockDataFileManager; 