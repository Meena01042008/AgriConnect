# AgriConnect — Java Smart Agriculture Website

AgriConnect is a Spring Boot website for a college project. The backend is Java 17+; the UI uses HTML/CSS/JavaScript; MySQL stores registered farmers and their expenses, revenue, reminders, and inventory after sign-in.

## Honest feature status

| Feature | Current status | What is needed |
|---|---|---|
| Responsive agriculture-themed dashboard | Implemented | Browser to view |
| Java / Spring Boot API | Implemented in source | JDK 17+ and Maven |
| Farmer registration and sign-in | Implemented with BCrypt password hashes and server sessions | MySQL schema must be installed |
| Farmer-only account creation | Implemented; public registration cannot set ADMIN | Create/upgrade admins only using trusted database administration |
| Expense records, revenue, reminders, inventory | MySQL-backed when signed in; browser-only demo records when signed out | MySQL schema and account |
| Crop recommendation | Rule-based preliminary suggestions | Confirm local agronomy and soil-test results; not a scientific prediction model |
| Live weather | Open-Meteo forecast endpoint; no API key expected | Internet connection; results depend on provider availability |
| Live mandi prices | data.gov.in / AGMARKNET endpoint included | A valid `AGRICONNECT_MARKET_API_KEY`; until configured, only clearly-labelled sample prices appear |
| AI question chat | OpenAI-compatible chat API integration included | Valid `AGRICONNECT_AI_API_KEY`; API use may cost money |
| Leaf image analysis | If the configured AI provider supports vision, the uploaded image is analyzed for preliminary visible symptoms and possible causes | Requires the AI API key and a vision-capable model; image is sent to the external provider. This is not a validated plant disease classifier. A local ONNX/DJL model is still not installed; test with real farm photos and confirm with an agriculture expert |
| Full Tamil/Telugu/Malayalam/Kannada/Hindi translation | Not complete | Translation resources and review by fluent speakers are still required |
| Real equipment bookings | Draft request only; does not contact a provider | Provider agreement and booking integration |
| PDF reports | Not implemented yet | Add a PDF generation module if required by the project rubric |

## Requirements

- JDK 17 or newer
- Maven 3.9+
- MySQL 8+ and MySQL Workbench (recommended for a beginner)
- Internet access for live weather, AI chat, and live market data

## Step 1 — Create the database

1. Start MySQL Server.
2. Open MySQL Workbench and connect to your local server.
3. Open `database/schema.sql` and execute the script.
4. Check that the `agriconnect` schema and tables are visible.
5. Set your MySQL username/password in environment variables before starting the app. Never paste database passwords into screenshots or commit them to Git.

PowerShell example (replace the values with your own local credentials):

```powershell
$env:AGRICONNECT_DB_URL="jdbc:mysql://localhost:3306/agriconnect?useSSL=false&serverTimezone=UTC"
$env:AGRICONNECT_DB_USER="root"
$env:AGRICONNECT_DB_PASSWORD="YOUR_LOCAL_MYSQL_PASSWORD"
```

## Step 2 — Start the Java website

Open a terminal in the folder containing `pom.xml`:

```powershell
mvn spring-boot:run
```

Then open `http://localhost:8080` in your browser. Do not open `index.html` directly from File Explorer; API calls require the Spring Boot server.

If Maven is not installed, install a JDK 17+ and Maven 3.9+, reopen the terminal, and check `java -version` and `mvn -version`.

## Step 3 — Create and use a farmer account

1. Open Preferences in the website.
2. Choose **Create farmer account**.
3. Enter your name, email, and a password of 10–72 characters.
4. Sign in. Expenses, revenue, calendar reminders, and inventory created while signed in are stored in MySQL for that account.
5. Sign out to return to the browser-only demo mode.

A user cannot register as ADMIN through the public form. For a college demonstration, create a farmer account normally and only change its role through trusted local database administration if an admin demo is needed.

## Step 4 — Configure AI chat (optional)

Obtain an API key from your chosen compatible provider. Keep it on the server, never in `app.js` or any public HTML file.

```powershell
$env:AGRICONNECT_AI_API_KEY="YOUR_API_KEY"
$env:AGRICONNECT_AI_BASE_URL="https://api.openai.com/v1"
$env:AGRICONNECT_AI_MODEL="gpt-4o-mini"
mvn spring-boot:run
```

The application currently sends each question as a standalone request; persistent multi-turn AI conversation history is not implemented. Provider usage may incur charges. Never put the key in your report, screenshots, GitHub repository, or share it in chat.

## Step 5 — Configure live mandi prices (optional)

1. Register for a suitable API key at data.gov.in and confirm that the AGMARKNET resource is accessible to your account.
2. Stop the app, then set the key in the terminal:

```powershell
$env:AGRICONNECT_MARKET_API_KEY="YOUR_DATA_GOV_IN_API_KEY"
mvn spring-boot:run
```

3. Open **Market & weather** and try a state, commodity, and district filter. The endpoint returns records from the configured provider; it may return no rows if the source has no matching records or its schema/access changes.
4. Always check the market, grade, arrival date, and unit before using a price. API data can be delayed or incomplete.

## Step 6 — Weather

Open **Market & weather**, enter a city or district, and choose **Get live weather**. The app geocodes the location and requests a forecast from Open-Meteo. Internet/provider availability is required. It is a forecast, not a guarantee; check official local alerts before farm work.

## Step 7 — Leaf disease model (must be done before claiming AI diagnosis)

The scanner can request cautious preliminary visual analysis from a configured vision-capable AI provider. The image is sent to that provider; the result is not a validated diagnosis. To complete a true local/model-based disease classifier:

1. Choose a legally usable pretrained model trained on the relevant crops and diseases, and obtain its licence, class-label list, preprocessing specification, and model file.
2. Check whether the model is appropriate for actual field photos; PlantVillage-style clean-background data alone is not enough to establish field accuracy.
3. Integrate model inference into Java using ONNX Runtime or DJL. The resize dimensions, RGB channel order, normalization, and output class mapping must match the model training pipeline exactly.
4. Add a confidence/unknown threshold and display an uncertainty warning. Never give pesticide dosing as an unverified automatic recommendation.
5. Test with held-out images from real farms and report measured results in the project review. Until these steps are done, call the module **Leaf Image Preview / Disease Model Integration** rather than a working disease detector.

## Step 8 — Check the integration status

Open Preferences. The status panel checks the backend, MySQL, AI key, market key, weather integration, and the currently unconfigured disease model. `GET /api/status` provides the same general readiness summary.

## Useful API endpoints

- `GET /api/status`
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET/POST /api/expenses`, `DELETE /api/expenses/{id}`
- `GET/POST /api/activities`, `DELETE /api/activities/{id}`
- `GET/POST /api/inventory`, `DELETE /api/inventory/{id}`
- `GET/PUT /api/finance/revenue`
- `POST /api/recommend`
- `POST /api/chat`
- `GET /api/weather?city=Chennai`
- `GET /api/market/live?state=Tamil%20Nadu&commodity=Tomato`

## Security and academic honesty

This is a college-project build, not a public production service. Before public deployment, add CSRF protections appropriate to session authentication, rate limiting, audit logging, backup/recovery, secure HTTPS cookie settings, comprehensive tests, privacy notices, and operational monitoring. Never commit secrets. Clearly label sample data. Do not claim the leaf model, all-language translation, PDF export, or actual equipment booking is complete until those features are implemented and tested.
