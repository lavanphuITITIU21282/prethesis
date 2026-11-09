param([Parameter(Mandatory=$true)][ValidateSet('test','typecheck','build','format','format:check','lint','lint:fix','db:setup','db:start','db:stop','db:status','db:check','db:shell','db:migrate','db:seed','db:provision','db:backup','db:verify-backup','test:db')][string]$Task)
$ErrorActionPreference = 'Stop'
$studyRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location -LiteralPath $studyRoot
. (Join-Path $PSScriptRoot 'StudyRuntime.ps1')
$studyNode = Get-StudyNode
Initialize-StudyDependencies -StudyRoot $studyRoot -StudyNode $studyNode
# Use the same runtime discovery as the application launch task.
& $studyNode (Join-Path $studyRoot 'scripts\runtime\task.mjs') $Task
exit $LASTEXITCODE
