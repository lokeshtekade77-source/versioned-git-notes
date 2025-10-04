# Note 1: Introduction to Git & GitHub

## What is Git?
Git is a **distributed version control system** designed to track changes in source code during software development. It allows multiple developers to work together on the same project without overwriting each other's work.

## What is GitHub?
GitHub is a **web-based hosting service** for Git repositories. It provides a central place to store your code, collaborate with others, track issues, and manage projects.

## Basic Workflow
Here is the most common sequence of commands for a new project.

1.  **Initialize a Repository**
    This creates a new `.git` directory in your project folder.
    ```bash
    git init
    ```

2.  **Add Files to Staging**
    This stages all new or modified files for the next commit.
    ```bash
    git add .
    ```

3.  **Commit Changes**
    This saves a snapshot of the staged files to your project's history.
    ```bash
    git commit -m "First commit"
    ```

4.  **Connect to a Remote Repository**
    This links your local repository to a remote one on GitHub.
    ```bash
    git remote add origin [https://github.com/USERNAME/REPO.git](https://github.com/USERNAME/REPO.git)
    ```

5.  **Push Changes**
    This uploads your committed changes to the remote repository.
    ```bash
    git push -u origin main
    ```