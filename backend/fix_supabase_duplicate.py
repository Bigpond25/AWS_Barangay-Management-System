with open('app/Services/SupabaseStorageService.php', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove duplicate Log import
lines = content.split('\n')
new_lines = []
log_seen = False

for line in lines:
    if 'use Illuminate\\Support\\Facades\\Log;' in line:
        if not log_seen:
            new_lines.append(line)
            log_seen = True
    else:
        new_lines.append(line)

with open('app/Services/SupabaseStorageService.php', 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))

print("Fixed SupabaseStorageService.php")
