# TheTechGeeks pixel edition, one-time import of exact published Google Sites content.
# Uses Windows PowerShell, built into Windows. No Python or extra modules required.
$ErrorActionPreference = 'Stop'
$folder = Split-Path -Parent $MyInvocation.MyCommand.Path
$imagesFolder = Join-Path $folder 'assets'
New-Item -ItemType Directory -Force -Path $imagesFolder | Out-Null
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$utf8 = New-Object System.Text.UTF8Encoding($false)
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36'
$pages = [ordered]@{
  'networking'              = 'networking.html'
  'history-of-the-internet' = 'history-of-the-internet.html'
  'bits-bytes'              = 'bits-bytes.html'
  'pixels-pictures'         = 'pixels-pictures.html'
  'internet-safety-interland' = 'interland.html'
  'artificial-intelligence' = 'artificial-intelligence.html'
  'sources'                 = 'sources.html'
}
function Get-WebClient([string]$referer) {
  $client = New-Object System.Net.WebClient
  $client.Encoding = [Text.Encoding]::UTF8
  $client.Headers.Add('User-Agent', $ua)
  $client.Headers.Add('Accept', 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8')
  if ($referer) { $client.Headers.Add('Referer', $referer) }
  return $client
}
$totalTexts = 0
$totalImages = 0
$issues = 0
foreach ($entry in $pages.GetEnumerator()) {
  $slug = $entry.Key
  $filename = $entry.Value
  $pageUrl = 'https://sites.google.com/view/thetechgeeks/' + $slug
  $pageFile = Join-Path $folder $filename
  try {
    $client = Get-WebClient ''
    try { $source = $client.DownloadString($pageUrl) } finally { $client.Dispose() }
    $headEnd = $source.IndexOf('</header>', [StringComparison]::OrdinalIgnoreCase)
    if ($headEnd -lt 0) { throw 'Cannot locate published page content.' }
    $source = $source.Substring($headEnd + 9)
    $sections = [regex]::Matches($source, '(?is)<section\b[^>]*>[\s\S]*?</section>')
    if ($sections.Count -lt 1) { throw 'No page sections found.' }
    $sectionTexts = New-Object 'System.Collections.Generic.List[string]'
    $foundTexts = 0
    $foundImages = 0
    foreach ($section in $sections) {
      $parts = New-Object 'System.Collections.Generic.List[string]'
      $blocks = [regex]::Matches($section.Value, '(?is)<(?<tag>h[1-6]|p|ul|ol|li)\b[^>]*>[\s\S]*?</\k<tag>>|<img\b[^>]*>')
      foreach ($block in $blocks) {
        $tag = $block.Value
        if ($tag -match '^(?i:<img)') {
          $foundImages++
          $srcMatch = [regex]::Match($tag,'(?i)\bsrc="([^"]+)"')
          if ($srcMatch.Success) {
            $url = [Net.WebUtility]::HtmlDecode($srcMatch.Groups[1].Value)
            if ($url.StartsWith('https://sites.google.com/')) {
              try {
                $imageClient = Get-WebClient $pageUrl
                try {
                  $bytes = $imageClient.DownloadData($url)
                  $contentType = $imageClient.ResponseHeaders['Content-Type']
                } finally { $imageClient.Dispose() }
                if (-not $contentType.StartsWith('image/') -or $bytes.Length -lt 100) { throw 'Invalid image response.' }
                $sha = [Security.Cryptography.SHA256]::Create()
                try { $hex = [BitConverter]::ToString($sha.ComputeHash($bytes)).Replace('-','').ToLowerInvariant().Substring(0,20) }
                finally { $sha.Dispose() }
                $ext = if ($contentType.Contains('png')) { '.png' } elseif ($contentType.Contains('webp')) { '.webp' } elseif ($contentType.Contains('gif')) { '.gif' } else { '.jpg' }
                $file = $hex + $ext
                [IO.File]::WriteAllBytes((Join-Path $imagesFolder $file), $bytes)
                $safeUrl = 'assets/' + $file
                $tag = $tag.Substring(0, $srcMatch.Groups[1].Index) + $safeUrl + $tag.Substring($srcMatch.Groups[1].Index + $srcMatch.Groups[1].Length)
                $totalImages++
              } catch {
                Write-Warning "Could not save one original image on $filename`: $($_.Exception.Message)"
              }
            }
          }
          $parts.Add('<figure class="original-picture">' + $tag + '</figure>')
        } else {
          # Keep Google Sites spelling, punctuation, paragraphs, spans and emphasis exactly.
          $parts.Add($tag)
          $foundTexts++
        }
      }
      if ($parts.Count -gt 0) { $sectionTexts.Add('<div class="original-section">' + [Environment]::NewLine + ($parts -join [Environment]::NewLine) + '</div>') }
    }
    if ($sectionTexts.Count -lt 1) { throw 'No assessment text extracted.' }
    $existing = [IO.File]::ReadAllText($pageFile)
    $pattern = [regex]::new('<!-- ORIGINAL_CONTENT_START -->[\s\S]*?<!-- ORIGINAL_CONTENT_END -->')
    $replacement = '<!-- ORIGINAL_CONTENT_START -->' + [Environment]::NewLine + ($sectionTexts -join [Environment]::NewLine) + [Environment]::NewLine + '<!-- ORIGINAL_CONTENT_END -->'
    if (-not $pattern.IsMatch($existing)) { throw 'Cannot find a safe place to insert content.' }
    $changed = $pattern.Replace($existing, [System.Text.RegularExpressions.MatchEvaluator]{param($m) $replacement}, 1)
    [IO.File]::WriteAllText($pageFile, $changed, $utf8)
    $totalTexts += $foundTexts
    Write-Host "[OK] $filename : $foundTexts text blocks and $foundImages original image references."
  } catch {
    $issues++
    Write-Warning "[FAILED] $filename : $($_.Exception.Message)"
  }
}
Write-Host "Original text blocks added: $totalTexts"
Write-Host "Original image files saved: $totalImages"
if ($issues) { Write-Host "Some pages could not be updated. Check the internet connection and try again."; exit 1 }
Write-Host 'DONE. Open index.html in a browser, or edit it in VS Code.'
