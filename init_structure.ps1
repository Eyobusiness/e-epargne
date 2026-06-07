# Script de création de l'arborescence E-Tontine
$base = "src/app"

# Dossiers Core, Shared, Assets et Styles
$dirs = @(
    "$base/core/constants", "$base/core/guards", "$base/core/interceptors", "$base/core/services", "$base/core/helpers", "$base/core/models",
    "$base/shared/ui", "$base/shared/pipes", "$base/shared/directives", "$base/shared/layouts/main-layout", "$base/shared/layouts/auth-layout", "$base/shared/layouts/sidebar", "$base/shared/layouts/header", "$base/shared/layouts/footer",
    "src/assets/images", "src/assets/icons", "src/assets/fonts", "src/assets/mock",
    "src/styles/base", "src/styles/abstracts", "src/styles/components", "src/styles/layouts", "src/styles/themes"
)

# Liste des fonctionnalités (Features)
$features = @("dashboard", "auth", "adherents", "groupes", "cotisations", "cotisations-adherents", "operations", "portefeuille", "categories-depenses", "depenses", "notifications", "rapports", "parametres", "utilisateurs")
$subfolders = @("models", "services", "pages", "components", "routes")

# Création des dossiers de base
foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) { New-Item -Path $dir -ItemType Directory -Force }
}

# Création des dossiers pour chaque feature
foreach ($f in $features) {
    foreach ($sub in $subfolders) {
        $path = "$base/features/$f/$sub"
        if (!(Test-Path $path)) { New-Item -Path $path -ItemType Directory -Force }
    }
}
Write-Host "Arborescence créée avec succès dans c:\Users\Kouadio Ferdinand\Desktop\ANGULAR\tontine\e-tontine\" -ForegroundColor Green