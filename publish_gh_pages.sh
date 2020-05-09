#!/bin/bash
# Publish to gh-pages branch.
set -e
set -u

cleanup()
{
    git checkout master
}
trap cleanup 0

git fetch
cp .gitignore .gitignore.bak
git checkout -B gh-pages origin/gh-pages
git ls-files | xargs  rm -f

mv .gitignore.bak .gitignore
cp -rf dist/* .

DATE=`date`
git add --all && git commit -am "Build at ${DATE}"
git push origin gh-pages
git checkout master
echo "Finish deployment at ${DATE}"
