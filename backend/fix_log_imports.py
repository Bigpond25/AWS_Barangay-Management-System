import os
import re

files = [
    "app/Models/Appointment.php",
    "app/Models/BarangayOfficial.php",
    "app/Models/Complaint.php",
    "app/Models/DataConsent.php",
    "app/Models/Document.php",
    "app/Models/Household.php",
    "app/Models/Project.php",
    "app/Models/ProjectMilestone.php",
    "app/Models/ProjectTeamMember.php",
    "app/Providers/AppServiceProvider.php",
    "app/Services/SupabaseStorageService.php",
    "app/Traits/LogsActivity.php"
]

log_import = "use Illuminate\\Support\\Facades\\Log;"

for file_path in files:
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if import already exists
    if log_import in content:
        print(f"Already has import: {file_path}")
        continue
    
    # Find namespace and add import after it
    pattern = r'(namespace [^;]+;)'
    
    if re.search(pattern, content):
        # Add import after namespace
        new_content = re.sub(
            pattern,
            r'\1\n\nuse Illuminate\\Support\\Facades\\Log;',
            content,
            count=1
        )
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"✓ Fixed: {file_path}")
    else:
        print(f"⚠ Could not find namespace in: {file_path}")

print("\nDone!")
