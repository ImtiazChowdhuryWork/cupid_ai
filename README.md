# Cupid AI

AI-powered flirting assistant. Paste a conversation, get 5 tailored response suggestions across different modes (witty, sincere, confident, thoughtful, casual).

---

## Repository Structure

```
cupid_ai/                  ← root (this repo)
├── mobile/                ← Flutter app (Stage 0 — complete)
├── ai_service/            ← Python + FastAPI AI microservice (Stage 1)
├── backend/               ← Golang REST API (Stage 2)
└── README.md              ← project-wide documentation (this file)
```

Each folder is a self-contained project with its own dependencies, `.gitignore`, and README.

---

## System Architecture

Cupid AI uses a **3-layer backend architecture** — Flutter talks only to the Golang backend, which talks to a dedicated AI microservice, which calls Claude. The Flutter app and Golang backend never touch the Claude API key directly.

```
┌─────────────────────────────────────────────────────────────┐
│                        Flutter App                          │
│          (auth, UI, response display, offline cache)        │
└─────────────────────┬───────────────────────────────────────┘
                      │  REST (JWT)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Golang Backend                           │
│   auth · users · subscriptions · rate limiting · history   │
│                  PostgreSQL  ·  Redis                       │
└─────────────────────┬───────────────────────────────────────┘
                      │  internal REST
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  AI Microservice                            │
│   prompt engineering · response validation · retry logic   │
│         consistent JSON schema enforcement                  │
└─────────────────────┬───────────────────────────────────────┘
                      │  Claude API (API key lives here only)
                      ▼
                  Anthropic Claude

```

**Why this separation matters:**

- **Consistency** — Raw Claude responses are non-deterministic. The AI microservice locks them into a fixed schema (always 5 suggestions, always one per mode, always valid JSON) through prompt engineering and output validation.
- **Security** — The Claude API key never leaves the AI service. Flutter has no idea it exists.
- **Cost control** — The Golang backend enforces rate limits (3/day on free tier) before the request even reaches the AI service.
- **Replaceability** — The AI model can be swapped (Claude → GPT-4 → Gemini) without touching the Flutter app or Golang backend. Only the AI service changes.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | Flutter 3.x |
| State management | flutter_bloc |
| Navigation | go_router |
| Dependency injection | get_it |
| Networking | dio |
| Local storage | shared_preferences |
| Responsive sizing | flutter_screenutil (`designSize: 440×956`) |
| Fonts | Poppins (bundled in `assets/fonts/`) |
| Asset generation | flutter_gen |
| Golang backend | Gin, JWT, PostgreSQL — running on port 8080 |
| AI microservice | Python + FastAPI — running on port 8001 |
| Database | PostgreSQL 17 |
| Cache | Redis — planned |
| AI model | Claude API (Anthropic) — key pending |

---

## Project Structure

