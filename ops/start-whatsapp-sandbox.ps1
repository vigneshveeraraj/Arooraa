# Sandbox only. Run interactively on the laptop; do not enter secrets in chat.
[CmdletBinding()]
param(
    [switch]$Preflight,
    [string]$JarPath = 'D:\Test\arooraa-whatsapp-verify-20261012\target\lead-service.jar'
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$containerName = 'arooraa-whatsapp-sandbox-db'
$runtimeDir = 'D:\Test\arooraa-whatsapp-sandbox'
$createdDb = $false
$backendProcess = $null
$proxyProcess = $null
$verifyClipboardValue = $null
$backendEnvironment = @{}
$tokenPath = Join-Path $runtimeDir 'verify-token.dpapi'
$secretNames = @('AROORAA_WHATSAPP_APP_SECRET','AROORAA_WHATSAPP_ACCESS_TOKEN',
    'AROORAA_WHATSAPP_VERIFY_TOKEN','AROORAA_DB_PASSWORD','AROORAA_IP_HASH_SECRET','POSTGRES_PASSWORD')
function New-RandomValue {
    $bytes = New-Object byte[] 32
    $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
    try { $rng.GetBytes($bytes); [Convert]::ToBase64String($bytes) } finally { $rng.Dispose() }
}
function Read-SessionSecret([string]$name, [string]$label) {
    $secure = Read-Host $label -AsSecureString
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
        [Environment]::SetEnvironmentVariable($name,
            [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer), 'Process')
    } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer); $secure.Dispose() }
}
foreach ($tool in @('docker','java','node')) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) { throw "Missing local dependency: $tool" }
}
if (-not (Test-Path -LiteralPath $JarPath -PathType Leaf)) { throw 'Verified sandbox JAR not found.' }
foreach ($port in @(5544,8098,8099)) {
    if (Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue) {
        throw "Sandbox port already in use: $port"
    }
}
$existing = & docker ps -a --filter "name=^/$containerName$" --format '{{.Names}}'
if ($LASTEXITCODE -ne 0) { throw 'Docker is unavailable.' }
if ($existing) { throw 'Sandbox database name already exists; nothing was changed.' }
& docker image inspect postgres:16-alpine --format '{{.Id}}' | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Local postgres:16-alpine image missing; no automatic pull.' }
if ($Preflight) {
    Write-Host 'PREFLIGHT_OK: isolated database 5544, backend 8098, webhook-only proxy 8099.'
    Write-Host 'No credential prompts, processes, database changes, outbound sends or public tunnel.'
    exit 0
}
# Child environment changes exist only in this interactive process, never user/machine settings.
$settingNames = @('SERVER_ADDRESS','SERVER_PORT','AROORAA_DB_URL','AROORAA_DB_USERNAME',
    'AROORAA_WHATSAPP_PHONE_NUMBER_ID','AROORAA_WHATSAPP_BUSINESS_ACCOUNT_ID',
    'AROORAA_WHATSAPP_API_VERSION','AROORAA_WHATSAPP_ENABLED','AROORAA_WHATSAPP_OUTBOUND_ENABLED',
    'AROORAA_WHATSAPP_WORKER_ENABLED','AROORAA_LEAD_ASSISTANT_MODEL_PROVIDER',
    'AROORAA_LEAD_CONVERSATION_SIMULATOR_ENABLED','AROORAA_ADMIN_BOOTSTRAP_EMAIL',
    'AROORAA_ADMIN_BOOTSTRAP_PASSWORD','AROORAA_ADMIN_RESET_EMAIL','AROORAA_ADMIN_RESET_PASSWORD')
