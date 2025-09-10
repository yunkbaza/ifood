import os
from datetime import datetime, timedelta
import io
import csv
import jwt
import bcrypt
import httpx
from fastapi import Depends, FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from . import models
from .database import SessionLocal, fetch_all

app = FastAPI()

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS: quando allow_credentials=True, evite "*" para garantir preflight limpo.
frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

scheduler = AsyncIOScheduler()


async def coletar_dados_ifood():
    """Tarefa fictícia que demonstraria a coleta de dados do iFood."""
    async with httpx.AsyncClient() as client:
        # Este é um placeholder; a integração real do iFood requer credenciais
        await client.get("https://example.com/ifood")


@app.on_event("startup")
async def schedule_jobs():
    scheduler.add_job(coletar_dados_ifood, "interval", minutes=30)
    scheduler.start()


@app.get("/healthz")
def healthz():
    return {"status": "ok"}

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    id_unidade: int | None = None

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(models.Login).filter(models.Login.email == email).first()
    if not user:
        return None
    if not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        return None
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        user = db.query(models.Login).filter(models.Login.email == email).first()
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def _user_unit_id(user: models.Login | None) -> int | None:
    try:
        return int(user.id_unidade) if getattr(user, "id_unidade", None) is not None else None
    except Exception:
        return None

