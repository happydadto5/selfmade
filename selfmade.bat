@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

REM ── Configuration ──────────────────────────────────────────────
set MODEL=gpt-4.1
set PAUSE_SEC=300

echo ============================================================
echo   SELFMADE — Self-Evolving Game Engine
echo   Model: %MODEL%  Pause: %PAUSE_SEC%s between iterations
echo   Live at: https://happydadto5.github.io/selfmade/
echo   Press any key during pause to skip wait.
echo ============================================================
echo.

:LOOP
echo.
echo --- iteration start: %date% %time% ---

REM ── Read current version ───────────────────────────────────────
set /p CURVER=<VERSION

REM ── Tag last-known-good state ──────────────────────────────────
git tag -f last-good >nul 2>&1

REM ── Invoke the LLM to make one improvement ─────────────────────
echo [1/5] Asking %MODEL% to make an improvement...
set PROMPT_FILE=%~dp0scripts\prompt.txt
set /p PROMPT_TEXT=<nul
for /f "usebackq delims=" %%L in ("%PROMPT_FILE%") do set "PROMPT_TEXT=!PROMPT_TEXT! %%L"

gh copilot -p "Read scripts/prompt.txt for your instructions, then make exactly one improvement to this game." --model %MODEL% --yolo --no-ask-user -s 2>&1
if errorlevel 1 (
    echo [!] LLM invocation failed. Reverting and skipping this iteration.
    git checkout . >nul 2>&1
    goto PAUSE
)

REM ── Validate ───────────────────────────────────────────────────
echo [2/5] Validating...
node scripts\validate.js
if errorlevel 1 (
    echo [!] Validation failed. Reverting changes.
    git checkout . >nul 2>&1
    goto PAUSE
)

REM ── Bump patch version ─────────────────────────────────────────
echo [3/5] Bumping version...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$p = Join-Path '%~dp0' 'VERSION';" ^
  "$v = (Get-Content $p).Trim();" ^
  "$parts = $v.Split('.');" ^
  "$parts[2] = ([int]$parts[2] + 1).ToString();" ^
  "$new = $parts -join '.';" ^
  "Set-Content -Path $p -Value $new;" ^
  "$js = Get-Content 'js/game.js' -Raw;" ^
  "$js = $js -replace \"const version = '[^']*'\", \"const version = '$new'\";" ^
  "Set-Content -Path 'js/game.js' -Value $js -NoNewline;" ^
  "$html = Get-Content 'index.html' -Raw;" ^
  "$html = $html -replace 'v\d+\.\d+\.\d+', \"v$new\";" ^
  "Set-Content -Path 'index.html' -Value $html -NoNewline;" ^
  "Write-Output $new" > "%TEMP%\selfmade_newver.txt"
set /p NEWVER=<"%TEMP%\selfmade_newver.txt"
del "%TEMP%\selfmade_newver.txt" >nul 2>&1

REM ── Commit and push ────────────────────────────────────────────
echo [4/5] Committing v%NEWVER% and pushing...
git add -A
git commit -m "v%NEWVER%: incremental improvement [auto]" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
if errorlevel 1 (
    echo [!] Nothing to commit. Skipping push.
    goto PAUSE
)
git tag "v%NEWVER%" >nul 2>&1
git push origin main --tags
if errorlevel 1 (
    echo [!] Push failed. Check git/gh auth. Will retry next iteration.
)

REM ── Verify Pages deployment ────────────────────────────────────
echo [5/5] Published v%NEWVER% to GitHub Pages.
echo       https://happydadto5.github.io/selfmade/

:PAUSE
echo.
echo Pausing %PAUSE_SEC% seconds. Press any key to skip...
timeout /t %PAUSE_SEC%
goto LOOP
