@echo off

:LOOP
robocopy . %USERPROFILE%\.glzr\zebar\zebar-nord /MIR /NP /XD node_modules .git .vscode /R:3 /W:10 >nul
timeout /t 3 /nobreak
cls
goto LOOP