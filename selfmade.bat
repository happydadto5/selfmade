@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

REM ── Configuration ──────────────────────────────────────────────
set MODEL=gpt-5-mini
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
echo [0/6] Checking model availability...
node scripts/check_model.js "%MODEL%"
if errorlevel 1 (
    echo [!] Model %MODEL% is not verified free. Pausing automatic improvements. Please verify the model or change MODEL in selfmade.bat.
    goto PAUSE
)

echo [1/7] Checking image quota...
node scripts/check_image_quota.js check 4 > "%TEMP%\selfmade_imgstatus.txt" 2>&1
set IMAGE_STATUS=IMAGES_UNKNOWN
if exist "%TEMP%\selfmade_imgstatus.txt" for /f "usebackq delims=" %%A in ("%TEMP%\selfmade_imgstatus.txt") do set "IMAGE_STATUS=%%A"
del "%TEMP%\selfmade_imgstatus.txt" >nul 2>&1

echo [2/7] Preparing suggestions...
if exist "%~dp0suggestion.txt" (
    echo [*] suggestion.txt found. It will be read by the LLM and is ignored by git.
    git rm --cached suggestion.txt >nul 2>&1
) else (
    echo [*] No suggestions found.
)

echo [3/7] Asking %MODEL% to make an improvement...
set PROMPT_EXTRA=ImageStatus:%IMAGE_STATUS%
gh copilot -- -p "Read scripts/prompt.txt and suggestion.txt for your instructions and suggestions. %PROMPT_EXTRA% Make exactly one small incremental improvement. If you implement a suggestion from suggestion.txt, remove that suggestion line from suggestion.txt (do not add suggestion.txt to git). Update CHANGELOG.md with a short entry. Do not add external network calls or dependencies. If ImageStatus indicates images are NOT allowed, do not add or modify any image-generation code or references to secrets." --model %MODEL% --yolo --no-ask-user -s 2>&1
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
