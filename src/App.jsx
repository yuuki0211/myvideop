import React, { useState } from 'react';
import initSqlJs from 'sql.js';

function App() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setError(null);
        setResults([]);

        try {
            // 💡 修正ポイント：ネット上の公式配布元から直接読み込む設定に変更
            const SQL = await initSqlJs({
                locateFile: file => `https://sql.js.org/dist/${file}`
            });

            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const Uints = new Uint8Array(reader.result);
                    const db = new SQL.Database(Uints);

                    // 動画ファイルを抽出するクエリ
                    const query = "SELECT domain, relativePath FROM Files WHERE (relativePath LIKE '%.mp4' OR relativePath LIKE '%.mov') LIMIT 300";
                    const res = db.exec(query);

                    if (res.length > 0) {
                        setResults(res[0].values);
                    } else {
                        setError("動画の記録が見つかりませんでした。別のManifest.dbを試してください。");
                    }
                } catch (dbErr) {
                    setError("データベースの解析に失敗しました。正しいManifest.dbを選択してください。");
                }
                setLoading(false);
            };
            reader.readAsArrayBuffer(file);
        } catch (err) {
            console.error(err);
            setError("sql.js の起動に失敗しました。ネット接続を確認してください。");
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
            <h1 style={{ color: '#646cff' }}>iPhone Backup Analyzer</h1>
            <div style={{ border: '2px dashed #646cff', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
                <input type="file" onChange={handleFileChange} />
            </div>

            {loading && <p>🔍 解析中...</p>}
            {error && <p style={{ color: '#ff4a4a' }}>⚠️ {error}</p>}

            {results.length > 0 && (
                <div style={{ marginTop: '20px', textAlign: 'left' }}>
                    <table border="1" style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                        <thead style={{ backgroundColor: '#333' }}>
                            <tr><th>Domain</th><th>Path</th></tr>
                        </thead>
                        <tbody>
                            {results.map((row, i) => (
                                <tr key={i}><td style={{ padding: '5px' }}>{row[0]}</td><td style={{ padding: '5px' }}>{row[1]}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default App;