import os
from datetime import datetime, timedelta
import jwt
import bcrypt
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session

from . import models
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
SECRET_KEY = os.getenv("SECRET_KEY", "secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

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

@app.post("/auth/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
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
    db.commit()
    db.refresh(user)
    return {"id": user.id, "email": user.email, "name": user.name}

@app.get("/lojas")
def get_lojas(db: Session = Depends(get_db), current_user: models.Login = Depends(get_current_user)):
    return db.query(models.Unidade).all()

@app.get("/pedidos")
def get_pedidos(db: Session = Depends(get_db), current_user: models.Login = Depends(get_current_user)):
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
