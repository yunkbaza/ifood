import os
from datetime import datetime, timedelta
import io
import csv
import jwt
import bcrypt
import httpx
from fastapi import Depends, FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from . import models
from .database import SessionLocal

app = FastAPI()

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable is not set")
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

@limiter.limit("5/minute")
@app.post("/auth/login", response_model=Token)
def login(request: Request, data: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, data.email, data.password)
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
    return db.query(models.Unidade).all()

@limiter.limit("10/minute")
@app.get("/pedidos")
def get_pedidos(request: Request, db: Session = Depends(get_db), current_user: models.Login = Depends(get_current_user)):
    return db.query(models.Pedido).all()


@app.get("/metrics/monthly-revenue")
def get_monthly_revenue(
    db: Session = Depends(get_db),
    current_user: models.Login = Depends(get_current_user),
):
    result = db.execute("SELECT * FROM faturamento_mensal_unidades").fetchall()
    return [dict(row) for row in result]


@app.get("/metrics/orders-by-status")
def get_orders_by_status(
    db: Session = Depends(get_db),
    current_user: models.Login = Depends(get_current_user),
):
    result = db.execute("SELECT * FROM pedidos_por_status").fetchall()
    return [dict(row) for row in result]


@limiter.limit("10/minute")
@app.get("/metricas")
def get_metricas(request: Request, db: Session = Depends(get_db), current_user: models.Login = Depends(get_current_user)):
    return db.query(models.MetricaDiaria).all()


@limiter.limit("10/minute")
@app.get("/relatorios")
def get_relatorios(request: Request, db: Session = Depends(get_db), current_user: models.Login = Depends(get_current_user)):
    result = db.execute(
        "SELECT id_unidade, SUM(total_faturamento) AS total_faturamento FROM metricas_diarias GROUP BY id_unidade"
    ).fetchall()
    return [dict(row) for row in result]
@limiter.limit("10/minute")
@app.get("/pedidos/{pedido_id}")
def get_pedido(
    request: Request,
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user: models.Login = Depends(get_current_user),
):
    pedido = db.query(models.Pedido).filter(models.Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido not found")
    return pedido


@limiter.limit("10/minute")
@app.get("/pedidos/{pedido_id}/export")
def export_pedido(
    request: Request,
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user: models.Login = Depends(get_current_user),
):
    pedido = db.query(models.Pedido).filter(models.Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido not found")

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "id_cliente", "id_unidade", "data_pedido", "status", "valor_total"])
    writer.writerow([
        pedido.id,
        pedido.id_cliente,
        pedido.id_unidade,
        pedido.data_pedido,
        pedido.status,
        pedido.valor_total,
    ])

    response = Response(content=output.getvalue(), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=pedido_{pedido_id}.csv"
    return response
