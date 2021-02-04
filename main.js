#!/usr/bin/env node

//import pkg from 'potato_dm'
//import fs from 'fs'
//import yargs from "yargs"

const PotatoDM = require('potato_dm').PotatoDM;
const get_headers = require('potato_dm').get_headers;
const fs = require('fs');
const yargs = require('yargs');
const path = require('path');



//multiplatform fail-safe
//const default_download_path = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")

const default_download_path = process.env.HOME + '/Downloads/toduseame'
const allowed_hosts = ['s3.todus.cu'];
const test_internet_endpoint = "https://web.telegram.org/";
const headers_extra = {
    //"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    /*"accept-language": "es-ES,es;q=0.9,en;q=0.8",
    "cache-control": "max-age=0",
    "sec-ch-ua": "\"Google Chrome\";v=\"87\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"87\"",
    "sec-ch-ua-mobile": "?0",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    "sec-gpc": "1",
    "upgrade-insecure-requests": "1",
    "User-Agent": "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36"*/
};

const options = yargs
    .usage("Usage: -f <file_name> -o <output> \n\tor\n       -l <download_link> -o <output> -n <name> ")
    .option("f", { alias: "file", describe: "File to download from todus-s3", type: "string", demandOption: false })
    .option("B", { alias: "BYPASS", describe: "Ignores bug warnings and tries to download", type: "boolean", demandOption: false })
    .option("l", { alias: "link", describe: "Link to download from todus-s3", type: "string", demandOption: false })
    .option("n", { alias: "name", describe: "Rename downloaded file to this", type: "string", demandOption: false })
    .option("o", { alias: "output", describe: "Folder path to store downloads from todus-s3", type: "string", demandOption: false, default: default_download_path })
    .argv;

if (!options.file && !options.link) {
    console.log("\nMissing file and link parameter, please specify either `-l` or `-f`  ");
    return -1;
};

if (!options.name && options.link) {
    options.name = path.basename(options.link);
    console.log("No name specified, downloading as: " + options.name)
};

let headers = get_headers(test_internet_endpoint, [], 10000)
    .then(() => {
        main();
    }, () => {
        if (options.BYPASS) {
            main();
        } else {
            console.log('\nIt appears that you cannot connect to internet, \nthere is a bug that maybe make you lose mobile data \nwhen using `s3.todus.cu` without proper internet connection, \nif you want to ignore it use the option `-B` ');
        }
    }).finally(() => {

    });

function main() {
    try {
        let download_pieces;
        if (options.file) {
            // read contents of the file
            const data = fs.readFileSync(options.file, 'UTF-8');
            // split the contents by new line
            download_pieces = data.split(/\r?\n/);
        } else if (options.link) {
            download_pieces = [options.link + "\t" + options.name];
        }


        //download each piece
        download_pieces.forEach((line, index) => {
            //avoid empty lines
            if (line == "") return;

            // split the contents by space
            //let first_tab = line.indexOf("\t");
            //let url = line.substring(0, first_tab);
            //let name = line.substring(first_tab + 1);
            let [url, name] = line.split('\t');

            const my_dm = new PotatoDM(url, options.output + "/" + name.split('.')[0], { file_name: name, check_integrity: false, allowed_redirect_hosts: allowed_hosts, extra_headers: headers_extra, timeout: 100000 });

            my_dm.on('end', (downloaded_url, downloaded_file_path) => {
                console.log("\ndownloaded: " + downloaded_url + " to: " + downloaded_file_path);
            });

            my_dm.on('data_chunk', (progress) => {
                process.stdout.write('\r');
                for (let i = 0; i < index; i++) {
                    //process.stdout.write('\n');
                }
                process.stdout.write('Progress:' + progress + '%');
            })


            my_dm.on('error', (error, msg) => {
                console.log(error);
                console.log(url);
            })

            my_dm.on('timeout', (msg) => {
                console.log(msg);
                console.log(url);
            })

            my_dm.on('warning', (warning, msg) => {
                console.log(warning);
            })

            my_dm.on('check_integrity_end', (data) => {
                data.pass ? console.log('file is correct') : console.log("incorrect file, please redownload a fresh version");
            })

            my_dm.on('already_exists_resuming', (msg) => {
                console.log(msg);
            })

            my_dm.on('already_exists_restanting', (msg) => {
                console.log(msg);
            })

            my_dm._try_download().then({
                onfulfilled: () => {
                    //console.log('done from main, promise based, fulfilled')
                    //if (this.check_integrity) this._check_integrity();
                },
                onrejected: () => {
                    //console.log('done from main, promise based, rejected')
                    //if (this.check_integrity) this._check_integrity();
                }
            }).catch((error) => {
                console.log(error);
            }).finally(() => {
                //console.log('done from main, promise based, finally')
                //if (this.check_integrity) this._check_integrity();
            });
        });
    } catch (err) {
        console.error(err);
    }
};