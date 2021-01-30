#!/usr/bin/env node

//import pkg from 'potato_dm'
//import fs from 'fs'
//import yargs from "yargs"

const pkg = require('potato_dm');
const fs = require('fs');
const yargs = require('yargs');

const { PotatoDM } = pkg

//multiplatform fail-safe
//const default_download_path = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")

const default_download_path = process.env.HOME + '/toduseame'

const options = yargs
    .usage("Usage: -f <name> -o <output>")
    .option("f", { alias: "file", describe: "File to download from todus-s3", type: "string", demandOption: true })
    .option("o", { alias: "output", describe: "Folder path to store downloads from todus-s3", type: "string", demandOption: false, default: default_download_path })
    .argv;

try {
    // read contents of the file
    const data = fs.readFileSync(options.file, 'UTF-8');

    // split the contents by new line
    const download_pieces = data.split(/\r?\n/);

    //download each piece
    download_pieces.forEach((line, index) => {
        //avoid empty lines
        if (line == "") return;

        // split the contents by space
        //let first_tab = line.indexOf("\t");
        //let url = line.substring(0, first_tab);
        //let name = line.substring(first_tab + 1);
        let [url, name] = line.split('\t');

        const my_dm = new PotatoDM(url, options.output + "/" + name.split('.')[0], { file_name: name, check_integrity: false });

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

        my_dm.on('check_integrity_end', (data) => {
            data.pass ? console.log('file is correct') : console.log("incorrect file, please redownload a fresh version");
        })

        my_dm.on('already_exists_resuming', (msg) => {
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
            console.log(error)
        }).finally(() => {
            //console.log('done from main, promise based, finally')
            //if (this.check_integrity) this._check_integrity();
        });
    });
} catch (err) {
    console.error(err);
}