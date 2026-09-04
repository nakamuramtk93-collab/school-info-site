import os
import re
import glob

NOCACHE_TAGS = '''  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">'''

base_dir = os.path.dirname(os.path.abspath(__file__))
html_files = glob.glob(os.path.join(base_dir, "*.html"))

for path in sorted(html_files):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'Cache-Control' in content:
        print(f"Skip (already patched): {os.path.basename(path)}")
        continue

    # charset の直後に挿入
    new_content = re.sub(
        r'(<meta charset="UTF-8">)',
        r'\1\n' + NOCACHE_TAGS,
        content,
        count=1
    )

    if new_content == content:
        print(f"WARNING: no charset tag in {os.path.basename(path)}")
        continue

    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Updated: {os.path.basename(path)}")

print("Done!")
