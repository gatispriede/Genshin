@echo off
REM Serve this project at http://localhost:8800 so the HTML pages load their
REM images and ES modules properly. Opening the .html files straight from disk
REM works for images but blocks module imports, so use this when a page uses
REM app/annotate.js.
REM
REM Press Ctrl+C to stop.

cd /d "%~dp0\.."
echo.
echo   Genshin project  ->  http://localhost:8800
echo.
start "" "http://localhost:8800"
python -I "%~dp0serve.py" 8800
