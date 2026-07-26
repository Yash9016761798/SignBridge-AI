@echo off
REM ============================================================
REM SignBridge AI - Health Check Script (Windows)
REM ============================================================
REM Usage: scripts\health_check.bat
REM ============================================================

setlocal enabledelayedexpansion

set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"
set "BOLD=[1m"

set "AI_URL=%SIGNBRIDGE_AI_URL%"
if "%AI_URL%"=="" set "AI_URL=http://localhost:8000"
set "WEB_URL=%SIGNBRIDGE_WEB_URL%"
if "%WEB_URL%"=="" set "WEB_URL=http://localhost:3000"

set PASS=0
set FAIL=0
set WARN=0

echo.
echo %BOLD%%CYAN%SignBridge AI - Health Check%NC%
echo.

REM ------------------------------------------------------------
echo %BLUE%Docker Containers:%NC%

docker ps --format "{{.Names}}" 2>nul | findstr /i "signbridge-ai" >nul
if errorlevel 1 (
    echo   %RED%x%NC% ai-service container is NOT running
    set /a FAIL+=1
) else (
    echo   %GREEN%+%NC% ai-service container is running
    set /a PASS+=1
)

docker ps --format "{{.Names}}" 2>nul | findstr /i "signbridge-web" >nul
if errorlevel 1 (
    echo   %RED%x%NC% web container is NOT running
    set /a FAIL+=1
) else (
    echo   %GREEN%+%NC% web container is running
    set /a PASS+=1
)

echo.

REM ------------------------------------------------------------
echo %BLUE%AI Service Endpoints:%NC%

curl -s -o nul -w "%%{http_code}" --max-time 5 "%AI_URL%/health" 2>nul | findstr "200" >nul
if errorlevel 1 (
    echo   %RED%x%NC% Health endpoint unreachable
    set /a FAIL+=1
) else (
    echo   %GREEN%+%NC% Health endpoint OK
    set /a PASS+=1
)

curl -s -o nul -w "%%{http_code}" --max-time 5 "%AI_URL%/docs" 2>nul | findstr "200" >nul
if errorlevel 1 (
    echo   %RED%x%NC% Swagger docs unreachable
    set /a FAIL+=1
) else (
    echo   %GREEN%+%NC% Swagger docs OK
    set /a PASS+=1
)

curl -s -o nul -w "%%{http_code}" --max-time 5 "%AI_URL%/demo/signs" 2>nul | findstr "200" >nul
if errorlevel 1 (
    echo   %RED%x%NC% Demo signs endpoint unreachable
    set /a FAIL+=1
) else (
    echo   %GREEN%+%NC% Demo signs endpoint OK
    set /a PASS+=1
)

echo.

REM ------------------------------------------------------------
echo %BLUE%Prediction Test:%NC%

for /f "tokens=*" %%i in ('curl -s --max-time 10 -X POST "%AI_URL%/demo/predict/hello" -H "Content-Type: application/json" 2^>nul') do set "RESP=%%i"

echo %RESP% | findstr "text" >nul
if errorlevel 1 (
    echo   %RED%x%NC% Prediction endpoint failed
    set /a FAIL+=1
) else (
    echo   %GREEN%+%NC% Prediction returned successfully
    set /a PASS+=1
)

echo.

REM ------------------------------------------------------------
echo %BLUE%Frontend:%NC%

curl -s -o nul -w "%%{http_code}" --max-time 5 "%WEB_URL%" 2>nul | findstr "200" >nul
if errorlevel 1 (
    echo   %RED%x%NC% Web app unreachable
    set /a FAIL+=1
) else (
    echo   %GREEN%+%NC% Web app OK
    set /a PASS+=1
)

REM ------------------------------------------------------------
echo.
echo %BOLD%═══════════════════════════════════════════════════════════%NC%
echo   %GREEN%Passed: %PASS%%NC%  %RED%Failed: %FAIL%%NC%

if %FAIL%==0 (
    echo   %GREEN%%BOLD%All checks passed!%NC%
    exit /b 0
) else (
    echo   %RED%%BOLD%Some checks failed.%NC%
    exit /b 1
)

endlocal
