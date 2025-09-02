from sqlalchemy import Column, Integer, String, Date, DateTime, Numeric, ForeignKey
from .database import Base

class Login(Base):
    __tablename__ = "login"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    id_unidade = Column(Integer, ForeignKey("unidades.id"))

class Unidade(Base):
    __tablename__ = "unidades"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    cidade = Column(String)
    estado = Column(String(2))
    data_abertura = Column(Date)

class Pedido(Base):
    __tablename__ = "pedidos"
    id = Column(Integer, primary_key=True, index=True)
    id_cliente = Column(Integer)
    id_unidade = Column(Integer, ForeignKey("unidades.id"))
    data_pedido = Column(DateTime)
    status = Column(String)
    valor_total = Column(Numeric)

class MetricaDiaria(Base):
    __tablename__ = "metricas_diarias"
    id = Column(Integer, primary_key=True, index=True)
    id_unidade = Column(Integer, ForeignKey("unidades.id"))
    data_referencia = Column(Date)
    total_faturamento = Column(Numeric)
    total_pedidos = Column(Integer)
    total_cancelamentos = Column(Integer)
    media_nota = Column(Numeric)
