/** HTML-escape a string to prevent XSS. */
function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const STYLE = `
  *,*::before,*::after{box-sizing:border-box}
  body{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;background:#f1f5f9;margin:0;padding:2rem 1rem;color:#0f172a}
  .container{max-width:440px;margin:0 auto;background:#ffffff;padding:2rem;border-radius:12px;box-shadow:0 10px 25px -5px rgba(15,23,42,0.1),0 8px 10px -6px rgba(15,23,42,0.1);border:1px solid #e2e8f0}
  h1{margin:0 0 1rem;font-size:1.35rem;font-weight:700;color:#0f172a;letter-spacing:-0.02em}
  .instance-badge{background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);border-left:4px solid #38bdf8;padding:12px 14px;border-radius:8px;margin-bottom:1.25rem;color:#f8fafc;box-shadow:0 2px 4px rgba(0,0,0,0.1)}
  .instance-title{font-weight:700;color:#38bdf8;font-size:.85rem;text-transform:uppercase;letter-spacing:.05em;display:flex;align-items:center;gap:6px}
  .instance-url{font-size:.8rem;color:#cbd5e1;word-break:break-all;margin-top:4px}
  .user-hint{font-size:.8rem;color:#34d399;font-weight:600;margin-top:6px;padding-top:6px;border-top:1px solid #334155}
  label{display:block;margin-bottom:.35rem;font-size:.85rem;font-weight:600;color:#334155}
  input{display:block;width:100%;padding:.6rem .8rem;margin-bottom:1rem;border:1px solid #cbd5e1;border-radius:6px;font-size:.95rem;background:#f8fafc;transition:border-color .15s,box-shadow .15s}
  input:focus{outline:none;border-color:#0284c7;background:#ffffff;box-shadow:0 0 0 3px rgba(2,132,199,0.15)}
  button{width:100%;padding:.7rem;background:#0284c7;color:#ffffff;border:none;border-radius:6px;font-size:1rem;font-weight:600;cursor:pointer;transition:background-color .15s}
  button:hover{background:#0369a1}
  .error{color:#b91c1c;background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:.6rem .8rem;margin-bottom:1rem;font-size:.85rem}
  p.hint{font-size:.8rem;color:#64748b;margin-top:1.25rem;line-height:1.45;border-top:1px solid #f1f5f9;padding-top:1rem}
`.trim();

export function renderConsentPage(params: {
  client_name?: string;
  error?: string;
  email?: string;
  formAction: string;
  /** CSRF token to embed as hidden form field; validated against the cookie on POST. */
  csrf_token?: string;
  instanceName?: string;
  odooUrl?: string;
  targetUserEmail?: string;
}): string {
  const { client_name, error, email, formAction, csrf_token } = params;

  const instanceName = params.instanceName || process.env.ODOO_INSTANCE_NAME || process.env.INSTANCE_NAME || '';
  const odooUrl = params.odooUrl || process.env.ODOO_URL || '';
  const targetUserEmail = params.targetUserEmail || process.env.TARGET_USER_EMAIL || process.env.AUTHORIZED_EMAIL || '';

  const title =
    client_name != null && client_name !== ''
      ? `Authorize ${escapeHtml(client_name)}`
      : 'Authorize MCP Client';

  const errorHtml =
    error != null ? `<p class="error" role="alert">${escapeHtml(error)}</p>\n  ` : '';

  const prefilledEmail = email || targetUserEmail || '';

  const instanceBadgeHtml = (instanceName || odooUrl || targetUserEmail)
    ? `<div class="instance-badge">
        ${instanceName ? `<div class="instance-title">🏢 Instancia: ${escapeHtml(instanceName)}</div>` : ''}
        ${odooUrl ? `<div class="instance-url">🔗 Target ERP: ${escapeHtml(odooUrl)}</div>` : ''}
        ${targetUserEmail ? `<div class="user-hint">👤 Usuario Requerido: ${escapeHtml(targetUserEmail)}</div>` : ''}
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  <style>${STYLE}</style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    ${instanceBadgeHtml}
    ${errorHtml}<form method="POST" action="${escapeHtml(formAction)}">
      ${csrf_token != null ? `<input type="hidden" name="csrf_token" value="${escapeHtml(csrf_token)}">` : ''}
      <label for="email">Odoo Email</label>
      <input type="email" id="email" name="email" required value="${escapeHtml(prefilledEmail)}" placeholder="${escapeHtml(targetUserEmail || 'ej. usuario@dominio.cl')}" autofocus>
      <label for="api_key">API Key</label>
      <input type="password" id="api_key" name="api_key" required placeholder="Pega tu API Key de esta instancia">
      <button type="submit">Authorize</button>
    </form>
    <p class="hint">
      ${instanceName ? `Ingresa tus credenciales Odoo de <b>${escapeHtml(instanceName)}</b> (${escapeHtml(odooUrl || 'ERP')}) para autorizar el acceso MCP.` : 'Enter your Odoo email and API key to grant this client access via your identity.'}
    </p>
  </div>
</body>
</html>`;
}

export function renderErrorPage(params: { title: string; message: string }): string {
  const { title, message } = params;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>${STYLE}</style>
</head>
<body>
  <div class="container">
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
  </div>
</body>
</html>`;
}
