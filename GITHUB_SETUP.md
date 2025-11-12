# GitHub Setup Guide

This guide will help you push the Agent Teaching Platform to GitHub.

## 📋 Prerequisites

- Git installed on your machine
- GitHub account
- SSH key or Personal Access Token configured

## 🚀 Quick Start

### Step 1: Create a New Repository on GitHub

1. Go to [github.com](https://github.com)
2. Click the "+" icon in the top right → "New repository"
3. Fill in the details:
   - **Repository name:** `agent-teaching-platform`
   - **Description:** "A comprehensive teaching management system powered by AI agents"
   - **Visibility:** Public or Private (your choice)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click "Create repository"

### Step 2: Push to GitHub

The repository is already initialized with Git. Just add your remote and push:

```bash
# Navigate to the project directory
cd agent-teaching-platform

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/agent-teaching-platform.git

# Or use SSH (recommended)
git remote add origin git@github.com:YOUR_USERNAME/agent-teaching-platform.git

# Verify remote
git remote -v

# Push to GitHub
git push -u origin master

# Or if you want to use 'main' as the default branch
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3: Verify

1. Refresh your GitHub repository page
2. You should see all the files uploaded
3. The README.md will be displayed on the repository homepage

## 🔐 Authentication Methods

### Option 1: HTTPS with Personal Access Token

If you're using HTTPS, you'll need a Personal Access Token:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name and select scopes: `repo` (full control of private repositories)
4. Click "Generate token"
5. **Copy the token** (you won't see it again!)
6. When pushing, use the token as your password

```bash
git push -u origin master
# Username: YOUR_USERNAME
# Password: YOUR_PERSONAL_ACCESS_TOKEN
```

### Option 2: SSH (Recommended)

If you haven't set up SSH keys:

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Start ssh-agent
eval "$(ssh-agent -s)"

# Add SSH key
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub
```

Then add the public key to GitHub:
1. Go to GitHub Settings → SSH and GPG keys
2. Click "New SSH key"
3. Paste your public key
4. Click "Add SSH key"

## 📝 Making Changes

After the initial push, you can make changes and push them:

```bash
# Make your changes to files

# Stage changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push
```

## 🌿 Branching Strategy

### Create a new branch for features

```bash
# Create and switch to new branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push branch to GitHub
git push -u origin feature/new-feature
```

### Create a Pull Request

1. Go to your repository on GitHub
2. Click "Pull requests" → "New pull request"
3. Select your feature branch
4. Click "Create pull request"
5. Add description and submit

## 🏷️ Tagging Releases

```bash
# Create a tag
git tag -a v1.0.0 -m "Version 1.0.0 - Initial release"

# Push tag to GitHub
git push origin v1.0.0

# Or push all tags
git push --tags
```

## 📦 Repository Settings

### Add Topics

1. Go to your repository on GitHub
2. Click the gear icon next to "About"
3. Add topics: `react`, `vite`, `education`, `teaching-platform`, `ai`, `tailwindcss`

### Add Description

Add this description to your repository:
```
A comprehensive teaching management system powered by AI agents. Built with React, Vite, Tailwind CSS, and modern web technologies. Features course management, discussions, homework, quizzes, and AI-powered content generation.
```

### Enable GitHub Pages (Optional)

If you want to deploy via GitHub Pages:

1. Go to Settings → Pages
2. Source: Deploy from a branch
3. Branch: `gh-pages` (after running `pnpm run deploy`)
4. Click Save

## 🔗 Useful Git Commands

```bash
# Check status
git status

# View commit history
git log --oneline

# View remote repositories
git remote -v

# Pull latest changes
git pull

# Clone your repository (on another machine)
git clone https://github.com/YOUR_USERNAME/agent-teaching-platform.git

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# View differences
git diff

# Stash changes
git stash
git stash pop
```

## 🤝 Collaboration

### Add Collaborators

1. Go to Settings → Collaborators
2. Click "Add people"
3. Enter GitHub username or email
4. Send invitation

### Protect Main Branch

1. Go to Settings → Branches
2. Click "Add rule"
3. Branch name pattern: `main` or `master`
4. Enable:
   - Require pull request reviews before merging
   - Require status checks to pass before merging
5. Save changes

## 📊 GitHub Actions (CI/CD)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install pnpm
      run: npm install -g pnpm
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Build
      run: pnpm run build
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## 🐛 Troubleshooting

### Large Files

If you have files larger than 100MB:

```bash
# Use Git LFS
git lfs install
git lfs track "*.zip"
git add .gitattributes
git commit -m "Add Git LFS"
```

### Authentication Failed

```bash
# Update remote URL
git remote set-url origin https://github.com/YOUR_USERNAME/agent-teaching-platform.git

# Or use SSH
git remote set-url origin git@github.com:YOUR_USERNAME/agent-teaching-platform.git
```

### Push Rejected

```bash
# Pull latest changes first
git pull origin master --rebase

# Then push
git push origin master
```

## 📚 Additional Resources

- [GitHub Documentation](https://docs.github.com)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Desktop](https://desktop.github.com/) - GUI alternative

---

**Happy coding! 🚀**

