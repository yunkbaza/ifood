from sqlalchemy import Column, Integer, String, Date, DateTime, Numeric, ForeignKey
from sqlalchemy.sql import func
from .database import Base

class Login(Base):
    __tablename__ = "login"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    id_unidade = Column(Integer, ForeignKey("unidades.id"), nullable=True)
    role = Column(String, default="user")
    last_login = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Unidade(Base):
    __tablename__ = "unidades"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False, unique=True)
    cidade = Column(String)
    estado = Column(String(2))
    data_abertura = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Pedido(Base):
    __tablename__ = "pedidos"
    id = Column(Integer, primary_key=True, index=True)
    id_cliente = Column(Integer)
    id_unidade = Column(Integer, ForeignKey("unidades.id"))
    id_regiao_entrega = Column(Integer)
    data_pedido = Column(DateTime, default=func.now())
    status = Column(String)
    valor_total = Column(Numeric, default=0)
    motivo_cancelamento = Column(String)
    origem_cancelamento = Column(String)
    data_aceite = Column(DateTime)
    data_saida_entrega = Column(DateTime)
    data_entrega = Column(DateTime)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class MetricaDiaria(Base):
    __tablename__ = "metricas_diarias"
    id = Column(Integer, primary_key=True, index=True)
    id_unidade = Column(Integer, ForeignKey("unidades.id"))
    data_referencia = Column(Date)
    total_faturamento = Column(Numeric, default=0)
    total_pedidos = Column(Integer, default=0)
    total_cancelamentos = Column(Integer, default=0)
    media_nota = Column(Numeric, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