@limiter.limit("5/minute")
@app.post("/auth/login", response_model=Token)
def login(request: Request, data: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    access_token = create_access_token({"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}


@limiter.limit("5/minute")
@app.post("/auth/token", response_model=Token)
def login_oauth(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2 password flow compatible endpoint for Swagger Authorize.

    Uses `username` as email to authenticate and returns a bearer token.
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    access_token = create_access_token({"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    hashed_password = bcrypt.hashpw(data.password.encode(), bcrypt.gensalt()).decode()
    user = models.Login(
        name=data.name,
        email=data.email,
        password_hash=hashed_password,
        id_unidade=data.id_unidade,
    )
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )
    return {"id": user.id, "email": user.email, "name": user.name}

@limiter.limit("10/minute")
@app.get("/lojas")
def get_lojas(request: Request, db: Session = Depends(get_db), current_user: models.Login = Depends(get_current_user)):
    # Leitura direta via SQL, sem depender do ORM
    sql = """
        SELECT id, nome, cidade, estado, data_abertura
        FROM unidades
        ORDER BY nome
    """
    return fetch_all(db, sql)

@limiter.limit("10/minute")
@app.get("/pedidos")
def get_pedidos(request: Request, db: Session = Depends(get_db), current_user: models.Login = Depends(get_current_user)):
    # Leitura direta via SQL, sem depender do ORM
    sql = """
        SELECT id, id_cliente, id_unidade, id_regiao_entrega,
               data_pedido, status, valor_total,
               motivo_cancelamento, origem_cancelamento,
               data_aceite, data_saida_entrega, data_entrega,
               created_at, updated_at
        FROM pedidos
        ORDER BY data_pedido DESC
    """
    return fetch_all(db, sql)


@app.get("/metrics/monthly-revenue")
def get_monthly_revenue(
    db: Session = Depends(get_db),
    current_user: models.Login = Depends(get_current_user),
):
    rows = fetch_all(db, "SELECT unidade, mes, total_faturamento FROM faturamento_mensal_unidades")
    out = []
    for m in rows:
        out.append(
            {
                "unidade": m["unidade"],
                "mes": m["mes"],
                # normaliza o nome esperado pelo frontend
                "faturamento_total": float(m["total_faturamento"]) if m["total_faturamento"] is not None else 0.0,
            }
        )
    return out


@app.get("/metrics/orders-by-status")
def get_orders_by_status(
    start_date: str | None = None,
    end_date: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.Login = Depends(get_current_user),
):
    conditions: list[str] = []
    params: dict[str, object] = {}
    unit_id = _user_unit_id(current_user)
    if unit_id is not None:
        conditions.append("p.id_unidade = :unit_id")
        params["unit_id"] = unit_id
    if start_date:
        conditions.append("p.data_pedido >= :start_date")
        params["start_date"] = start_date
    if end_date:
        conditions.append("p.data_pedido <= :end_date")
        params["end_date"] = end_date
    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    query = f"""
        SELECT p.status, COUNT(*) AS total
        FROM pedidos p
        {where_clause}
        GROUP BY p.status
        ORDER BY p.status
    """
    return fetch_all(db, query, params)


@app.get("/metrics/top-selling-products")
def get_top_selling_products(
    start_date: str | None = None,
    end_date: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.Login = Depends(get_current_user),
):
    conditions = ["p.status = 'Entregue'"]
    params: dict[str, str] = {}
    if start_date:
        conditions.append("p.data_pedido >= :start_date")
        params["start_date"] = start_date
    if end_date:
        conditions.append("p.data_pedido <= :end_date")
        params["end_date"] = end_date
    where_clause = " AND ".join(conditions)
    query = f"""
        SELECT pr.nome, SUM(ip.quantidade) AS total_vendido
        FROM itens_pedido ip
        JOIN produtos pr ON pr.id = ip.id_produto
        JOIN pedidos p ON p.id = ip.id_pedido
        WHERE {where_clause}
        GROUP BY pr.nome
        ORDER BY total_vendido DESC
        LIMIT 5
    """
    return fetch_all(db, query, params)


@app.get("/metrics/average-ratings")
def get_average_ratings(
    start_date: str | None = None,
    end_date: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.Login = Depends(get_current_user),
):
    conditions: list[str] = []
    params: dict[str, str] = {}
    if start_date:
        conditions.append("p.data_pedido >= :start_date")
        params["start_date"] = start_date
    if end_date:
        conditions.append("p.data_pedido <= :end_date")
        params["end_date"] = end_date
    where_clause = " AND ".join(conditions)
    if where_clause:
        where_clause = "WHERE " + where_clause
    query = f"""
        SELECT u.nome AS unidade, AVG(f.nota) AS media_nota
        FROM feedbacks f
        JOIN pedidos p ON p.id = f.id_pedido
        JOIN unidades u ON u.id = p.id_unidade
        {where_clause}
        GROUP BY u.nome
        ORDER BY u.nome
    """
    return fetch_all(db, query, params)


@app.get("/metrics/weekly-orders")
def get_weekly_orders(
    start_date: str | None = None,
    end_date: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.Login = Depends(get_current_user),
):
    conditions: list[str] = []
    params: dict[str, str] = {}
    if start_date:
        conditions.append("p.data_pedido >= :start_date")
        params["start_date"] = start_date
    if end_date:
        conditions.append("p.data_pedido <= :end_date")
        params["end_date"] = end_date
    where_clause = " AND ".join(conditions)
    if where_clause:
        where_clause = "WHERE " + where_clause
    query = f"""
        SELECT to_char(date_trunc('week', p.data_pedido), 'IYYY-IW') AS semana,
               COUNT(*) AS total_pedidos
        FROM pedidos p
        {where_clause}
        GROUP BY semana
        ORDER BY semana
    """
    return fetch_all(db, query, params)


@app.get("/metrics/top-products-revenue")
def get_top_products_revenue(
    start_date: str | None = None,
    end_date: str | None = None,
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: models.Login = Depends(get_current_user),
):
    conditions = ["p.status = 'Entregue'"]
    params: dict[str, object] = {"limit": limit}
    unit_id = _user_unit_id(current_user)
    if unit_id is not None:
        conditions.append("p.id_unidade = :unit_id")
        params["unit_id"] = unit_id
    if start_date:
        conditions.append("p.data_pedido >= :start_date")
        params["start_date"] = start_date
    if end_date:
        conditions.append("p.data_pedido <= :end_date")
        params["end_date"] = end_date
    where_clause = " AND ".join(conditions)
    query = f"""
        SELECT pr.nome AS produto,
               SUM(ip.quantidade * ip.preco_unitario) AS receita
        FROM itens_pedido ip
        JOIN produtos pr ON pr.id = ip.id_produto
        JOIN pedidos p   ON p.id = ip.id_pedido
        WHERE {where_clause}
        GROUP BY pr.nome
        ORDER BY receita DESC
        LIMIT :limit
    """
    return fetch_all(db, query, params)


@app.get("/metrics/daily-revenue")
def get_daily_revenue(
    start_date: str,
    end_date: str,
    db: Session = Depends(get_db),
    current_user: models.Login = Depends(get_current_user),
):
    if not start_date or not end_date:
        raise HTTPException(status_code=400, detail="start_date and end_date are required (YYYY-MM-DD)")
    conditions = ["p.status = 'Entregue'", "p.data_pedido >= :start_date", "p.data_pedido <= :end_date"]
    params: dict[str, object] = {"start_date": start_date, "end_date": end_date}
    unit_id = _user_unit_id(current_user)
    if unit_id is not None:
        conditions.append("p.id_unidade = :unit_id")
        params["unit_id"] = unit_id
    where_clause = " AND ".join(conditions)
    query = f"""
        SELECT DATE(p.data_pedido) AS dia,
               SUM(p.valor_total) AS faturamento,
               AVG(p.valor_total) AS ticket_medio
        FROM pedidos p
        WHERE {where_clause}
        GROUP BY DATE(p.data_pedido)
        ORDER BY dia
    """
    return fetch_all(db, query, params)


@app.get("/metrics/cancellation-cost")
def get_cancellation_cost(
    start_date: str | None = None,
    end_date: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.Login = Depends(get_current_user),
):
    conditions = ["p.status = 'Cancelado'"]
    params: dict[str, object] = {}
    unit_id = _user_unit_id(current_user)
    if unit_id is not None:
        conditions.append("p.id_unidade = :unit_id")
        params["unit_id"] = unit_id
    if start_date:
        conditions.append("p.data_pedido >= :start_date")
        params["start_date"] = start_date
    if end_date:
        conditions.append("p.data_pedido <= :end_date")
        params["end_date"] = end_date
    where_clause = " AND ".join(conditions)
    query = f"""
        SELECT COALESCE(SUM(p.valor_total), 0) AS custo_cancelamento
        FROM pedidos p
        WHERE {where_clause}
    """
    row = fetch_all(db, query, params)
    return row[0] if row else {"custo_cancelamento": 0}


@app.get("/metrics/daily-overview")
def get_daily_overview(
    date: str,
    db: Session = Depends(get_db),
    current_user: models.Login = Depends(get_current_user),
):
    if not date:
        raise HTTPException(status_code=400, detail="date is required (YYYY-MM-DD)")
    params: dict[str, object] = {"d": date}
    unit_id = _user_unit_id(current_user)
    unit_filter = ""
    if unit_id is not None:
        unit_filter = "AND p.id_unidade = :unit_id"
        params["unit_id"] = unit_id

    # KPIs
    kpis_sql = f"""
        SELECT
            COUNT(*) AS total_pedidos,
            SUM(CASE WHEN p.status='Entregue' THEN p.valor_total ELSE 0 END) AS faturamento_dia,
            AVG(EXTRACT(EPOCH FROM (p.data_aceite - p.data_pedido)) / 60.0) AS tempo_medio_aceite,
            AVG(CASE WHEN p.status='Entregue' AND p.data_aceite IS NOT NULL AND p.data_entrega IS NOT NULL
                     THEN EXTRACT(EPOCH FROM (p.data_entrega - p.data_aceite)) / 60.0 END) AS tempo_medio_entrega
        FROM pedidos p
        WHERE DATE(p.data_pedido) = :d {unit_filter}
    """
    kpis = fetch_all(db, kpis_sql, params)
    kpis = kpis[0] if kpis else {"total_pedidos": 0, "faturamento_dia": 0, "tempo_medio_aceite": None, "tempo_medio_entrega": None}

    # Pedidos por status
    status_sql = f"""
        SELECT p.status, COUNT(*) AS total
        FROM pedidos p
        WHERE DATE(p.data_pedido)=:d {unit_filter}
        GROUP BY p.status
    """
    por_status = fetch_all(db, status_sql, params)

    # Clientes novos vs recorrentes
    # Novos vs recorrentes sem depender de clientes.data_cadastro (nem sempre existe)
    clientes_sql = f"""
        WITH primeiros_pedidos AS (
            SELECT id_cliente, MIN(DATE(data_pedido)) AS primeira_data
            FROM pedidos
            WHERE id_cliente IS NOT NULL
            GROUP BY id_cliente
        )
        SELECT
            SUM(CASE WHEN pp.primeira_data = :d THEN 1 ELSE 0 END) AS novos,
            SUM(CASE WHEN pp.primeira_data < :d THEN 1 ELSE 0 END) AS recorrentes
        FROM pedidos p
        JOIN primeiros_pedidos pp ON pp.id_cliente = p.id_cliente
        WHERE DATE(p.data_pedido)=:d {unit_filter}
    """
    clientes = fetch_all(db, clientes_sql, params)
    clientes = clientes[0] if clientes else {"novos": 0, "recorrentes": 0}

    return {
        **kpis,
        "por_status": por_status,
        "clientes": clientes,
    }


@app.get("/metrics/daily-cumulative-revenue")
def get_daily_cumulative_revenue(
    date: str,
    db: Session = Depends(get_db),
    current_user: models.Login = Depends(get_current_user),
):
    if not date:
        raise HTTPException(status_code=400, detail="date is required (YYYY-MM-DD)")
    params: dict[str, object] = {"d": date}
    unit_id = _user_unit_id(current_user)
    unit_filter = ""
    if unit_id is not None:
        unit_filter = "AND p.id_unidade = :unit_id"
        params["unit_id"] = unit_id
    sql = f"""
        SELECT p.data_pedido AS ts, p.valor_total
        FROM pedidos p
        WHERE DATE(p.data_pedido)=:d AND p.status='Entregue' {unit_filter}
        ORDER BY p.data_pedido
    """
    rows = fetch_all(db, sql, params)
    # acumulado será calculado no frontend (mantém compatibilidade com drivers)
    return rows


@app.get("/metrics/daily-accept-time-by-hour")
def get_daily_accept_time_by_hour(
    date: str,
    db: Session = Depends(get_db),
    current_user: models.Login = Depends(get_current_user),
):
    if not date:
        raise HTTPException(status_code=400, detail="date is required (YYYY-MM-DD)")
    params: dict[str, object] = {"d": date}
    unit_id = _user_unit_id(current_user)
    unit_filter = ""
    if unit_id is not None:
        unit_filter = "AND p.id_unidade = :unit_id"
        params["unit_id"] = unit_id
    sql = f"""
        SELECT EXTRACT(HOUR FROM p.data_pedido) AS hora,
               AVG(EXTRACT(EPOCH FROM (p.data_aceite - p.data_pedido)) / 60.0) AS tempo_medio
        FROM pedidos p
        WHERE DATE(p.data_pedido)=:d AND p.data_aceite IS NOT NULL {unit_filter}
        GROUP BY EXTRACT(HOUR FROM p.data_pedido)
        ORDER BY hora
    """
    return fetch_all(db, sql, params)


@app.get("/metrics/daily-cancellations-by-hour")
def get_daily_cancellations_by_hour(
    date: str,
    db: Session = Depends(get_db),
    current_user: models.Login = Depends(get_current_user),
):
    if not date:
        raise HTTPException(status_code=400, detail="date is required (YYYY-MM-DD)")
    params: dict[str, object] = {"d": date}
    unit_id = _user_unit_id(current_user)
    unit_filter = ""
    if unit_id is not None:
        unit_filter = "AND p.id_unidade = :unit_id"
        params["unit_id"] = unit_id
    sql = f"""
        SELECT EXTRACT(HOUR FROM p.data_pedido) AS hora,
               COALESCE(p.motivo_cancelamento, 'Sem motivo') AS motivo,
               COUNT(*) AS qtd
        FROM pedidos p
        WHERE DATE(p.data_pedido)=:d AND p.status='Cancelado' {unit_filter}
        GROUP BY EXTRACT(HOUR FROM p.data_pedido), COALESCE(p.motivo_cancelamento, 'Sem motivo')
        ORDER BY hora, motivo
    """
    return fetch_all(db, sql, params)
