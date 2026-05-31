!macro customInit
  ; Close the app if it is running to prevent file locking
  ExecWait 'taskkill /IM "Code Tiara.exe" /F'
!macroend

!macro customUnInstall
  ; Close the app if it is running during uninstall
  ExecWait 'taskkill /IM "Code Tiara.exe" /F'
!macroend
