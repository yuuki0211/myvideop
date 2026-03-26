import React, { useState } from 'react';
import initSqlJs from 'sql.js';

function App() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("準備完了");

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setStatus("sql.jsを読み込み中...");

        try {
            // 💡 外部（CDN）から直接部品を持ってくる設定。これで「コピーコマンド」は不要になります。
            const SQL = await initSqlJs({
                locateFile: file => `https://sql.js.org/dist/${file}`
            });

            setStatus("ファイルを解析中...");
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const db = new SQL.Database(new Uint8Array(reader.result));
                    const res = db.exec("SELECT domain, relativePath FROM Files WHERE (relativePath LIKE '%.mp4' OR relativePath LIKE '%.mov') LIMIT 100");

                    if (res.length > 0) {
                        setResults(res[0].values);
                        setStatus(`成功！ ${res[0].values.length}件の動画が見つかりました`);
                    } else {
                        setStatus("動画は見つかりませんでした（ファイルが空か、Manifest.dbではありません）");
                    }
                } catch (err) {
                    setStatus("エラー：データベースの形式が正しくありません");
                }
                setLoading(false);
            };
            reader.readAsArrayBuffer(file);
        } catch (err) {
            console.error(err);
            setStatus("エラー：ネットから部品を読み込めませんでした。ブラウザを再読み込みしてください。");
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#242424', color: 'white', minHeight: '100vh' }}>
            <h1 style={{ color: '#646cff' }}>iPhone Backup Analyzer</h1>
            <div style={{ padding: '20px', border: '2px solid #646cff', borderRadius: '10px', display: 'inline-block' }}>
                <input type="file" onChange={handleFileChange} />
                <p style={{ marginTop: '10px' }}>ステータス: <strong>{status}</strong></p>
            </div>

            {results.length > 0 && (
                <div style={{ marginTop: '30px' }}>
                    <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#333' }}><th>アプリ名 (Domain)</th><th>保存名 (Path)</th></tr>
                        </thead>
                        <tbody>
                            {results.map((row, i) => (
                                <tr key={i}><td>{row[0]}</td><td style={{ fontWeight: 'bold' }}>{row[1]}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default App;