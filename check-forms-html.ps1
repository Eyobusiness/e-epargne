# Script pour uniformiser tous les fichiers HTML des formulaires
# Ajoute le spinner et [disabled] à tous les boutons submit

$formsHtmlFiles = @(
  "src\app\features\adherents\components\adherent-form\adherent-form.component.html",
  "src\app\features\adherents\components\document-form\document-form.component.html",
  "src\app\features\cotisation-adherents\components\cotisation-adherent-form\cotisation-adherent-form.component.html",
  "src\app\features\cotisations\components\cotisation-form\cotisation-form.component.html",
  "src\app\features\depenses\components\categorie-depense-form\categorie-depense-form.component.html",
  "src\app\features\depenses\components\depense-form\depense-form.component.html",
  "src\app\features\groupes\components\affectation-adherent-form\affectation-adherent-form.component.html",
  "src\app\features\groupes\components\groupe-form\groupe-form.component.html",
  "src\app\features\operations\components\operation-form\operation-form.component.html",
  "src\app\features\parametres\components\parametre-form\parametre-form.component.html",
  "src\app\features\profil\components\profil-form\profil-form.component.html",
  "src\app\features\utilisateurs\components\utilisateur-form\utilisateur-form.component.html"
)

function Update-FormButtons {
  param([string]$filePath)
  
  $content = Get-Content $filePath -Raw
  
  # Pattern pour trouver les boutons submit
  $patterns = @{
    # Groupe-form pattern (déjà bon)
    'group' = @{
      'pattern' = 'type="submit".*?class="btn btn-primary".*?\[disabled\]="isLoading\(\)".*?@if \(isLoading\(\)\).*?<span class="spinner"></span>';
      'isOk' = $true
    }
    # Utilisateurs pattern (sans spinner/disabled)
    'user' = @{
      'find' = 'type="submit".*?class="btn btn-primary">\s+@if \(!isEditMode\(\)\) \{(\s+)Ajouter(\s+)\}(\s+)@if \(isEditMode\(\)\) \{(\s+)Modifier(\s+)\}';
      'replace' = 'type="submit" class="btn btn-primary" [disabled]="isLoading()">' + "`n      @if (isLoading()) {" + "`n        <span class=""loading-spinner""></span>" + "`n      }" + "`n      @if (!isEditMode()) {$1Ajouter$2}$3@if (isEditMode()) {$4Modifier$5}"
    }
  }
  
  # Vérifier et fixer si nécessaire
  if ($content -like "*`"btn btn-primary`"*" -and $content -notlike "*[disabled]*isLoading*") {
    Write-Host "[NEEDS FIX] $filePath"
    return $false
  } elseif ($content -like "*[disabled]*isLoading*" -and $content -like "*loading-spinner*") {
    Write-Host "[OK] $filePath"
    return $true
  } else {
    Write-Host "[CHECK] $filePath"
    return $null
  }
}

foreach ($file in $formsHtmlFiles) {
  $fullPath = Join-Path (Get-Location) $file
  if (Test-Path $fullPath) {
    Update-FormButtons $fullPath
  } else {
    Write-Host "[SKIP] Not found: $file"
  }
}

Write-Host "`n[SUMMARY] Forms HTML files checked"
