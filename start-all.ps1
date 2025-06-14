# PowerShell script to start both Node.js backend and Angular (PrimeNG) frontend in split terminals

# Open backend (Node.js) in a new terminal window
Start-Process powershell -WorkingDirectory "$PSScriptRoot\money" -ArgumentList 'npm start' -WindowStyle Normal

# Wait a few seconds to ensure backend starts
Start-Sleep -Seconds 3

# Open frontend (Angular) in a new terminal window
Start-Process powershell -WorkingDirectory "$PSScriptRoot\client" -ArgumentList 'ng serve --open' -WindowStyle Normal

# Instructions for the user
Write-Host "Backend (Node.js) and Frontend (Angular) are starting in separate terminals.`nCheck each window for logs and errors."