```
lib/
├── main.dart                    # ScreenUtilInit + BlocProvider<AuthBloc> + MaterialApp.router
├── splash_screen.dart           # Branded launch screen — checks auth, navigates imperatively
│
├── gen/                         # Type-safe generated classes (flutter_gen)
│   ├── assets.gen.dart          # Assets.icons.x, Assets.images.x, Assets.animations.x
│   ├── colors.gen.dart          # AppColors.primary, AppColors.textPrimary, etc.
│   └── fonts.gen.dart           # FontFamily.poppins
│
├── core/
│   ├── constants/
│   │   └── app_constants.dart   # API base URL, storage keys, tier names, free limits
│   ├── di/
│   │   └── service_locator.dart # GetIt wiring for all features
│   ├── errors/
│   │   └── app_error.dart       # Sealed error hierarchy (Network, Auth, AI, Quota…)
│   ├── network/
│   │   ├── api_client.dart      # Dio factory + error mapper
│   │   └── auth_interceptor.dart# JWT Bearer header injection
│   ├── router/
│   │   └── app_router.dart      # GoRouter: /splash → /login or / (with auth guard)
│   ├── theme/
│   │   ├── app_theme.dart       # MaterialTheme + color/gradient aliases
│   │   └── app_text_styles.dart # All TextStyles with .sp sizing
│   ├── utils/
│   │   ├── extensions.dart      # Context, String, double extensions
│   │   ├── ui_helper.dart       # Pre-built spacing widgets (UIHelper.vMD, hLG…)
│   │   └── validators.dart      # Form validators (email, password, conversation…)
│   └── widgets/                 # Reusable widget library
│       ├── index.dart           # Barrel export for all widgets
│       ├── buttons/             # AppButton, AppSecondaryButton, AppIconButton, AppTextButton
│       ├── text_fields/         # AppTextField, AppEmailField, AppPasswordField
│       ├── cards/               # AppCard, ResponseCard, StatCard
│       ├── loaders/             # AppLoader, PageLoader, AppSkeletonLoader, ResponseCardSkeleton
│       ├── snackbars/           # AppSnackBar (success / error / warning / info)
│       ├── app_bar/             # CustomAppBar
│       ├── dialogs/             # AppConfirmationDialog
│       └── bottom_sheets/       # AppBottomSheet
│
└── features/
    ├── auth/
    │   ├── domain/              # User entity, AuthRepository interface, Login/Register usecases
    │   ├── data/                # UserModel, AuthRemoteDataSource, AuthRepositoryImpl
    │   └── presentation/        # AuthBloc (events/states), LoginPage, SignupPage
    │
    ├── analysis/
    │   ├── domain/              # ResponseSuggestion + AnalysisResult entities, repository, usecases
    │   ├── data/                # Models, AnalysisRemoteDataSource, AnalysisRepositoryImpl
    │   └── presentation/        # AnalysisBloc, AnalysisPage (input + results), HistoryPage
    │
    ├── home/
    │   └── presentation/        # HomePage (PageView + animated nav), DashboardPage
    │
    └── profile/
        ├── domain/              # UserProfile entity (streak, usage, tier), repository, usecases
        ├── data/                # UserProfileModel, ProfileRemoteDataSource, ProfileRepositoryImpl
        └── presentation/        # ProfileBloc, ProfilePage (usage bar, stats, edit name, logout)
```

---

## Architecture

Clean Architecture per feature: **Domain → Data → Presentation**

```
Presentation (BLoC + Pages + Widgets)
       ↓  calls
Domain (UseCases + Repository interfaces + Entities)
       ↓  implemented by
Data (Repository impls + DataSources + Models)
       ↓  calls
Network (Dio) / Storage (SharedPreferences)
```

**State management:** Every feature has its own `Bloc` with sealed `Event` and `State` classes.  
**DI:** All blocs, usecases, repositories, and datasources are registered in `service_locator.dart` via `GetIt`.  
**Navigation:** `GoRouter` with a `/splash` initial route and an auth-guard redirect on all other routes.

---

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| `AppColors.primary` | `#E8426F` | Buttons, accents, selected nav |
| `AppColors.primaryLight` | `#FF6B9D` | Gradient end |
| `AppColors.primaryDark` | `#C2185B` | Gradient start |
| `AppColors.secondary` | `#FFB3C6` | Borders, chips |
| `AppColors.background` | `#FFF5F7` | Scaffold background |
| `AppColors.surface` | `#FFFFFF` | Cards |
| `AppColors.textPrimary` | `#1A1A2E` | Body text |
| `AppColors.textSecondary` | `#6B7280` | Captions, hints |

Defined in `assets/colors/colors.xml` — re-generate `lib/gen/colors.gen.dart` with:
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

---

## Response Modes

Each analysis returns 5 suggestions, one per mode:

| Mode | Color | Tone |
|---|---|---|
| Witty | Blue | Playful, clever |
| Sincere | Rose | Warm, genuine |
| Confident | Amber | Bold, assertive |
| Thoughtful | Purple | Deep, considerate |
| Casual | Green | Relaxed, friendly |

---

