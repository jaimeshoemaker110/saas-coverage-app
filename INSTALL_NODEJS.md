# Node.js Installation Instructions for macOS

## Step 1: Install Homebrew (if not already installed)

Open Terminal and run:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

## Step 2: Install Node.js using Homebrew

```bash
brew install node
```

## Step 3: Verify Installation

After installation completes, verify Node.js and npm are installed:
```bash
node --version
npm --version
```

You should see version numbers for both commands.

## Alternative: Download Node.js Installer

If you prefer not to use Homebrew:

1. Visit https://nodejs.org/
2. Download the macOS installer (LTS version recommended)
3. Run the installer and follow the prompts
4. Restart your terminal
5. Verify installation with `node --version` and `npm --version`

## Next Steps

Once Node.js is installed:

1. Open a new terminal window (important - to load the new PATH)
2. Navigate to the project directory:
   ```bash
   cd /Users/jaimeshoemaker/Desktop/saas-coverage-app
   ```
3. Let me know when you're ready, and I'll continue with the application setup!

## Troubleshooting

If `node` or `npm` commands are not found after installation:
- Close and reopen your terminal
- Check if Homebrew's bin directory is in your PATH: `echo $PATH`
- You may need to add Homebrew to your PATH (the installer usually does this automatically)