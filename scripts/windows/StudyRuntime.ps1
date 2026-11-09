$studyProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
# Shared runtime discovery keeps every Windows entry point on the same Node version.
function Get-StudyNode {
  $studyCommand = Get-Command node -ErrorAction SilentlyContinue
  $studyNodePath = if ($studyCommand) { $studyCommand.Source } else {
    Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
  }
  if (!(Test-Path -LiteralPath $studyNodePath)) { throw 'Can Node.js LTS kem npm (nodejs.org).' }
  # Test and lint tools require newer LTS minors than the minimum Next.js runtime.
  $studyVersionText = & $studyNodePath --version
  if ($LASTEXITCODE -ne 0) { throw 'Khong doc duoc phien ban Node.js.' }
  $studyVersion = [version]$studyVersionText.Trim().TrimStart('v')
  if (!(($studyVersion.Major -eq 20 -and $studyVersion.Minor -ge 19) -or ($studyVersion.Major -eq 22 -and $studyVersion.Minor -ge 13) -or $studyVersion.Major -ge 24)) { throw 'Can Node.js 20.19+, 22.13+ hoac 24+.' }
  return $studyNodePath
}

function Initialize-StudyDependencies([string]$StudyRoot, [string]$StudyNode) {
  if (!(Test-Path -LiteralPath (Join-Path $StudyRoot 'node_modules\next\dist\bin\next'))) {
    & (Join-Path $StudyRoot 'SETUP.ps1')
    if ($LASTEXITCODE -ne 0) { throw 'Cai dependencies chua thanh cong.' }
  }
}

function Test-StudyProcess($StudyProcess, [string]$StudyRoot) {
  if (!$StudyProcess -or !$StudyProcess.CommandLine) { return $false }
  # Accept the previous launcher only so an existing project process can be stopped safely.
  foreach ($studyRelative in @('scripts\runtime\run-next.mjs', 'scripts\run-next.mjs', 'server.mjs')) {
    if ($StudyProcess.CommandLine.IndexOf((Join-Path $StudyRoot $studyRelative), [StringComparison]::OrdinalIgnoreCase) -ge 0) { return $true }
  }
  return $false
}
