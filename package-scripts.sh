#!/bin/zsh

# Check if the 'fzf' command is available in the system
if ! command -v fzf &> /dev/null; then
    tput setaf 1;
    echo "fzf is not installed. <https://github.com/junegunn/fzf>";
    tput sgr0;
    exit 1;
fi

local option_list=(
    "format-fix:           Fixes the code format"
    "format-check:         Checks the code format"
    "lint-fix:             Fixes the code lint"
    "lint-check:           Checks the code lint"
    "build:                Builds the project"
    # "build-cjs:            Builds the CommonJS project"
    # "build-esm:            Builds the ESModule project"
    "minify:               Minifies the project"
    # "minify-cjs:           Minifies the CommonJS project"
    # "minify-esm:           Minifies the ESModule project"
    "dev:                  Starts the development server"
    # "test:                 Runs the tests"
    "test-coverage:        Runs the tests and generates the coverage report"
    # "clean-all:            Cleans the project"
    # "clean-jest:           Cleans the jest cache"
    # "clean-coverage:       Cleans the coverage report"
    # "clean-dist:           Cleans the dist directory"
    # "clean-cache:          Cleans the cache"
    "modules-reinstall:    Cleans the modules"
    # "modules-clean:        Cleans the modules"
    "pre-publish-only:     Pre-publishes the project"
    "post-publish:         Post-publishes the project"
    "reflect-toc:          Reflects the TOC"
    "typedoc:              Generates the typedoc"
    "all:                  Runs all the jobs"
    "setup:                Setup modules"
)

local selected_option=$(printf "%s\n" "${option_list[@]}" | fzf --ansi --prompt="Select a job to execute > ")

case $selected_option in
    "setup")
        corepack enable pnpm;
        pnpm -v;
        pnpm install;
        ;;
    *)
        if [[ -n "$selected_option" && "$selected_option" =~ [^[:space:]] ]]; then
            command="pnpm $(echo "$selected_option" | cut -d':' -f1)"
            eval $command;
        fi;
        ;;
esac

exit 0;
