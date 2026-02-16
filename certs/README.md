# Database SSL certificate

Put your Supabase (or other provider) CA certificate here so the app can verify the server when using SSL.

1. In Supabase: **Project → Settings → Database → SSL Configuration → Download certificate**
2. Move the downloaded file into this folder and name it **`ca.crt`**  
   (if it has another name like `ca-certificate.crt`, either rename it to `ca.crt` or set `SSL_CA_PATH` in `.env` to its path)
3. The seed and any code that uses the Prisma pg adapter will use this file to trust the database server.

Optional: set `SSL_CA_PATH` in `.env` to a different path (e.g. absolute path to your Downloads file) instead of using `certs/ca.crt`.
