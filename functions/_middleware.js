// Cloudflare Pages Function: se ejecuta antes de servir cualquier ruta del sitio.
// Solo deja pasar peticiones cuya IP pública esté en ALLOWED_IPS (variable de entorno
// de Pages, separada por comas). El resto recibe un 403.
export async function onRequest({ request, env, next }) {
  const ip = request.headers.get('CF-Connecting-IP');
  const permitidas = (env.ALLOWED_IPS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (permitidas.includes(ip)) return next();

  return new Response(`Solo disponible desde la red autorizada (tu IP: ${ip})`, {
    status: 403,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
