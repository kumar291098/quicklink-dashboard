$ErrorActionPreference = 'Stop'

$targetDir = Join-Path $PSScriptRoot '..\runtime\jre'
$resolvedTargetDir = [System.IO.Path]::GetFullPath($targetDir)

if ($env:JAVA_HOME) {
    $javaHome = $env:JAVA_HOME
}
else {
    $javaHomeOutput = cmd /c "java -XshowSettings:properties -version 2>&1"
    $javaHomeLine = $javaHomeOutput | Select-String 'java.home'
    if (-not $javaHomeLine) {
        throw 'Unable to determine java.home from the installed Java runtime.'
    }

    $javaHome = ($javaHomeLine -split '=')[1].Trim()
}

Write-Host "Using Java runtime from: $javaHome"

if (-not (Test-Path (Join-Path $javaHome 'bin\java.exe'))) {
    throw "The resolved Java home does not contain bin\\java.exe: $javaHome"
}

if (Test-Path $resolvedTargetDir) {
    Remove-Item -Recurse -Force $resolvedTargetDir
}

New-Item -ItemType Directory -Force -Path $resolvedTargetDir | Out-Null

Copy-Item -Recurse -Force (Join-Path $javaHome '*') $resolvedTargetDir

Write-Host "Bundled Java runtime copied to: $resolvedTargetDir"
