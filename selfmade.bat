@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
set DEST_DIR=G:\My Drive\selfmade
set PAUSE_SEC=300
:LOOP
echo --- selfmade loop start: %date% %time%
REM bump patch version using PowerShell
powershell -NoProfile -ExecutionPolicy Bypass -Command "
  $p = Join-Path '%~dp0' 'VERSION';
  $v = (Get-Content $p).Trim();
  $parts = $v.Split('.'); if ($parts.Length -lt 3) { $parts = @($parts[0], $parts[1], '0') }
  $parts[2] = ([int]$parts[2] + 1).ToString();
  $new = $parts -join '.';
  Set-Content -Path $p -Value $new; Write-Output $new
" > "%TEMP%\selfmade_newver.txt"
set /p NEWVER=<"%TEMP%\selfmade_newver.txt"
del "%TEMP%\selfmade_newver.txt"

git add -A
git commit -m "chore: bump version %NEWVER% [auto]" || echo No changes to commit.
git push origin main || echo Push failed. Ensure git/gh auth is configured.

REM prepare dist folder and copy files
if exist "%~dp0dist" rmdir /s /q "%~dp0dist"
mkdir "%~dp0dist"
xcopy "%~dp0index.html" "%~dp0dist\" /Y >nul
xcopy "%~dp0css" "%~dp0dist\css\" /E /I /Y >nul
xcopy "%~dp0js" "%~dp0dist\js\" /E /I /Y >nul

REM Attempt to publish to GitHub Pages using gh, fallback to git subtree
gh pages publish "%~dp0dist" --branch gh-pages --force || (
  echo gh pages publish failed, trying git subtree method...
  git add -f dist
  git commit -m "chore: publish dist [auto]" || echo No dist changes
  git subtree split --prefix dist -b gh-pages-temp
  git push origin gh-pages-temp:gh-pages --force
  git branch -D gh-pages-temp
)

REM copy to Google Drive folder as well (optional)
robocopy "%~dp0dist" "%DEST_DIR%" /MIR >nul

echo Published version %NEWVER% to GitHub Pages and %DEST_DIR%
echo Pausing for %PAUSE_SEC% seconds. Press any key to skip...
timeout /t %PAUSE_SEC%
goto LOOP
