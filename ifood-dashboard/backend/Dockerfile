FROM python:3.11-slim

# Evita prompts no apt
ENV DEBIAN_FRONTEND=noninteractive

# Instala libs necessárias ao psycopg2 e compilação
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev curl \
  && rm -rf /var/lib/apt/lists/*

# Diretório da app
WORKDIR /app

# Copia requisitos primeiro (cache melhor)
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código
COPY app ./app

# Variáveis padrão (podem ser sobrescritas no compose)
ENV DATABASE_URL=sqlite:///./ifood.db
ENV UVICORN_HOST=0.0.0.0
ENV UVICORN_PORT=8000

# Exposição da porta
EXPOSE 8000

# Start do servidor
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
