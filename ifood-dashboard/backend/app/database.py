import os
from dotenv import load_dotenv
from typing import Any, Dict, Iterable, List, Optional
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base, Session

# Carrega variáveis do .env (para execuções fora do Docker Compose)
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ifood.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def fetch_all(db: Session, sql: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """Execute raw SQL and return a list of dictionaries.

    - Uses the provided `db` session (FastAPI DI supplies it per request).
    - Returns rows as plain dicts, friendly to JSON serialization.
    """
    result = db.execute(text(sql), params or {})
    rows: List[Dict[str, Any]] = []
    for row in result.fetchall():
        rows.append(dict(row._mapping))
    return rows


def fetch_one(db: Session, sql: str, params: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
    """Execute raw SQL and return a single row as a dictionary, or None."""
    result = db.execute(text(sql), params or {})
    row = result.fetchone()
    return dict(row._mapping) if row else None
