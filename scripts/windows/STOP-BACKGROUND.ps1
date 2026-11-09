$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'StudyRuntime.ps1')
$studyPidFile = Join-Path $studyProjectRoot 'logs\server.json'
if (!(Test-Path -LiteralPath $studyPidFile)) { Write-Output 'Khong co may chu nen duoc ghi nhan.'; exit 0 }
$studyInfo = Get-Content -LiteralPath $studyPidFile -Raw | ConvertFrom-Json
$studyProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $($studyInfo.pid)" -ErrorAction SilentlyContinue
if (!$studyProcess) { Remove-Item -LiteralPath $studyPidFile; Write-Output 'May chu da dung truoc do.'; exit 0 }
if (!(Test-StudyProcess -StudyProcess $studyProcess -StudyRoot $studyProjectRoot)) { throw 'PID khong thuoc project; khong dung tien trinh khac.' }
# Stop the verified process tree; killing only the wrapper would orphan Next.js.
& taskkill.exe /PID ([string]$studyInfo.pid) /T /F | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Chua dung duoc may chu.' }
Remove-Item -LiteralPath $studyPidFile
Write-Output 'Da dung may chu Tram hoc.'
