"""
Políticas constitucionales del AEGIS Governance Lab.
Basadas en los 11 artículos reales del aegis-constitution.
"""

from aegis_core.capability_registry import Capability
from aegis_core.policy_engine import Policy, PolicyEffect, PolicyCondition
from aegis_core.protocol import ActionType


def get_capabilities():
    """Capacidades que se les otorgan a los agentes."""
    return [
        Capability(
            id="cap-db-access",
            name="Database Access",
            description="Acceso a base de datos para lectura y escritura",
            action_types=[ActionType.DATA_ACCESS, ActionType.SHELL_EXEC],
            target_patterns=["*"],
        ),
        Capability(
            id="cap-shell-exec",
            name="Shell Execution",
            description="Ejecucion de comandos del sistema",
            action_types=[ActionType.SHELL_EXEC],
            target_patterns=["*"],
        ),
        Capability(
            id="cap-api-call",
            name="API Call",
            description="Llamadas a APIs externas",
            action_types=[ActionType.API_CALL],
            target_patterns=["*"],
        ),
    ]


def get_policies():
    """
    Politicas basadas en los articulos constitucionales reales.
    Cada politica mapea a un articulo del aegis-constitution.
    """
    return [
        # Art. III - Deterministic Enforcement + Art. IX - Deny by Default
        # Escenario: DELETE masivo de datos
        Policy(
            id="pol-deny-destructive",
            name="Deny Destructive Operations",
            description="Bloquea DELETE, DROP, TRUNCATE — Art. III + IX",
            effect=PolicyEffect.DENY,
            conditions=[
                PolicyCondition(
                    evaluate=lambda req: any(
                        kw in req.action.target.upper()
                        for kw in ["DELETE", "DROP", "TRUNCATE"]
                    ),
                    description="Bloquea operaciones destructivas de SQL"
                )
            ],
            priority=10,
        ),
        # Art. V - Information Sovereignty
        # Escenario: Exportar a S3 publico
        Policy(
            id="pol-deny-data-exfiltration",
            name="Deny Data Exfiltration",
            description="Bloquea transferencia de datos a destinos publicos — Art. V",
            effect=PolicyEffect.DENY,
            conditions=[
                PolicyCondition(
                    evaluate=lambda req: any(
                        kw in req.action.target.lower()
                        for kw in ["s3://", "public", "http://", "https://", "curl", "wget"]
                    ),
                    description="Bloquea exportacion a destinos externos publicos"
                )
            ],
            priority=9,
        ),
        # Art. IV - Human Oversight + Art. II - Authority Binding
        # Escenario: Deploy sin aprobacion
        Policy(
            id="pol-deny-unauthorized-deploy",
            name="Deny Unauthorized Deploy",
            description="Bloquea deploy sin aprobacion humana — Art. IV + II",
            effect=PolicyEffect.DENY,
            conditions=[
                PolicyCondition(
                    evaluate=lambda req: any(
                        kw in req.action.target.lower()
                        for kw in ["kubectl apply", "deploy", "production", "--force"]
                    ),
                    description="Bloquea deploy sin aprobacion"
                )
            ],
            priority=10,
        ),
        # Art. I - Bounded Capability
        # Escenario: Acceso a credenciales
        Policy(
            id="pol-deny-credential-access",
            name="Deny Credential Access",
            description="Bloquea acceso a credenciales y secrets — Art. I",
            effect=PolicyEffect.DENY,
            conditions=[
                PolicyCondition(
                    evaluate=lambda req: any(
                        kw in req.action.target.lower()
                        for kw in ["vault", "secret", "credential", "password", "api_key", "token"]
                    ),
                    description="Bloquea acceso a credenciales"
                )
            ],
            priority=10,
        ),
        # Art. III - Deterministic Enforcement
        # Escenario: Modificacion masiva de datos
        Policy(
            id="pol-require-confirmation-bulk-update",
            name="Require Confirmation for Bulk Updates",
            description="Requiere confirmacion para updates masivos — Art. III",
            effect=PolicyEffect.REQUIRE_CONFIRMATION,
            conditions=[
                PolicyCondition(
                    evaluate=lambda req: "UPDATE" in req.action.target.upper()
                    and ("SET" in req.action.target.upper()),
                    description="Updates masivos requieren confirmacion"
                )
            ],
            priority=5,
        ),
    ]
