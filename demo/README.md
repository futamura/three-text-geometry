# Getting Started with Demo

This demo project works with [Vite](https://github.com/vitejs/vite).

## Clone the repository

```
git clone https://github.com/futamura/three-text-geometry.git
cd three-text-geometry/demo
```

## Install dependencies

Setup pnpm and install dependencies

```
corepack enable
pnpm -v
pnpm install
```

## Available Commands

In the project directory, you can run:

### `pnpm dev`
Runs the application in development mode. It enables hot reloading, allowing you to see changes in real-time. Open [http://localhost:5173/](http://localhost:5173/) to view the application in your browser.

### `pnpm build`
Builds the application for production. It optimizes the build for the best performance and outputs the files to the `build` directory. The build is minified, and the filenames include hashes for better caching.

### `pnpm lint`
Runs the linter to check for code quality and style issues. It helps ensure that the code adheres to the defined coding standards and best practices.

### `pnpm preview`
Serves the production build locally for previewing. This command allows you to test the production build before deploying it to ensure everything works as expected.


### Fuzzy Commands

This script is used to automate the setup and configuration of the project environment. It includes commands for `pnpm build`, `pnpm dev`, `pnpm lint`, `pnpm preview`, and `setup demo`.

\* You need to have [Fuzzy Finder](https://github.com/junegunn/fzf) installed to run this script.

```
chmod +x package-scripts.sh
./package-scripts.sh
```


## Learn More

You can learn more in the [Vite Official Documentation](https://vitejs.dev/guide/).

To learn React, check out the [React Official Documentation](https://react.dev/reference/react).
