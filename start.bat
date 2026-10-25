@echo off
title Server UMKM Paseban Kawis
color 0A
echo.
echo  ============================================
echo   UMKM Desa Paseban Kawis - API Server
echo  ============================================
echo.
echo  Menjalankan server...
echo  Buka browser ke: http://localhost:3000
echo.
echo  Tekan Ctrl+C untuk menghentikan server.
echo  ============================================
echo.
cd /d "%~dp0"
node server.js
pause
