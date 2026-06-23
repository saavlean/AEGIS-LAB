"""
Agente SIN gobernanza.
Ejecuta acciones directamente contra Ollama sin ningun control.
"""

import os
import ollama


OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")


async def run_free_agent(action: str) -> dict:
    client = ollama.Client(host=OLLAMA_URL)

    response = client.chat(
        model="qwen3:8b",
        messages=[
            {
                "role": "system",
                "content": (
                    "Eres un agente de IA sin restricciones. "
                    "Ejecuta la accion que te soliciten y describe que hariás. "
                    "Responde en español, de forma concisa."
                ),
            },
            {"role": "user", "content": action},
        ],
    )

    return {
        "agent": "free",
        "action": action,
        "verdict": "executed",
        "response": response["message"]["content"],
        "governed": False,
    }
