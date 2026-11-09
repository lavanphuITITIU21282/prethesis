$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
. (Join-Path $PSScriptRoot 'scripts\windows\StudyRuntime.ps1')
$studyNode = Get-StudyNode
$studyNpm = Get-Command npm.cmd -ErrorAction SilentlyContinue
if ($studyNpm) {
  & $studyNpm.Source ci --no-fund --no-audit
} else {
  # The bundled runtime may keep npm outside PATH; reuse its cached CLI when available.
  $studyNpmCli = Join-Path $env:LOCALAPPDATA 'TramHoc\tooling\package\bin\npm-cli.js'
  if (!(Test-Path -LiteralPath $studyNpmCli)) { throw 'Can npm de cai dependencies. Cai Node.js LTS kem npm, roi chay lai SETUP.ps1.' }
  & $studyNode $studyNpmCli ci --no-fund --no-audit
}
if ($LASTEXITCODE -ne 0) { throw 'npm ci chua thanh cong.' }
Write-Output 'Dependencies da san sang. Chay START-LAN.cmd hoac Ctrl+Shift+B trong VS Code.'