## Subscription Tiers

| Tier | Daily analyses | Price |
|---|---|---|
| Free | 3 | — |
| Basic | unlimited | TBD |
| Monthly | unlimited | TBD |
| Premium | unlimited + priority | TBD |

---

## Running the App

### Prerequisites

- Flutter SDK ≥ 3.10
- Android device or emulator (API 21+)
- Poppins fonts present in `assets/fonts/` (see below)

### Font setup (first time only)

The Poppins font files are not committed to git. Download them once:

```bash
cd assets/fonts

# macOS / Linux
curl -L "https://fonts.gstatic.com/s/poppins/v24/pxiEyp8kv8JHgFVrFJA.ttf" -o Poppins-Regular.ttf
curl -L "https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLGT9V1s.ttf" -o Poppins-Medium.ttf
curl -L "https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLEj6V1s.ttf" -o Poppins-SemiBold.ttf
curl -L "https://fonts.gstatic.com/s/poppins/v24/pxiByp8kv8JHgFVrLCz7V1s.ttf" -o Poppins-Bold.ttf
```

### Run

```bash
flutter pub get
flutter run                        # default device
flutter run -d chrome              # web (no backend needed)
flutter run -d <device-id>         # specific device
```

### Dev login bypass

On the Login screen in debug builds, tap **"DEV — Skip Login"** to skip the real API and jump straight to the home screen. This button is stripped from release builds automatically. Remove it in Stage 3 when the real backend is connected.

### Android NDK error

If you see `NDK did not have a source.properties file`:

```bash
# Delete the corrupted NDK download, Gradle will re-fetch it
rmdir /s /q "C:\Users\<you>\AppData\Local\Android\sdk\ndk\28.2.13676358"
flutter run
```

---

## Adding a New Feature

Follow this pattern (same as existing features):

```
lib/features/<name>/
├── domain/
│   ├── entities/          # Plain Dart classes, extends Equatable
│   ├── repositories/      # Abstract interface (no implementation)
│   └── usecases/          # One class per operation, calls repository
├── data/
│   ├── models/            # Entity subclasses + fromJson()
│   ├── datasources/       # Abstract interface + Dio implementation
│   └── repositories/      # Implements domain interface, delegates to datasource
└── presentation/
    ├── bloc/              # *Event, *State (sealed), *Bloc
    ├── pages/             # Full screens
    └── widgets/           # Screen-specific widgets
```

Then register in `core/di/service_locator.dart`:

```dart
void _registerMyFeature() {
  sl.registerLazySingleton<MyRemoteDataSource>(() => MyRemoteDataSourceImpl(sl<Dio>()));
  sl.registerLazySingleton<MyRepository>(() => MyRepositoryImpl(sl<MyRemoteDataSource>()));
  sl.registerLazySingleton(() => MyUseCase(sl<MyRepository>()));
  sl.registerFactory(() => MyBloc(useCase: sl<MyUseCase>()));
}
```

---

## Key Conventions

- **No `const` on `Text` widgets** that use `AppTheme` or `AppTextStyles` — sizes use `.sp` (runtime-computed via screenutil).
- **Spacing** — use `UIHelper.vMD` / `UIHelper.hSM` etc., not raw `SizedBox`. Custom sizes: `UIHelper.verticalSpace(x)`.
- **Colors** — always via `AppColors.x`, never raw hex in widget code.
- **Assets** — reference via `Assets.icons.x` / `Assets.images.x` (type-safe), never raw strings.
- **Snackbars** — `AppSnackBar.success(context, msg)` / `.error()` / `.info()`.
- **Dialogs** — `AppConfirmationDialog.show(context, title: ..., message: ...)`.
- **Bottom sheets** — `AppBottomSheet.show(context, child: ...)`.

---

## Development Stages

The full build is planned across 4 stages. Flutter (Stage 0) is complete. Everything below is the remaining roadmap.

---

### Stage 0 — Flutter App ✅ Complete

