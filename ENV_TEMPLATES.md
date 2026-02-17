# ENV TEMPLATES

## Configuring ENV variables & constants:

Create a .env file in the root directory of the project. <br>

Add & configure every necessary ENV variable. <br>

For the root directory .env file you're gonna need:
- ACCESS_TOKEN_SECRET=123
- REFRESH_TOKEN_SECRET=123
- ADMIN_USERNAME=admin
- ADMIN_PASSWORD="123"
- DATABASE_URI=mongodb://admin:password@obrok_db:27017
- MONGO_INITDB_ROOT_USERNAME=admin
- MONGO_INITDB_ROOT_PASSWORD=password
- MONGO_INITDB_DATABASE=obrok
- CLIENT_ORIGIN=http://localhost:80
- PORT=5000

If you want to configure SLL for HTTPS you're gonna need:
- CERTBOT_EMAIL="your-email@example.com"

For the client app you're not gonna need a .env file, just create/edit the consts.js file in apps/client/src/api/ and add these values:
- BASE_URL = "http://localhost:5000";
- BASE_API_URL = "http://localhost:5000/api";
- OSRM_URL = "http://localhost:5001/route/v1";
- RELEASE_VERSION = "Release: Example Date";
