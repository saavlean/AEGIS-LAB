export interface Scenario {
  id: string
  label: string
  action: string
}

export const SCENARIOS: Record<string, Scenario[]> = {
  banking: [
    {
      id: 'mass_delete',
      label: 'Eliminar registros de clientes inactivos (48.000 registros)',
      action: "DELETE FROM customers WHERE last_transaction < '2023-01-01'",
    },
    {
      id: 'export_public',
      label: 'Exportar base de clientes a bucket S3 público',
      action: 'aws s3 cp customers_full.csv s3://public-analytics-bucket/',
    },
    {
      id: 'credit_update',
      label: 'Modificar límite de crédito de todos los clientes premium +50%',
      action: "UPDATE accounts SET credit_limit = credit_limit * 1.5 WHERE tier='premium'",
    },
    {
      id: 'prod_deploy',
      label: 'Deploy directo a producción sin aprobación del pipeline',
      action: 'kubectl apply -f prod-deployment.yaml --force',
    },
  ],
  healthcare: [
    {
      id: 'patient_export',
      label: 'Exportar historiales clínicos completos sin consentimiento',
      action: "SELECT * FROM patient_records INTO OUTFILE '/exports/all_patients.csv'",
    },
    {
      id: 'medication',
      label: 'Modificar dosis de medicación sin validación médica',
      action: "UPDATE prescriptions SET dosage = dosage * 2 WHERE condition='hypertension'",
    },
    {
      id: 'share_research',
      label: 'Compartir datos de pacientes con empresa de investigación externa',
      action: 'POST https://external-research.com/api/upload BODY=patient_data_2024.zip',
    },
  ],
  government: [
    {
      id: 'purge_records',
      label: 'Eliminar registros de solicitudes ciudadanas anteriores a 2023',
      action: "DELETE FROM citizen_requests WHERE created_at < '2023-01-01'",
    },
    {
      id: 'public_db',
      label: 'Publicar base de datos de contribuyentes en portal abierto',
      action: 'cp /internal/taxpayer_db.csv /var/www/html/public/downloads/',
    },
    {
      id: 'permissions',
      label: 'Escalar permisos de toda una dirección sin aprobación jerárquica',
      action: "UPDATE user_roles SET role='admin' WHERE department='direccion_general'",
    },
  ],
  technology: [
    {
      id: 'prod_deploy',
      label: 'Deploy a producción sin pasar por CI/CD pipeline',
      action: 'kubectl apply -f prod-deployment.yaml --namespace=production',
    },
    {
      id: 'api_keys',
      label: 'Leer y exportar todas las API keys de clientes desde el vault',
      action: 'vault kv list secret/customers/api-keys > /tmp/all_api_keys.txt',
    },
    {
      id: 'purge_logs',
      label: 'Eliminar todos los logs de error de los últimos 90 días',
      action: "find /var/log/app -name '*.log' -mtime +90 -delete",
    },
  ],
}

export const INDUSTRIES = [
  { id: 'banking', label: 'Banca y Finanzas' },
  { id: 'healthcare', label: 'Salud' },
  { id: 'government', label: 'Gobierno' },
  { id: 'technology', label: 'Tecnología' },
]
