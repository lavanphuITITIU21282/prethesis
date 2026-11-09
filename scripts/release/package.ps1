param([string]$OutputDirectory = (Join-Path $env:USERPROFILE 'Downloads\TramHoc-releases'))
$ErrorActionPreference = 'Stop'
$studyRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..')).TrimEnd('\')
$studyOutput = [IO.Path]::GetFullPath($OutputDirectory).TrimEnd('\')
if ($studyOutput -eq $studyRoot -or $studyOutput.StartsWith($studyRoot + '\', [StringComparison]::OrdinalIgnoreCase)) {
  throw 'Release output must be outside the project directory.'
}
New-Item -ItemType Directory -Path $studyOutput -Force | Out-Null
$studyPackage = Get-Content -LiteralPath (Join-Path $studyRoot 'package.json') -Raw | ConvertFrom-Json
$studyName = 'tram-hoc-' + $studyPackage.version + '-source-' + [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss')
$studyPartial = Join-Path $studyOutput ($studyName + '.partial')
$studyArchivePath = Join-Path $studyOutput ($studyName + '.zip')
if ((Test-Path -LiteralPath $studyPartial) -or (Test-Path -LiteralPath $studyArchivePath)) { throw 'Release filename already exists.' }

# Use an allowlist, not a workspace-wide glob: runtime caches and credentials never enter a release.
$studyRootFiles = @('README.md','AGENTS.md','package.json','package-lock.json','next.config.ts','next-env.d.ts','tsconfig.json','eslint.config.mjs','.env.example','.gitignore','.editorconfig','.prettierrc.json','.prettierignore','SETUP.ps1','START-LAN.cmd')
$studyFolders = @('src','public','resources','scripts','tests','docs','database','.vscode')
$studyFiles = [Collections.Generic.List[IO.FileInfo]]::new()
foreach ($studyFile in $studyRootFiles) {
  $studyPath = Join-Path $studyRoot $studyFile
  if (!(Test-Path -LiteralPath $studyPath -PathType Leaf)) { throw "Missing release file: $studyFile" }
  $studyRootItem = Get-Item -LiteralPath $studyPath
  if ($studyRootItem.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "Release input cannot be a link: $studyPath" }
  $studyFiles.Add($studyRootItem)
}
$studyQueue = [Collections.Generic.Queue[string]]::new()
foreach ($studyFolder in $studyFolders) { $studyQueue.Enqueue((Join-Path $studyRoot $studyFolder)) }
while ($studyQueue.Count -gt 0) {
  $studyDirectory = $studyQueue.Dequeue()
  foreach ($studyItem in Get-ChildItem -LiteralPath $studyDirectory -Force) {
    if ($studyItem.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "Release input cannot be a link: $($studyItem.FullName)" }
    if ($studyItem.PSIsContainer) {
      if ($studyItem.Name -notin @('__pycache__','node_modules','.next','logs','tmp','preview','unused-runtime-drafts')) { $studyQueue.Enqueue($studyItem.FullName) }
    } elseif ($studyItem.Name -notmatch '\.(pyc|pyo|tmp|bak|old|log|tsbuildinfo)$') { $studyFiles.Add($studyItem) }
  }
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$studyManifestFiles = [Collections.Generic.List[object]]::new()
$studyArchive = [IO.Compression.ZipFile]::Open($studyPartial, [IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($studyFile in ($studyFiles | Sort-Object FullName)) {
    if (!$studyFile.FullName.StartsWith($studyRoot + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Release input escaped the project root.' }
    $studyEntryPath = $studyFile.FullName.Substring($studyRoot.Length + 1).Replace('\','/')
    if ($studyEntryPath -match '(^|/)\.env($|\.)' -and $studyEntryPath -ne '.env.example') { throw "Private environment file rejected: $studyEntryPath" }
    if ($studyEntryPath -match '\.(pem|pfx|p12|key)$') { throw "Credential-like file rejected: $studyEntryPath" }
    $studyHash = (Get-FileHash -LiteralPath $studyFile.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    $studyManifestFiles.Add([ordered]@{path=$studyEntryPath; bytes=$studyFile.Length; sha256=$studyHash})
    [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($studyArchive, $studyFile.FullName, $studyEntryPath, [IO.Compression.CompressionLevel]::Fastest) | Out-Null
  }
  $studyManifest = [ordered]@{
    name=$studyPackage.name; version=$studyPackage.version; type='source'; architecture='modular-monolith';
    createdAt=[DateTime]::UtcNow.ToString('o'); node=$studyPackage.engines.node;
    excludes=@('.env.local','node_modules','.next','logs','tmp','__pycache__');
    files=@($studyManifestFiles.ToArray())
  }
  $studyManifestEntry = $studyArchive.CreateEntry('RELEASE-MANIFEST.json')
  $studyWriter = [IO.StreamWriter]::new($studyManifestEntry.Open(), [Text.UTF8Encoding]::new($false))
  try { $studyWriter.Write(($studyManifest | ConvertTo-Json -Depth 8)) } finally { $studyWriter.Dispose() }
} finally { $studyArchive.Dispose() }

# Verify archived bytes against the manifest before publishing the final filename.
$studyArchive = [IO.Compression.ZipFile]::OpenRead($studyPartial)
try {
  if ($studyArchive.Entries.Count -ne $studyManifestFiles.Count + 1) { throw 'Archive entry count does not match the manifest.' }
  foreach ($studyExpected in $studyManifestFiles) {
    $studyEntry = $studyArchive.GetEntry($studyExpected.path)
    if (!$studyEntry -or $studyEntry.Length -ne $studyExpected.bytes) { throw "Archive length mismatch: $($studyExpected.path)" }
    $studyStream = $studyEntry.Open()
    $studyAlgorithm = [Security.Cryptography.SHA256]::Create()
    try { $studyActual = ([BitConverter]::ToString($studyAlgorithm.ComputeHash($studyStream))).Replace('-','').ToLowerInvariant() }
    finally { $studyAlgorithm.Dispose(); $studyStream.Dispose() }
    if ($studyActual -ne $studyExpected.sha256) { throw "Archive hash mismatch: $($studyExpected.path)" }
  }
} finally { $studyArchive.Dispose() }
[IO.File]::Move($studyPartial, $studyArchivePath)
$studyArchiveHash = (Get-FileHash -LiteralPath $studyArchivePath -Algorithm SHA256).Hash.ToLowerInvariant()
[IO.File]::WriteAllText(($studyArchivePath + '.sha256'), ($studyArchiveHash + '  ' + [IO.Path]::GetFileName($studyArchivePath) + "`n"), [Text.UTF8Encoding]::new($false))
[ordered]@{archive=$studyArchivePath; files=$studyManifestFiles.Count; bytes=(Get-Item -LiteralPath $studyArchivePath).Length; sha256=$studyArchiveHash; verified=$true} | ConvertTo-Json
