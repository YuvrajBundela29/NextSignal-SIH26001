Set WshShell = CreateObject("WScript.Shell")
WshShell.Run chr(34) & "y:\Dev\projects\nextsignal\launch-nextsignal.bat" & Chr(34), 0
Set WshShell = Nothing