$settingNames += @('JAVA_TOOL_OPTIONS','JDK_JAVA_OPTIONS','_JAVA_OPTIONS')
$settingNames += @(Get-ChildItem Env: | Where-Object { $_.Name -like 'AROORAA_*' -or $_.Name -like 'SPRING_*' } | Select-Object -ExpandProperty Name)
$original = @{}
foreach ($name in ($secretNames + $settingNames)) {
    $original[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
}
try {
    foreach ($name in ($secretNames + $settingNames)) { [Environment]::SetEnvironmentVariable($name, $null, 'Process') }
    New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null
    $env:POSTGRES_PASSWORD = New-RandomValue
    $env:AROORAA_DB_PASSWORD = $env:POSTGRES_PASSWORD
    & docker run --detach --rm --name $containerName --label 'arooraa.scope=whatsapp-sandbox' --publish '127.0.0.1:5544:5432' -e 'POSTGRES_DB=arooraa_whatsapp_sandbox' -e 'POSTGRES_USER=arooraa_wa_sandbox' -e POSTGRES_PASSWORD postgres:16-alpine | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Sandbox database startup failed.' }
    $createdDb = $true
    $dbReady = $false
    for ($attempt = 0; $attempt -lt 45; $attempt++) {
        & docker exec $containerName pg_isready -U arooraa_wa_sandbox -d arooraa_whatsapp_sandbox *> $null
        if ($LASTEXITCODE -eq 0) { $dbReady = $true; break }
        Start-Sleep -Seconds 1
    }
    if (-not $dbReady) { throw 'Sandbox database readiness timed out.' }
    Read-SessionSecret 'AROORAA_WHATSAPP_APP_SECRET' 'Paste Meta app secret (masked)'
    Read-SessionSecret 'AROORAA_WHATSAPP_ACCESS_TOKEN' 'Paste sandbox access token (masked)'
    $env:AROORAA_WHATSAPP_VERIFY_TOKEN = New-RandomValue
    $verifyClipboardValue = $env:AROORAA_WHATSAPP_VERIFY_TOKEN
    Write-Host 'A random verify token has been generated. Keep it out of chat.'
    if ((Read-Host 'Type COPY to put the verify token in your clipboard for Meta') -ne 'COPY') {
        throw 'Cancelled before backend activation.'
    }
    Add-Type -AssemblyName System.Security
    # DPAPI binds the encrypted token to this Windows user; no plaintext token is written.
    $entropy = [Text.Encoding]::UTF8.GetBytes('Arooraa-WhatsApp-Sandbox-1362359049310995')
    $clearBytes = [Text.Encoding]::UTF8.GetBytes($verifyClipboardValue)
    try {
        $protected = [Security.Cryptography.ProtectedData]::Protect(
            $clearBytes,$entropy,[Security.Cryptography.DataProtectionScope]::CurrentUser)
        [IO.File]::WriteAllBytes($tokenPath,$protected)
    } finally { [Array]::Clear($clearBytes,0,$clearBytes.Length) }
    Set-Clipboard -Value $env:AROORAA_WHATSAPP_VERIFY_TOKEN
    $env:AROORAA_IP_HASH_SECRET = New-RandomValue
    $env:AROORAA_DB_URL = 'jdbc:postgresql://127.0.0.1:5544/arooraa_whatsapp_sandbox'
    $env:AROORAA_DB_USERNAME = 'arooraa_wa_sandbox'
    $env:SERVER_ADDRESS = '127.0.0.1'
    $env:SERVER_PORT = '8098'
    $env:AROORAA_WHATSAPP_PHONE_NUMBER_ID = '1276820242191298'
    $env:AROORAA_WHATSAPP_BUSINESS_ACCOUNT_ID = '1074115012292548'
    $env:AROORAA_WHATSAPP_API_VERSION = 'v25.0'
    $env:AROORAA_WHATSAPP_ENABLED = 'true'
    # Initial stage verifies and records inbound events. Enable replies only after callback verification.
    $env:AROORAA_WHATSAPP_OUTBOUND_ENABLED = 'false'
    $env:AROORAA_WHATSAPP_WORKER_ENABLED = 'false'
    $env:AROORAA_LEAD_ASSISTANT_MODEL_PROVIDER = 'none'
    $env:AROORAA_LEAD_CONVERSATION_SIMULATOR_ENABLED = 'false'
    foreach ($name in @('AROORAA_ADMIN_BOOTSTRAP_EMAIL','AROORAA_ADMIN_BOOTSTRAP_PASSWORD',
        'AROORAA_ADMIN_RESET_EMAIL','AROORAA_ADMIN_RESET_PASSWORD')) {
        [Environment]::SetEnvironmentVariable($name, '', 'Process')
    }
    foreach ($name in ($secretNames + $settingNames)) {
        $backendEnvironment[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
    }
    $backendProcess = Start-Process java -ArgumentList @('-Xms128m','-Xmx512m','-jar',('"' + $JarPath + '"')) -WorkingDirectory $runtimeDir -RedirectStandardOutput "$runtimeDir\backend.log" -RedirectStandardError "$runtimeDir\backend-error.log" -PassThru
    foreach ($name in ($secretNames + $settingNames)) {
        [Environment]::SetEnvironmentVariable($name, $null, 'Process')
    }
    $ready = $false
    for ($attempt = 0; $attempt -lt 90; $attempt++) {
        if ($backendProcess.HasExited) { throw 'Sandbox backend exited; inspect local startup logs.' }
        try {
            $health = Invoke-RestMethod -Uri 'http://127.0.0.1:8098/actuator/health' -TimeoutSec 2
            if ($health.status -eq 'UP') { $ready = $true; break }
        } catch { }
        Start-Sleep -Seconds 1
    }
    if (-not $ready) { throw 'Sandbox backend readiness timed out.' }
    $proxyPath = Join-Path $PSScriptRoot 'whatsapp-webhook-proxy.cjs'
    $proxyProcess = Start-Process node -ArgumentList ('"' + $proxyPath + '"') -WorkingDirectory $runtimeDir -RedirectStandardOutput "$runtimeDir\proxy.log" -RedirectStandardError "$runtimeDir\proxy-error.log" -PassThru
    Start-Sleep -Seconds 1
    if ($proxyProcess.HasExited) { throw 'Webhook proxy failed to start.' }
    Write-Host 'LOCAL_SANDBOX_READY: backend 8098; webhook-only proxy 8099; no public tunnel.'
    Write-Host 'Cloudflared must target http://127.0.0.1:8099 only, after owner approval.'
    Write-Host 'Existing apps/databases are unchanged. Outbound sends and worker remain OFF.'
    Write-Host 'Stopping this session removes only this temporary sandbox database and its test records.'
    :operatorLoop while ($true) {
        $action = Read-Host 'Type COPY to copy verify token again, REPLIES after Meta verification, or STOP'
        switch ($action.Trim().ToUpperInvariant()) {
            'COPY' { & (Join-Path $PSScriptRoot 'copy-whatsapp-verify-token.ps1') }
            'REPLIES' {
                if ($backendEnvironment['AROORAA_WHATSAPP_OUTBOUND_ENABLED'] -eq 'true') {
                    Write-Host 'Sandbox replies are already enabled.'
                    continue
                }
                Stop-Process -Id $backendProcess.Id
                $backendProcess.WaitForExit()
                $backendEnvironment['AROORAA_WHATSAPP_OUTBOUND_ENABLED'] = 'true'
                $backendEnvironment['AROORAA_WHATSAPP_WORKER_ENABLED'] = 'true'
                foreach ($name in $backendEnvironment.Keys) {
                    [Environment]::SetEnvironmentVariable($name,$backendEnvironment[$name],'Process')
                }
                try {
                    $backendProcess = Start-Process java -ArgumentList @('-Xms128m','-Xmx512m','-jar',('"' + $JarPath + '"')) -WorkingDirectory $runtimeDir -RedirectStandardOutput "$runtimeDir\backend.log" -RedirectStandardError "$runtimeDir\backend-error.log" -PassThru
                } finally {
                    foreach ($name in $backendEnvironment.Keys) {
                        [Environment]::SetEnvironmentVariable($name,$null,'Process')
                    }
                }
                $ready = $false
                for ($attempt=0; $attempt -lt 90; $attempt++) {
                    if ($backendProcess.HasExited) { throw 'Sandbox reply backend exited.' }
                    try {
                        $health=Invoke-RestMethod -Uri 'http://127.0.0.1:8098/actuator/health' -TimeoutSec 2
                        if ($health.status -eq 'UP') { $ready=$true; break }
                    } catch { }
                    Start-Sleep -Seconds 1
                }
                if (-not $ready) { throw 'Sandbox reply backend readiness timed out.' }
                Write-Host 'SANDBOX_REPLIES_ENABLED: Meta test number only; proxy/tunnel/database preserved.'
            }
            'STOP' { break operatorLoop }
            default { Write-Host 'Use COPY, REPLIES or STOP. Pressing ENTER alone keeps the sandbox running.' }
        }
    }
} finally {
    if ($proxyProcess -and -not $proxyProcess.HasExited) { Stop-Process -Id $proxyProcess.Id -ErrorAction SilentlyContinue }
    if ($backendProcess -and -not $backendProcess.HasExited) { Stop-Process -Id $backendProcess.Id -ErrorAction SilentlyContinue }
    if ($createdDb) { & docker stop $containerName | Out-Null }
    if ($verifyClipboardValue -and (Test-Path -LiteralPath $tokenPath)) { Remove-Item -LiteralPath $tokenPath }
    $backendEnvironment.Clear()
    # Clear only the generated token if still in the clipboard; preserve anything copied afterward.
    try {
        if ($verifyClipboardValue -and (Get-Clipboard -Raw -ErrorAction SilentlyContinue) -eq $verifyClipboardValue) {
            Set-Clipboard -Value ''
        }
    } catch { }
    foreach ($name in ($secretNames + $settingNames)) {
        [Environment]::SetEnvironmentVariable($name, $original[$name], 'Process')
    }
}
