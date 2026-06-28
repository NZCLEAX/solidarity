# OWASP Status

| OWASP | Deja fait | A faire | Priorite |
|---|---|---|---|
| A01 Broken Access Control | Roles en place, route guards, RLS Supabase, restrictions UI/API | Re-tester tous les acces interdits table par table et route par route | Haute |
| A02 Cryptographic Failures | Cookies `HttpOnly`, `SameSite=Lax`, `Secure` en prod, CSRF ajoute | Verifier la rotation des sessions et l usage HTTPS en prod | Haute |
| A03 Injection | Requetes structurees via Supabase, pas de SQL brut cote front | Valider tous les inputs sensibles et les RPC custom | Haute |
| A04 Insecure Design | Separation des roles, logique metier UI + API + DB | Completer les cas limites metier et les scenarios d abus | Moyenne |
| A05 Security Misconfiguration | Headers de base, CSP retiree du dev, CSP gardee pour preview / prod | Verifier la config finale en prod et les domaines autorises | Haute |
| A06 Vulnerable and Outdated Components | Stack identifiee et build verifie | Lancer un audit regulier des dependances | Moyenne |
| A07 Identification and Authentication Failures | Login centralise, MFA admin, sessions cote serveur | Politique mot de passe plus stricte, expiration et revocation plus claires | Haute |
| A08 Software and Data Integrity Failures | Migrations SQL versionnees, structure propre | Controler encore les migrations et les changements sensibles | Moyenne |
| A09 Security Logging and Monitoring Failures | Logs et audit de securite amorces | Completer les logs, alertes et la conservation des logs | Moyenne |
| A10 SSRF | Peu concerne pour le moment | Surveiller les appels externes et les URLs cote serveur | Faible |
