## 📄 `notes/note3.md`
```markdown
# Note 3: Git Tags & Versioning

## What are Tags?
- Tags are used to mark **specific versions** of a project.
- Useful for releases (v1.0, v2.0, etc.).

## Creating a Tag


git tag -a v1.0 -m "Version 1.0 release"


Viewing Tags
git tag

Pushing Tags to GitHub
git push origin v1.0


Deleting a Tag
Locally:
git tag -d v1.0


Remotely:

git push --delete origin v1.0