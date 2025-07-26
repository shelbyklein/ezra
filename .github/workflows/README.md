# GitHub Actions Workflows

This directory contains GitHub Actions workflows for continuous integration and deployment.

## Workflows

### 🧪 CI (ci.yml)
**Triggers:** Push to main/develop, Pull requests
**Purpose:** Run tests, linting, and build checks

- Matrix testing on Node 18.x and 20.x
- Frontend and backend linting
- TypeScript type checking
- Jest tests with coverage reports
- Build verification
- Security audit

### 🚀 Deploy (deploy.yml)
**Triggers:** Push to main, Manual dispatch
**Purpose:** Deploy to production

- Runs full test suite
- Builds production artifacts
- Deployment steps (customizable based on provider)
- Slack notifications

### ✅ PR Check (pr-check.yml)
**Triggers:** Pull request events
**Purpose:** Automated PR validation

- Auto-labeling based on file changes
- PR size labeling
- Semantic PR title validation
- Test coverage reporting

### 🎨 Code Quality (code-quality.yml)
**Triggers:** Push, PR, Weekly schedule
**Purpose:** Maintain code quality

- ESLint with annotations
- Prettier formatting check
- TypeScript validation
- Bundle size analysis

## Required Secrets

Add these secrets to your repository settings:

### Essential
- `GITHUB_TOKEN` - Automatically provided by GitHub

### Optional (for deployment)
- `VITE_API_URL` - Production API URL
- `PRODUCTION_API_URL` - Backend API URL for production
- `SLACK_WEBHOOK` - Slack webhook for notifications

### Provider-specific (examples)
- `VERCEL_TOKEN` - For Vercel deployment
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `AWS_ACCESS_KEY_ID` - AWS credentials
- `AWS_SECRET_ACCESS_KEY` - AWS credentials

## Configuration Files

### .github/labeler.yml
Configures automatic PR labeling based on file paths.

### .github/dependabot.yml
Configures automated dependency updates:
- Weekly updates for npm packages
- Separate PRs for frontend/backend
- Auto-assigns reviewers
- Adds appropriate labels

## Running Locally

To test workflows locally, use [act](https://github.com/nektos/act):

```bash
# Install act
brew install act

# Run CI workflow
act -W .github/workflows/ci.yml

# Run specific job
act -j test -W .github/workflows/ci.yml
```

## Customization

### Adding Deployment Steps

Edit `deploy.yml` and uncomment/add your deployment provider:

```yaml
# For Vercel (Frontend)
- name: Deploy Frontend to Vercel
  uses: amondnet/vercel-action@v20
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
    working-directory: ./frontend
```

### Modifying Test Coverage Threshold

Edit `pr-check.yml`:

```yaml
- name: Coverage report
  uses: ArtiomTr/jest-coverage-report-action@v2
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    threshold: 80  # Change this value
```

### Adding New Labels

Edit `.github/labeler.yml` to add new label rules:

```yaml
new-feature:
  - frontend/src/components/NewFeature/**/*
```