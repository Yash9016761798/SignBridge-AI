@echo off
REM ============================================================
REM SignBridge AI - Startup Script (Windows)
REM ============================================================
REM Usage: scripts\start.bat [--demo] [--build] [--detach]
REM ============================================================

setlocal enabledelayedexpansion

REM Colors (Windows 10+)
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "CYAN=[96m"
set "NC=[0m"
set "BOLD=[1m"

REM Defaults
set "DEMO_MODE=false"
set "BUILD=false"
set "DETACH=false"

REM Parse arguments
:parse_args
if "%~1"=="" goto :done_args
if "%~1"=="--demo" (
    set "DEMO_MODE=true"
    shift
    goto :parse_args
)
if "%~1"=="--build" (
    set "BUILD=true"
    shift
    goto :parse_args
)
if "%~1"=="--detach" (
    set "DETACH=true"
    shift
    goto :parse_args
)
if "%~1"=="-d" (
    set "DETACH=true"
    shift
    goto :parse_args
)
if "%~1"=="--help" goto :show_help
if "%~1"=="-h" goto :show_help
shift
goto :parse_args

:show_help
echo Usage: %~nx0 [OPTIONS]
echo.
echo Options:
echo   --demo     Enable demo mode (no webcam needed)
echo   --build    Force rebuild containers
echo   --detach   Run in background (detached mode)
echo   --help     Show this help message
exit /b 0

:done_args

echo.
echo %CYAN%╔═══════════════════════════════════════════════════════════╗%NC%
echo %CYAN%║           SignBridge AI - Deployment Manager             ║%NC%
echo %CYAN%║     Indian Sign Language to English Translation          ║%NC%
echo %CYAN%╚═══════════════════════════════════════════════════════════╝%NC%
echo.

REM ------------------------------------------------------------
REM Step 1: Check Docker
REM ------------------------------------------------------------
echo %BLUE%[1/5]%NC% Checking Docker installation...

docker --version >nul 2>&1
if errorlevel 1 (
    echo %RED%ERROR: Docker is not installed.%NC%
    echo Please install Docker from https://docs.docker.com/get-docker/
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    echo %RED%ERROR: Docker daemon is not running.%NC%
    echo Please start Docker Desktop and try again.
    exit /b 1
)

docker compose version >nul 2>&1
if errorlevel 1 (
    docker-compose --version >nul 2>&1
    if errorlevel 1 (
        echo %RED%ERROR: Docker Compose is not installed.%NC%
        exit /b 1
    )
    set "COMPOSE_CMD=docker-compose"
) else (
    set "COMPOSE_CMD=docker compose"
)

echo %GREEN%✓ Docker is ready%NC%

REM ------------------------------------------------------------
REM Step 2: Check environment
REM ------------------------------------------------------------
echo %BLUE%[2/5]%NC% Checking environment...

if not exist .env (
    echo %YELLOW%⚠ No .env file found. Creating from .env.example...%NC%
    copy .env.example .env >nul
    echo %GREEN%✓ Created .env file%NC%
)

REM Set demo mode in .env
if "%DEMO_MODE%"=="true" (
    echo %YELLOW%✓ Demo mode ENABLED%NC%
    powershell -Command "(Get-Content .env) -replace '^DEMO_MODE=.*', 'DEMO_MODE=true' | Set-Content .env"
)

REM ------------------------------------------------------------
REM Step 3: Create log directories
REM ------------------------------------------------------------
echo %BLUE%[3/5]%NC% Setting up directories...

if not exist logs\ai-service mkdir logs\ai-service
if not exist logs\web mkdir logs\web
if not exist logs\startup mkdir logs\startup

echo %GREEN%✓ Log directories ready%NC%

REM ------------------------------------------------------------
REM Step 4: Build containers
REM ------------------------------------------------------------
echo %BLUE%[4/5]%NC% Building containers...

if "%BUILD%"=="true" (
    %COMPOSE_CMD% build 2>&1 > logs\startup\build.log
) else (
    %COMPOSE_CMD% build 2>&1 > logs\startup\build.log
)

if errorlevel 1 (
    echo %RED%ERROR: Build failed. Check logs\startup\build.log%NC%
    exit /b 1
)

echo %GREEN%✓ Containers built successfully%NC%

REM ------------------------------------------------------------
REM Step 5: Start services
REM ------------------------------------------------------------
echo %BLUE%[5/5]%NC% Starting services...

if "%DETACH%"=="true" (
    %COMPOSE_CMD% up -d 2>&1 > logs\startup\startup.log
    echo.
    echo %BOLD%%GREEN%╔═══════════════════════════════════════════════════════════╗%NC%
    echo %BOLD%%GREEN%║              SignBridge AI is now running!               ║%NC%
    echo %BOLD%%GREEN%╚═══════════════════════════════════════════════════════════╝%NC%
    echo.
    echo %BOLD%Service URLs:%NC%
    echo   %CYAN%Frontend:%NC%      http://localhost:3000
    echo   %CYAN%AI Service:%NC%    http://localhost:8000
    echo   %CYAN%API Docs:%NC%      http://localhost:8000/docs
    echo   %CYAN%Health Check:%NC%  http://localhost:8000/health
    echo.
    if "%DEMO_MODE%"=="true" (
        echo %BOLD%%YELLOW%Demo Mode Active:%NC%
        echo   %CYAN%Demo Signs:%NC%    http://localhost:8000/demo/signs
        echo   %CYAN%Test Predict:%NC%  http://localhost:8000/demo/predict/hello
        echo.
    )
    echo %BOLD%Quick Commands:%NC%
    echo   %YELLOW%View logs:%NC%      %COMPOSE_CMD% logs -f
    echo   %YELLOW%Stop:%NC%           %COMPOSE_CMD% down
    echo   %YELLOW%Restart:%NC%        %COMPOSE_CMD% restart
    echo   %YELLOW%Health check:%NC%   scripts\health_check.bat
) else (
    echo %CYAN%Starting in foreground... (Press Ctrl+C to stop)%NC%
    %COMPOSE_CMD% up 2>&1 > logs\startup\startup.log
)

endlocal
