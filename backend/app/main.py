from fastapi import FastAPI

app = FastAPI(
    title="Sistema de Rega IoT",
    description="API do sistema de monitoramento e rega automatizada de plantas.",
    version="0.1.0",
)


@app.get("/")
def health_check():
    return {
        "message": "Servidor do Sistema de Rega IoT está funcionando!"
    }