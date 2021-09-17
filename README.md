# shibawars

Branches:

main - production branch<br>
develop - stable version

new features are developed in new branches or forked repositories

HOW TO USE SMART CONTRACTS:<br>
1. download and install ganache https://www.trufflesuite.com/ganache<br>
2. setup a workspace in ganache<br>
3. add custom RPC (ganache) to your metamask or other wallet - prefer to use chain id 1337 for now<br>
4. npm install --g truffle (probably should be in node package but idk)<br>
5. run ganache and your workspace<br>
6. truffle migrate --reset -> this will deploy the smart contracts<br>
7. in .env.local update addresses for smart contracts - ShibaInu, Leash and Floki only needs to be deployed once - uncomment in migration and log the addresses<br>
8. npm run dev<br>
9. switch to ganache network and add accounts from ganache to metamask<br>
10. have fun<br>
