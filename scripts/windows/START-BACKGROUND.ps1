param([ValidateRange(1,65535)][int]$Port = 4173)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'StudyRuntime.ps1')
Set-Location -LiteralPath $studyProjectRoot
$studyNode = Get-StudyNode
Initialize-StudyDependencies -StudyRoot $studyProjectRoot -StudyNode $studyNode
$studyLogs = Join-Path $studyProjectRoot 'logs'
New-Item -ItemType Directory -Path $studyLogs -Force | Out-Null
$studyPidFile = Join-Path $studyLogs 'server.json'
if (Test-Path -LiteralPath $studyPidFile) {
  $studyPrevious = Get-Content -LiteralPath $studyPidFile -Raw | ConvertFrom-Json
  $studyProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $($studyPrevious.pid)" -ErrorAction SilentlyContinue
  if (Test-StudyProcess -StudyProcess $studyProcess -StudyRoot $studyProjectRoot) {
    if ($studyPrevious.framework -eq 'next') {
      if ($studyPrevious.port -ne $Port) { throw "Project dang chay o cong $($studyPrevious.port). Dung may chu cu truoc khi doi cong." }
      $studyExistingHealth = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/api/health" -TimeoutSec 4
      if (!$studyExistingHealth.ok -or $studyExistingHealth.framework -ne 'Next.js') { throw 'Tien trinh cu chua san sang. Xem log truoc khi chay lai.' }
      Write-Output "Tram hoc dang chay: http://localhost:$($studyPrevious.port)"
      exit 0
    }
    throw 'May chu cu van dang chay. Dung STOP-BACKGROUND.ps1 truoc khi chuyen sang Next.js.'
  }
}
$env:PORT = [string]$Port
$studyLauncher = Join-Path $studyProjectRoot 'scripts\runtime\run-next.mjs'
# Record the wrapper PID so shutdown can terminate its Next.js child process as well.
$studyChild = Start-Process -FilePath $studyNode -ArgumentList @('"' + $studyLauncher + '"', 'dev') -WorkingDirectory $studyProjectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $studyLogs 'server-output.log') -RedirectStandardError (Join-Path $studyLogs 'server-error.log') -PassThru
@{ pid = $studyChild.Id; port = $Port; script = $studyLauncher; framework = 'next' } | ConvertTo-Json | Set-Content -LiteralPath $studyPidFile -Encoding UTF8
$studyDeadline = [DateTime]::UtcNow.AddSeconds(45)
$studyLastError = 'No health response received.'
do {
  if ($studyChild.HasExited) { throw 'Next.js chua khoi dong duoc. Xem logs/server-error.log.' }
  try {
    # Probe IPv4 explicitly; localhost may resolve to IPv6 while the LAN listener is IPv4.
    $studyHealth = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/api/health" -TimeoutSec 4
    if ($studyHealth.ok -and $studyHealth.framework -eq 'Next.js') {
      Write-Output "Tram hoc dang chay nen: http://localhost:$Port"
      Write-Output 'Dung STOP-BACKGROUND.ps1 de dung may chu cua project.'
      exit 0
    }
  } catch { $studyLastError = $_.Exception.Message }
  Start-Sleep -Milliseconds 300
} while ([DateTime]::UtcNow -lt $studyDeadline)
throw "Next.js chua san sang sau 45 giay: $studyLastError. Xem logs/server-output.log va server-error.log."
