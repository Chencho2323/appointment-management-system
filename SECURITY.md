# Seguridad

## Cómo reportar una vulnerabilidad

Si encuentras una vulnerabilidad, repórtala de forma privada usando
[GitHub Security Advisories](https://github.com/Chencho2323/appointment-management-system/security/advisories/new)
( pestaña **Security** → **Report a vulnerability**).

No abras un issue público, no envíes un pull request con la falla y no lo
menciones en una discusión. Un issue público expone el problema antes de que
exista una corrección.

## Qué incluir

- Descripción de la vulnerabilidad y su impacto.
- Pasos para reproducirla.
- Versión o commit donde se observa.
- PoC o logs, siempre sin datos reales de clientes.

Nunca incluyas credenciales, tokens, datos personales ni información financiera en
el reporte. Usa datos ficticios.

## Qué esperar

- Confirmación de recepción dentro de **48 horas hábiles**.
- Evaluación inicial de severidad y decisión sobre la corrección.
- Aviso cuando se publique la corrección, y crédito público en el release si lo
  solicitas.

## Alcance

Este proyecto es un ejemplo funcional de gestión de citas. Todo el código se
publica bajo licencia MIT, pero el uso en producción es responsabilidad de quien
lo despliega: configuración de secretos, CORS, cookie de sesión, rate limiting y
cifrado en tránsito siguen siendo decisiones del despliegue.
