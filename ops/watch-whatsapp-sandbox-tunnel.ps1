# Approved temporary sandbox tunnel. Stops when the webhook proxy stops.
[CmdletBinding()]
param([Parameter(Mandatory=$true)][int]$CredentialConsolePid)
$ErrorActionPreference = 'Stop'
$binary = 'D:\AgentOps-Pocket\tools\cloudflared\cloudflared.exe'
$runtimeDir = 'D:\Test\arooraa-whatsapp-sandbox'
New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null
$tunnelProcess = $null
try {
    $deadline = (Get-Date).AddMinutes(30)
    $proxyPid = $null
    Write-Output 'WAITING_FOR_LOCAL_CREDENTIAL_SETUP'
    while ((Get-Date) -lt $deadline) {
        if (-not (Get-Process -Id $CredentialConsolePid -ErrorAction SilentlyContinue)) {
            throw 'Credential console closed before local setup.'
        }
        $listener = Get-NetTCPConnection -State Listen -LocalPort 8099 -ErrorAction SilentlyContinue |
            Where-Object { $_.LocalAddress -eq '127.0.0.1' } | Select-Object -First 1
        if ($listener) {
            $owner = Get-CimInstance Win32_Process -Filter ("ProcessId=" + $listener.OwningProcess)
            if ($owner -and $owner.Name -eq 'node.exe' -and
                $owner.CommandLine -match 'D:\\Arooraa\\ops\\whatsapp-webhook-proxy\.cjs') {
                $proxyPid = $listener.OwningProcess
                break
            }
        }
        Start-Sleep -Seconds 2
    }
    if (-not $proxyPid) { throw 'Local credential setup timed out; tunnel not started.' }
    $tunnelProcess = Start-Process -FilePath $binary -ArgumentList @('tunnel','--no-autoupdate','--url','http://127.0.0.1:8099') -RedirectStandardOutput "$runtimeDir\tunnel-out.log" -RedirectStandardError "$runtimeDir\tunnel.log" -PassThru
    $urlFound = $false
    for ($attempt=0; $attempt -lt 60; $attempt++) {
        if ($tunnelProcess.HasExited) { throw 'Tunnel startup failed; inspect local tunnel.log.' }
        if (Test-Path "$runtimeDir\tunnel.log") {
            $text = [IO.File]::ReadAllText("$runtimeDir\tunnel.log")
            $match = [regex]::Match($text, 'https://[a-z0-9-]+\.trycloudflare\.com')
            if ($match.Success) {
                $callback = $match.Value + '/api/v1/whatsapp/webhook'
                [IO.File]::WriteAllText("$runtimeDir\callback-url.txt", $callback, (New-Object Text.UTF8Encoding($false)))
                Write-Output ('TUNNEL_READY: '+$callback)
                $urlFound = $true
                break
            }
        }
        Start-Sleep -Seconds 1
    }
    if (-not $urlFound) { throw 'Tunnel URL timed out.' }
    while (-not $tunnelProcess.HasExited) {
        if (-not (Get-Process -Id $proxyPid -ErrorAction SilentlyContinue)) { break }
        Start-Sleep -Seconds 2
    }
} finally {
    if ($tunnelProcess -and -not $tunnelProcess.HasExited) {
        Stop-Process -Id $tunnelProcess.Id -ErrorAction SilentlyContinue
    }
    if (Test-Path "$runtimeDir\callback-url.txt") { Remove-Item "$runtimeDir\callback-url.txt" }
    Write-Output 'TUNNEL_STOPPED'
}
