# Contributing to Rural Blood Bank 🩸

First off, thank you for considering contributing to the Rural Blood Bank project! It's people like you that make this a valuable tool for rural communities.

## 🌈 How Can I Contribute?

### Reporting Bugs
- Check the [Issues Tab](https://github.com/3s-Soft/bloodbank/issues) to see if the bug has already been reported.
- If not, open a new issue using the **Bug Report** template.
- Include as much detail as possible: steps to reproduce, expected vs actual behavior, and screenshots.

### Suggesting Enhancements
- Open a new issue using the **Feature Request** template.
- Explain the "why" behind the feature and how it benefits the users.

### Pull Requests
1. **Fork** the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Use **Conventional Commits** for your messages:
   - `feat: add new donor filter`
   - `fix: resolve crash on login`
   - `docs: update readme with docker instructions`
   - `style: fix formatting in navbar`
   - `refactor: simplify auth logic`

## 💻 Technical Stack & Style

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State/Form**: React Hook Form + Zod
- **Icons**: Lucide React

### Code Style Guidelines
- Use functional components with arrow functions.
- Follow the existing folder structure.
- Keep components focused and small.
- Use meaningful variable and function names.
- Document complex logic with comments.

## 🚀 Setting Up Your Environment

1. Fork and clone the repository.
2. Copy `.env.example` to `.env.local` and fill in the values.
3. Install dependencies: `npm install`.
4. Seed the database (optional): `npx tsx scripts/seed.ts`.
5. Run the dev server: `npm run dev`.

---

By contributing, you agree that your contributions will be licensed under the **MIT License**.
