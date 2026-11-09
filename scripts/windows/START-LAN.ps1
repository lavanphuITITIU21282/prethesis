param([ValidateRange(1,65535)][int]$Port = 4173)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'StudyRuntime.ps1')
Set-Location -LiteralPath $studyProjectRoot
$studyNode = Get-StudyNode
Initialize-StudyDependencies -StudyRoot $studyProjectRoot -StudyNode $studyNode
$env:PORT = [string]$Port
# Keep the foreground launcher identical to npm run dev.
& $studyNode (Join-Path $studyProjectRoot 'scripts\runtime\run-next.mjs') dev
exit $LASTEXITCODE
