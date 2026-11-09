@echo off
setlocal
cd /d "%~dp0"
rem Delegate runtime discovery and dependency checks to the shared PowerShell launcher.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\windows\START-LAN.ps1"
pause
