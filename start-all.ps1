# Enhanced PowerShell script to start both Node.js backend and Angular (PrimeNG) frontend

# Ensure backend dependencies are installed
if (-Not (Test-Path "$PSScriptRoot\money\node_modules")) {
    Write-Host "Installing backend dependencies..."
    Start-Process powershell -WorkingDirectory "$PSScriptRoot\money" -ArgumentList 'npm install' -Wait
}

# Ensure backend .env file exists
if (-Not (Test-Path "$PSScriptRoot\money\.env")) {
    Write-Host "Error: Backend .env file is missing. Please create it in the 'money' folder."
    exit 1
}

# Start backend (Node.js) in a new terminal window
Write-Host "Starting backend..."
Start-Process powershell -WorkingDirectory "$PSScriptRoot\money" -ArgumentList 'npm start' -WindowStyle Normal

# Wait a few seconds to ensure backend starts
Start-Sleep -Seconds 3

# Ensure frontend dependencies are installed
if (-Not (Test-Path "$PSScriptRoot\client\node_modules")) {
    Write-Host "Installing frontend dependencies..."
    Start-Process powershell -WorkingDirectory "$PSScriptRoot\client" -ArgumentList 'npm install' -Wait
}

# Start frontend (Angular) in a new terminal window
Write-Host "Starting frontend..."
Start-Process powershell -WorkingDirectory "$PSScriptRoot\client" -ArgumentList 'ng serve --open' -WindowStyle Normal

# Instructions for the user
Write-Host "Backend (Node.js) and Frontend (Angular) are starting in separate terminals.`nCheck each window for logs and errors."


