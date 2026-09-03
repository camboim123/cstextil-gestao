@echo off
title CS-Tingimentos - Servidor
color 0A
echo.
echo  ================================================
echo   CS-TINGIMENTOS - Iniciando servidor local...
echo  ================================================
echo.

:: Verifica se Node.js esta instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo  ERRO: Node.js nao encontrado!
    echo.
    echo  Por favor, instale o Node.js em:
    echo  https://nodejs.org  (baixe a versao LTS)
    echo.
    echo  Apos instalar, execute este arquivo novamente.
    echo.
    pause
    exit /b 1
)

echo  Node.js encontrado! Iniciando...
echo.
cd /d "%~dp0"
node server.js
pause
