git pull --rebase --autostash

rm -f build

npm run build

cp .env build/