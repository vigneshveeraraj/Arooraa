# Recopy only this active sandbox's verify token; never prints the value.
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Security
$tokenPath='D:\Test\arooraa-whatsapp-sandbox\verify-token.dpapi'
if (-not (Test-Path -LiteralPath $tokenPath)) { throw 'No active sandbox verify token is available.' }
$bytes=$null
$token=$null
try {
    $entropy=[Text.Encoding]::UTF8.GetBytes('Arooraa-WhatsApp-Sandbox-1362359049310995')
    $bytes=[Security.Cryptography.ProtectedData]::Unprotect(
        [IO.File]::ReadAllBytes($tokenPath),$entropy,[Security.Cryptography.DataProtectionScope]::CurrentUser)
    $token=[Text.Encoding]::UTF8.GetString($bytes)
    $uri='http://127.0.0.1:8098/api/v1/whatsapp/webhook?hub.mode=subscribe&hub.verify_token='+
        [Uri]::EscapeDataString($token)+'&hub.challenge=recopycheck'
    try { $r=Invoke-WebRequest -UseBasicParsing -Uri $uri -TimeoutSec 5 }
    catch { throw 'The stored verify token could not be validated against the local sandbox.' }
    if ($r.StatusCode -ne 200 -or $r.Content -ne 'recopycheck') { throw 'Local verify-token validation failed.' }
    Set-Clipboard -Value $token
    Write-Host 'VERIFY_TOKEN_COPIED: paste into Meta Verify token; no secret was printed.'
} finally {
    if ($bytes) { [Array]::Clear($bytes,0,$bytes.Length) }
    $token=$null
    $uri=$null
}
