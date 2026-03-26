import React, { useState } from 'react';

function App() {
    const [fileInfo, setFileInfo] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileInfo({
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2) + " MB",
            type: file.type || "不明"
        });

        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
            <h1 style={{ color: '#646cff' }}>iPhone Data Recovery</h1>

            <div style={{ border: '2px dashed #ccc', padding: '20px', borderRadius: '10px' }}>
                <input type="file" onChange={handleFileChange} />
            </div>

            {fileInfo && (
                <div style={{ marginTop: '20px', textAlign: 'left', border: '1px solid #ddd', padding: '20px' }}>
                    <h3>解析結果</h3>
                    <p>名前: {fileInfo.name}</p>
                    <p>サイズ: {fileInfo.size}</p>

                    {fileInfo.name.match(/\.(mp4|mov)$/i) && (
                        <video src={previewUrl} controls style={{ width: '100%', marginTop: '10px' }} />
                    )}
                </div>
            )}
        </div>
    );
}

export default App;