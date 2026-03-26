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
        setStatus("システムを起動中...");
        setResults([]);

        try {
            // 💡 外部サーバー(CDN)から部品を読み込む設定
            // もしネットが遅い場合はここがエラーになりますが、その場合はリロードしてください
            const SQL = await initSqlJs({
                locateFile: file => `https://sql.js.org/dist/${file}`
            });

            setStatus("Manifest.db を解析中...");
            const reader = new FileReader();

            reader.onload = () => {
                try {
                    const db = new SQL.Database(new Uint8Array(reader.result));

                    // iPhoneバックアップから動画ファイル(.mp4, .mov)の記録だけを抽出
                    const query = `
            SELECT domain, relativePath 
            FROM Files 
            WHERE (relativePath LIKE '%.mp4' OR relativePath LIKE '%.mov') 
            ORDER BY domain ASC 
            LIMIT 200
          `;

                    const res = db.exec(query);

                    if (res.length > 0) {
                        setResults(res[0].values);
                        setStatus(`成功！ ${res[0].values.length}件の動画が見つかりました`);
                    } else {
                        setStatus("動画の記録が見つかりませんでした。別のManifest.dbを試してください。");
                    }
                } catch (err) {
                    console.error(err);
                    setStatus("エラー：データベースの解析に失敗しました。正しいファイルか確認してください。");
                }
                setLoading(false);
            };

            reader.readAsArrayBuffer(file);
        } catch (err) {
            console.error(err);
            setStatus("エラー：部品の読み込みに失敗しました。ネット接続を確認して再読み込みしてください。");
            setLoading(false);
        }
    };

    return (
        <div style={{
            padding: '40px',
            fontFamily: 'sans-serif',
            backgroundColor: '#121212',
            color: '#e0e0e0',
            minHeight: '100vh',
            textAlign: 'center'
        }}>
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ color: '#646cff', fontSize: '2.5rem', marginBottom: '10px' }}>iPhone Backup Analyzer</h1>
                <p style={{ color: '#aaa' }}>Manifest.db を解析して、バックアップ内の動画パスを特定します</p>
            </header>

            <div style={{
                border: '2px dashed #646cff',
                padding: '30px',
                borderRadius: '15px',
                display: 'inline-block',
                backgroundColor: '#1e1e1e',
                marginBottom: '20px'
            }}>
                <input
                    type="file"
                    onChange={handleFileChange}
                    style={{ fontSize: '16px', color: '#fff', cursor: 'pointer' }}
                />
                <div style={{ marginTop: '15px', color: status.includes('エラー') ? '#ff5252' : '#646cff', fontWeight: 'bold' }}>
                    【現在の状態】 {status}
                </div>
            </div>

            {loading && <div style={{ marginTop: '20px' }}>🌀 スキャンしています...</div>}

            {results.length > 0 && (
                <div style={{ marginTop: '40px', textAlign: 'left', maxWidth: '1000px', margin: '40px auto' }}>
                    <h3 style={{ borderBottom: '2px solid #646cff', paddingBottom: '10px' }}>🎥 検出された動画ファイル</h3>
                    <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #333' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1e1e1e' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#333', color: '#fff' }}>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>保存元 (Domain)</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>本来のパス (Path)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #333' }}>
                                        <td style={{ padding: '12px', color: '#888', fontSize: '0.85rem' }}>{row[0]}</td>
                                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#fff', wordBreak: 'break-all' }}>{row[1]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;