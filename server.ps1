# Servidor Web local en PowerShell para la Landing Page de Duoc UC
$port = 8081
$dir = "C:\Users\Julieta Vasquez\.gemini\antigravity\scratch\duoc-landing-page"

if (-not (Test-Path $dir)) {
    Write-Error "El directorio del proyecto no existe en la ruta: $dir"
    exit 1
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "=========================================="
    Write-Host "Servidor Duoc UC Landing Page activo en:"
    Write-Host "👉 http://localhost:$port"
    Write-Host "Presione Ctrl+C en esta terminal para apagar."
    Write-Host "=========================================="
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response
        
        $urlPath = $req.Url.LocalPath
        if ($urlPath -eq "/") { $urlPath = "/index.html" }
        
        $cleanPath = $urlPath.TrimStart('/')
        $filePath = [System.IO.Path]::Combine($dir, $cleanPath)
        
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            
            # Asignar Content-Type correcto según el tipo de archivo
            if ($filePath.EndsWith(".html")) { 
                $res.ContentType = "text/html; charset=utf-8" 
            }
            elseif ($filePath.EndsWith(".css")) { 
                $res.ContentType = "text/css; charset=utf-8" 
            }
            elseif ($filePath.EndsWith(".js")) { 
                $res.ContentType = "application/javascript; charset=utf-8" 
            }
            elseif ($filePath.EndsWith(".png")) { 
                $res.ContentType = "image/png" 
            }
            elseif ($filePath.EndsWith(".md")) { 
                $res.ContentType = "text/markdown; charset=utf-8" 
            }
            
            $res.ContentLength64 = $bytes.Length
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            Write-Host "404 - No encontrado: $urlPath"
            $res.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 - Recurso No Encontrado")
            $res.ContentLength64 = $errBytes.Length
            $res.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $res.Close()
    }
} catch {
    Write-Error "Error al iniciar el servidor: $_"
} finally {
    if ($listener -ne $null) {
        $listener.Stop()
        $listener.Close()
    }
}