- Clean architecture scaffold (domain → data → presentation)
- Auth feature — Login, Signup, AuthBloc
- Analysis feature — conversation input, ResponseCard display, HistoryPage
- Home shell — PageView + animated custom bottom nav (4 tabs)
- Profile feature — usage bar, streaks, subscription tier badge
- Core widget library — 15+ reusable widgets
- Responsive sizing via flutter_screenutil, Poppins bundled locally
- DEV bypass button for development without a backend

---

### Stage 1 — AI Microservice ✅ Complete

Python + FastAPI service running on `http://localhost:8001`.

- [x] Project setup — FastAPI, virtual environment (Python 3.12)
- [x] System prompt engineering — enforces exactly 5 suggestions, one per mode, fixed JSON schema
- [x] `/analyze` endpoint — accepts conversation text, returns structured suggestions
- [x] `/health` endpoint — confirms service is alive
- [x] Response validation — retry logic for malformed Claude output
- [ ] Claude API key — pending (will be set via admin dashboard)

**Run:**
```bash
cd ai_service
venv\Scripts\activate
uvicorn app.main:app --reload --port 8001
```

**Output contract:**
```json
{
  "suggestions": [
    { "mode": "witty",      "text": "...", "confidence": 0.91 },
    { "mode": "sincere",    "text": "...", "confidence": 0.88 },
    { "mode": "confident",  "text": "...", "confidence": 0.85 },
    { "mode": "thoughtful", "text": "...", "confidence": 0.87 },
    { "mode": "casual",     "text": "...", "confidence": 0.90 }
  ],
  "sentiment": "positive"
}
```

---

### Stage 2 — Golang Backend ✅ Complete

REST API running on `http://localhost:8080`. All endpoints tested and working.

- [x] Project setup — Gin framework, environment config
- [x] PostgreSQL 17 — connected, migrations run automatically on startup
- [x] Auth — register, login, JWT access token (15 min) + refresh token
- [x] Profile endpoint — returns user stats (streak, usage, tier)
- [x] Analysis endpoint — rate limit check → calls AI service → saves to DB
- [x] History endpoint — paginated list of past analyses
- [x] Rate limiting — free tier enforced at 3 analyses/day

**Run:**
```bash
cd backend
go run ./cmd/api
```

**Tested endpoints:**
| Method | Endpoint | Status |
|--------|----------|--------|
| GET | `/health` | ✅ |
| POST | `/api/v1/auth/register` | ✅ |
| POST | `/api/v1/auth/login` | ✅ |
| GET | `/api/v1/profile` | ✅ |
| POST | `/api/v1/analysis` | ✅ (needs AI key) |
| GET | `/api/v1/analysis/history` | ✅ |

**PostgreSQL setup (first time):**

Password: `cupidai2026` (set during setup)

Service must be running — start via Admin PowerShell:
```
net start postgresql-17
```

---

### Stage 3 — Flutter Integration ⬅ Next

Connect the Flutter app to the real backend and validate the full user journey.

**Goal:** The app works end-to-end with real data. DEV bypass removed.

- [ ] Point Flutter to real backend URL (`AppConstants.baseUrl = http://10.0.2.2:8080` for Android emulator)
- [ ] Wire up real login/signup — remove `dev_fake_token` bypass
- [ ] Test full flow — login → analyze → view results → check history → profile stats
- [ ] Handle real error states — expired tokens, quota exceeded, server errors
- [ ] Refresh token logic — silent re-auth when access token expires

---

### Stage 4 — Product & Launch

- [ ] Claude API key — get from console.anthropic.com, set in `ai_service/.env`
- [ ] Subscription / payment integration
- [ ] Admin dashboard — manage API key, monitor usage
- [ ] Onboarding flow for first-time users
- [ ] App icon + splash image assets
- [ ] Screenshot-to-text (ML Kit OCR — paste without typing)
- [ ] Push notifications (streak reminders)
- [ ] Deploy AI service + Golang backend to cloud (Docker)
- [ ] Publish to Google Play Store
