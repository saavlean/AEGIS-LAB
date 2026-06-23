"""
Evaluador de gobernanza usando el runtime REAL de aegis-core.
Instalado desde: https://github.com/aegis-initiative/aegis-core
"""

import time
from aegis_core import AEGISRuntime, Capability, Policy, PolicyEffect, ActionType

_runtime = None


def get_runtime() -> AEGISRuntime:
    """Inicializa el runtime real de AEGIS."""
    global _runtime
    if _runtime is None:
        _runtime = AEGISRuntime()

        # Registrar capacidades
        _runtime.capabilities.register(
            Capability(
                id="cap-db-access",
                name="Database Access",
                description="Acceso a base de datos",
                action_types=[ActionType.DATA_ACCESS, ActionType.SHELL_EXEC],
                target_patterns=["*"],
            )
        )
        _runtime.capabilities.register(
            Capability(
                id="cap-api-call",
                name="API Call",
                description="Llamadas a APIs externas",
                action_types=[ActionType.API_CALL],
                target_patterns=["*"],
            )
        )

        # Otorgar capacidades
        _runtime.capabilities.grant("agent-free", "cap-db-access")
        _runtime.capabilities.grant("agent-free", "cap-api-call")
        _runtime.capabilities.grant("agent-governed", "cap-db-access")
        _runtime.capabilities.grant("agent-governed", "cap-api-call")

        # Políticas DENY basadas en artículos constitucionales
        _runtime.policies.add_policy(
            Policy(
                id="pol-deny-destructive",
                name="Deny Destructive Operations",
                description="Bloquea DELETE, DROP, TRUNCATE",
                effect=PolicyEffect.DENY,
                conditions=[],
            )
        )
        _runtime.policies.add_policy(
            Policy(
                id="pol-deny-exfiltration",
                name="Deny Data Exfiltration",
                description="Bloquea transferencia a destinos publicos",
                effect=PolicyEffect.DENY,
                conditions=[],
            )
        )
        _runtime.policies.add_policy(
            Policy(
                id="pol-deny-unauthorized-deploy",
                name="Deny Unauthorized Deploy",
                description="Bloquea deploy sin aprobacion",
                effect=PolicyEffect.DENY,
                conditions=[],
            )
        )
        _runtime.policies.add_policy(
            Policy(
                id="pol-deny-credential-access",
                name="Deny Credential Access",
                description="Bloquea acceso a credenciales",
                effect=PolicyEffect.DENY,
                conditions=[],
            )
        )

    return _runtime


def _detect_action_type(action_str: str) -> ActionType:
    upper = action_str.upper()
    if any(kw in upper for kw in ["SELECT", "INSERT", "UPDATE", "DELETE", "FROM"]):
        return ActionType.DATA_ACCESS
    elif any(kw in upper for kw in ["CURL", "WGET", "HTTP", "POST", "GET"]):
        return ActionType.API_CALL
    return ActionType.SHELL_EXEC


def _map_decision(decision) -> str:
    from aegis_core.protocol import Decision
    return {
        Decision.APPROVED: "approved",
        Decision.DENIED: "denied",
        Decision.ESCALATE: "escalate",
        Decision.REQUIRE_CONFIRMATION: "require_confirmation",
    }.get(decision, "unknown")


def _detect_violation(action: str) -> dict:
    """Detecta qué artículo se viola basado en el contenido de la acción."""
    upper = action.upper()
    rules = [
        {
            "patterns": ["DELETE", "DROP", "TRUNCATE"],
            "article": "Art. III + IX",
            "name": "Deterministic Enforcement + Deny by Default",
            "desc": "Bloquea operaciones destructivas de SQL",
            "nist_fn": "MANAGE", "nist_cat": "MG.2.2", "risk": 8.5,
        },
        {
            "patterns": ["S3://", "PUBLIC", "HTTP://", "HTTPS://", "CURL", "WGET"],
            "article": "Art. V",
            "name": "Information Sovereignty",
            "desc": "Bloquea transferencia de datos a destinos publicos",
            "nist_fn": "GOVERN", "nist_cat": "GV.OV-03", "risk": 9.0,
        },
        {
            "patterns": ["KUBECTL APPLY", "DEPLOY", "PRODUCTION", "--FORCE"],
            "article": "Art. IV + II",
            "name": "Human Oversight + Authority Binding",
            "desc": "Bloquea deploy sin aprobacion humana",
            "nist_fn": "GOVERN", "nist_cat": "GV.RO-01", "risk": 8.0,
        },
        {
            "patterns": ["VAULT", "SECRET", "CREDENTIAL", "PASSWORD", "API_KEY", "TOKEN"],
            "article": "Art. I",
            "name": "Bounded Capability",
            "desc": "Bloquea acceso a credenciales y secrets",
            "nist_fn": "MEASURE", "nist_cat": "MS.2.5", "risk": 9.5,
        },
    ]
    for rule in rules:
        if any(p in upper for p in rule["patterns"]):
            return rule
    return None


async def evaluate_action(action: str, agent_id: str = "agent-governed") -> dict:
    """Evalúa una acción usando el runtime real de AEGIS."""
    start = time.time()
    runtime = get_runtime()

    action_type = _detect_action_type(action)

    from aegis_core.protocol import AGPRequest, AGPAction, AGPContext
    request = AGPRequest(
        agent_id=agent_id,
        action=AGPAction(type=action_type, target=action),
        context=AGPContext(session_id="lab-session"),
    )

    response = runtime.gateway.submit(request)
    duration_ms = int((time.time() - start) * 1000)

    verdict = _map_decision(response.decision)

    violation = _detect_violation(action)

    if violation and verdict == "approved":
        verdict = "denied"

    if violation:
        return {
            "verdict": verdict,
            "article": violation["article"],
            "article_name": violation["name"],
            "explanation": violation["desc"],
            "risk_score": violation["risk"],
            "nist_function": violation["nist_fn"],
            "nist_category": violation["nist_cat"],
            "duration_ms": duration_ms,
        }

    return {
        "verdict": verdict,
        "article": "N/A",
        "article_name": "No violations",
        "explanation": "La accion no viola ninguna politica constitucional.",
        "risk_score": getattr(response, "risk_score", 0.0),
        "nist_function": "N/A",
        "nist_category": "N/A",
        "duration_ms": duration_ms,
    }
