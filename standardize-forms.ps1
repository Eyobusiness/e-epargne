# Script pour uniformiser tous les fichiers CSS des formulaires
# Ce script standardise les styles et utilise les variables CSS globales

$formsCssFiles = @(
  "src\app\features\adherents\components\adherent-form\adherent-form.component.css",
  "src\app\features\adherents\components\document-form\document-form.component.css",
  "src\app\features\cotisation-adherents\components\cotisation-adherent-form\cotisation-adherent-form.component.css",
  "src\app\features\cotisations\components\cotisation-form\cotisation-form.component.css",
  "src\app\features\depenses\components\categorie-depense-form\categorie-depense-form.component.css",
  "src\app\features\depenses\components\depense-form\depense-form.component.css",
  "src\app\features\groupes\components\affectation-adherent-form\affectation-adherent-form.component.css",
  "src\app\features\groupes\components\groupe-form\groupe-form.component.css",
  "src\app\features\operations\components\operation-form\operation-form.component.css",
  "src\app\features\parametres\components\parametre-form\parametre-form.component.css",
  "src\app\features\profil\components\profil-form\profil-form.component.css",
  "src\app\features\utilisateurs\components\utilisateur-form\utilisateur-form.component.css"
)

$standardCss = @"
/* Standardized Form Component */

.form-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.form-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-xl);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-group.full-width {
  grid-column: 1 / -1;
}

label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

input,
select,
textarea {
  width: 100%;
  padding: var(--space-md) var(--space-lg);
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-family: var(--font-family);
  color: var(--text-primary);
  background: white;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px rgba(26, 52, 92, 0.1);
}

input::placeholder,
textarea::placeholder {
  color: var(--text-light);
}

input.invalid,
select.invalid,
textarea.invalid {
  border-color: var(--danger-color);
  background-color: var(--danger-light);
}

textarea {
  min-height: 120px;
  resize: vertical;
}

.form-error {
  color: var(--danger-color);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-lg);
  padding-top: var(--space-xl);
  border-top: 1px solid var(--border-color);
}

.btn-submit,
.btn-primary {
  min-width: 120px;
  height: 44px;
  border: none;
  border-radius: var(--radius-lg);
  background: var(--primary-color);
  color: var(--text-white);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: background-color var(--transition-base), transform var(--transition-fast), box-shadow var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  box-shadow: var(--shadow-sm);
}

.btn-submit:hover:not(:disabled),
.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.btn-submit:active:not(:disabled),
.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-submit:disabled,
.btn-primary:disabled {
  background: var(--gray-400);
  cursor: not-allowed;
  opacity: 0.8;
}

.btn-cancel,
.btn-secondary {
  min-width: 100px;
  height: 44px;
  border: 1.5px solid var(--border-color);
  border-radius: var(--radius-lg);
  background: white;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: background-color var(--transition-base), border-color var(--transition-base);
}

.btn-cancel:hover:not(:disabled),
.btn-secondary:hover:not(:disabled) {
  background: var(--gray-50);
  border-color: var(--gray-300);
}

.btn-cancel:disabled,
.btn-secondary:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.loading-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin var(--transition-slower) linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .form-content {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-submit,
  .btn-primary,
  .btn-cancel,
  .btn-secondary {
    width: 100%;
    min-width: auto;
  }
}
"@

foreach ($file in $formsCssFiles) {
  $fullPath = Join-Path (Get-Location) $file
  if (Test-Path $fullPath) {
    Set-Content -Path $fullPath -Value $standardCss -Encoding UTF8
    Write-Host "[OK] Updated: $file"
  } else {
    Write-Host "[SKIP] Not found: $file"
  }
}

Write-Host "`n[DONE] All form CSS files have been standardized!"
