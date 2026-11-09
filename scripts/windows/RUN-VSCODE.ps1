param([ValidateRange(1,65535)][int]$Port = 4173)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'StudyRuntime.ps1')
Set-Location -LiteralPath $studyProjectRoot
$studyAddress = "http://localhost:$Port"
$studyHealth = $null
try { $studyHealth = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/api/health" -TimeoutSec 3 } catch { }
if ($studyHealth -and $studyHealth.ok -and $studyHealth.framework -eq 'Next.js') {
  Write-Output 'Next.js da chay. Khong can mo them may chu.'
} elseif ($studyHealth -and $studyHealth.ok) {
  throw 'Cong nay dang chay ban cu. Dung STOP-BACKGROUND.ps1 roi chay lai.'
} else {
  & (Join-Path $studyProjectRoot 'scripts\windows\START-BACKGROUND.ps1') -Port $Port
}
Write-Output "MO WEBSITE: $studyAddress"
Write-Output 'Trong VS Code: giu Ctrl va bam vao link tren.'
Write-Output 'Khong dung Live Server; ung dung can Next.js de chay API va React.'
