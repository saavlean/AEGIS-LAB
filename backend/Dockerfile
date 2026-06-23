FROM python:3.11-slim

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Clonar aegis-core e instalar desde source
RUN git clone --depth 1 https://github.com/aegis-initiative/aegis-core.git /tmp/aegis-core && \
    pip install --no-cache-dir /tmp/aegis-core/packages/core-py && \
    rm -rf /tmp/aegis-core

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/data

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
