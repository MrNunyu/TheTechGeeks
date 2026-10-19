@echo off
cd /d "%~dp0"
 echo Importing your EXACT assessment text and original pictures from Google Sites...
 powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0BUILD_WEBSITE.ps1"
 echo.
 echo Press any key to close this window.
 pause >nul
