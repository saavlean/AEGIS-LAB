import aiosqlite
from datetime import datetime

DB_PATH = "./data/audit.db"


async def init_db():
    """Inicializa la tabla de audit log."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS audit_log (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp     TEXT    NOT NULL,
                action        TEXT    NOT NULL,
                verdict       TEXT    NOT NULL,
                article       TEXT,
                article_name  TEXT,
                explanation   TEXT,
                risk_score    REAL,
                nist_function TEXT,
                nist_category TEXT,
                duration_ms   INTEGER
            )
        """)
        await db.commit()


async def log_action(action: str, evaluation: dict):
    """Registra una accion evaluada en el audit trail."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            INSERT INTO audit_log
            (timestamp, action, verdict, article, article_name,
             explanation, risk_score, nist_function, nist_category, duration_ms)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            datetime.utcnow().isoformat(),
            action,
            evaluation.get("verdict"),
            evaluation.get("article"),
            evaluation.get("article_name"),
            evaluation.get("explanation"),
            evaluation.get("risk_score"),
            evaluation.get("nist_function"),
            evaluation.get("nist_category"),
            evaluation.get("duration_ms"),
        ))
        await db.commit()


async def get_audit_log(limit=50, verdict=None):
    """Retorna el audit trail completo o filtrado por veredicto."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        if verdict:
            cursor = await db.execute(
                "SELECT * FROM audit_log WHERE verdict=? ORDER BY id DESC LIMIT ?",
                (verdict, limit)
            )
        else:
            cursor = await db.execute(
                "SELECT * FROM audit_log ORDER BY id DESC LIMIT ?", (limit,)
            )
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]


async def get_metrics():
    """Metricas agregadas para el dashboard."""
    async with aiosqlite.connect(DB_PATH) as db:
        total     = (await (await db.execute("SELECT COUNT(*) FROM audit_log")).fetchone())[0]
        blocked   = (await (await db.execute("SELECT COUNT(*) FROM audit_log WHERE verdict='denied'")).fetchone())[0]
        allowed   = (await (await db.execute("SELECT COUNT(*) FROM audit_log WHERE verdict='approved'")).fetchone())[0]
        escalated = (await (await db.execute("SELECT COUNT(*) FROM audit_log WHERE verdict='escalate'")).fetchone())[0]
        avg_ms    = (await (await db.execute("SELECT AVG(duration_ms) FROM audit_log")).fetchone())[0]
        top_articles = await (await db.execute("""
            SELECT article_name, COUNT(*) as count
            FROM audit_log WHERE verdict='denied'
            GROUP BY article_name ORDER BY count DESC LIMIT 6
        """)).fetchall()
        return {
            "total": total,
            "blocked": blocked,
            "allowed": allowed,
            "escalated": escalated,
            "avg_latency_ms": round(avg_ms or 0, 1),
            "top_articles": [{"name": r[0], "count": r[1]} for r in top_articles]
        }
