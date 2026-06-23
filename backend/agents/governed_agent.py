"""
Agente CON gobernanza.
Toda accion pasa por el runtime AGP 1 de aegis-core ANTES de llegar al LLM.
"""

import os
import ollama
from governance.evaluator import evaluate_action
from database.db import log_action


OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")


async def run_governed_agent(action: str) -> dict:
    evaluation = await evaluate_action(action, agent_id="agent-governed")
    await log_action(action, evaluation)

    verdict = evaluation["verdict"]

    if verdict != "approved":
        return {
            "agent": "governed",
            "action": action,
            "verdict": verdict,
            "article": evaluation["article"],
            "article_name": evaluation["article_name"],
            "explanation": evaluation["explanation"],
            "risk_score": evaluation["risk_score"],
            "nist_function": evaluation["nist_function"],
            "nist_category": evaluation["nist_category"],
            "response": None,
            "duration_ms": evaluation["duration_ms"],
            "governed": True,
        }

    client = ollama.Client(host=OLLAMA_URL)
    response = client.chat(
        model="qwen3:8b",
        messages=[
            {
                "role": "system",
                "content": (
                    "Eres un agente de IA gobernado por AEGIS. "
                    "Tu accion fue evaluada y aprobada por el motor de gobernanza. "
                    "Ejecuta la accion y describe que hariás. "
                    "Responde en español, de forma concisa."
                ),
            },
            {"role": "user", "content": action},
        ],
    )

    return {
        "agent": "governed",
        "action": action,
        "verdict": "approved",
        "article": evaluation["article"],
        "article_name": evaluation["article_name"],
        "explanation": evaluation["explanation"],
        "risk_score": evaluation["risk_score"],
        "nist_function": evaluation["nist_function"],
        "nist_category": evaluation["nist_category"],
        "response": response["message"]["content"],
        "duration_ms": evaluation["duration_ms"],
        "governed": True,
    }
