import React, { useState } from 'react';
import initSqlJs from 'sql.js';

function App() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 状態のリセット
        setLoading(true);
        setError(null);
        setResults([]);

        try {
            // 1. sql.js の初期化（ローカルの public/sqljs から読み込む設定）
            const SQL = await initSqlJs({
                locateFile: file => `/sqljs/${file}`
            });

            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const Uints = new Uint8Array(reader.result);
                    const db = new SQL.Database(Uints);

                    // 2. iPhoneのManifest.dbから動画ファイル (.mp4, .mov) を抽出する
                    // domain: どのアプリか, relativePath: 本来の保存名
                    const query = `
            SELECT domain, relativePath 
            FROM Files 
            WHERE (relativePath LIKE '%.mp4' OR relativePath LIKE '%.mov') 
            ORDER BY domain ASC 
            LIMIT 300
          `;

                    const res = db.exec(query);

                    if (res.length > 0) {
                        setResults(res[0].values);
                    } else {
                        setError("動画の記録が見つかりませんでした。別のManifest.dbを試してください。");
                    }
                } catch (dbErr) {
                    console.error(dbErr);
                    setError("データベースの解析に失敗しました。正しいManifest.dbを選択してください。");
                }
                setLoading(false);
            };

            reader.onerror = () => {
                setError("ファイルの読み込み中にエラーが発生しました。");
                setLoading(false);
            };

            // バイナリとして読み込み
            reader.readAsArrayBuffer(file);

        } catch (err) {
            console.error(err);
            setError("sql.js の起動に失敗しました。手順1のコピーコマンドを実行したか確認してください。");
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto', color: '#333' }}>
            <header style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ color: '#646cff', fontSize: '2.5rem' }}>iPhone Backup Analyzer</h1>
                <p style={{ color: '#666' }}>バックアップ内の <strong>Manifest.db</strong> を解析して、消えたかもしれない動画のパスを探します</p>
            </header>

            <div style={{
                border: '3px dashed #646cff',
                padding: '40px',
                borderRadius: '16px',
                textAlign: 'center',
                backgroundColor: '#fdfdfd',
                transition: '0.3s'
            }}>
                <input
                    type="file"
                    onChange={handleFileChange}
                    style={{ fontSize: '18px', cursor: 'pointer' }}
                />
                <div style={{ fontSize: '12px', color: '#999', marginTop: '15px' }}>
                    ヒント: ~/Library/Application Support/MobileSync/Backup/ 内の Manifest.db を選択
        </div>
            </div>

            {loading && (
                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                    <div className="spinner" style={{ marginBottom: '10px' }}>🌀</div>
                    <p>大量のデータをスキャン中... しばらくお待ちください</p>
                </div>
            )}

            {error && (
                <div style={{
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    padding: '15px',
                    borderRadius: '8px',
                    marginTop: '20px',
                    textAlign: 'center',
                    fontWeight: 'bold'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {results.length > 0 && (
                <div style={{ marginTop: '50px' }}>
                    <h3 style={{ borderBottom: '2px solid #646cff', paddingBottom: '10px' }}>
                        🎥 見つかった動画の記録 ({results.length}件)
          </h3>
                    <div style={{ overflowX: 'auto', border: '1px solid #eee', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', backgroundColor: '#fff' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#646cff', color: '#fff' }}>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>ドメイン (保存元)</th>
                                    <th style={{ padding: '15px', textAlign: 'left' }}>本来のファイルパス</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #eee', hover: { backgroundColor: '#f9f9f9' } }}>
                                        <td style={{ padding: '12px', color: '#888' }}>{row[0]}</td>
                                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#222', wordBreak: 'break-all' }}>{row[1]}</td>
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