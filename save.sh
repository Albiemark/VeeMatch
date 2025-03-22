#!/bin/bash

# save.sh - A script to automate git commit and push

# Default commit message
DEFAULT_MESSAGE="Update project files"

# Get commit message from argument or use default
if [ -n "$1" ]; then
  COMMIT_MESSAGE="$1"
else
  COMMIT_MESSAGE="$DEFAULT_MESSAGE"
fi

# Check if specific files are provided as arguments (all arguments after the first one)
if [ $# -gt 1 ]; then
  # Get all arguments except the first one (which is the commit message)
  shift
  FILES_TO_ADD="$@"
  
  echo "Staging specific files: $FILES_TO_ADD"
  git add $FILES_TO_ADD
else
  # If no specific files, ask if user wants to stage all changes
  read -p "Stage all changes? (y/n): " STAGE_ALL
  
  if [[ $STAGE_ALL == "y" || $STAGE_ALL == "Y" ]]; then
    echo "Staging all changes..."
    git add -A
  else
    echo "Showing changed files:"
    git status -s
    
    # Ask for files to stage
    read -p "Enter files to stage (separate with spaces, or '.' for all): " FILES_TO_ADD
    
    if [ "$FILES_TO_ADD" == "." ]; then
      git add -A
    else
      git add $FILES_TO_ADD
    fi
  fi
fi

# Show what's being committed
echo "Changes to be committed:"
git status -s

# Ask for confirmation
read -p "Commit with message: '$COMMIT_MESSAGE' and push? (y/n): " CONFIRM

if [[ $CONFIRM == "y" || $CONFIRM == "Y" ]]; then
  # Commit changes
  git commit -m "$COMMIT_MESSAGE"
  
  # Push to remote
  echo "Pushing to remote..."
  git push
  
  echo "Done! Changes committed and pushed successfully."
else
  echo "Operation cancelled. Changes are still staged but not committed."
fi 