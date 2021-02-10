# toduseame-cli

Command line app/interface for handle downloads from s3.todus.cu supporting pause/break/interruptions/resume

## Install

yarn:	`yarn add global https://github.com/daroxs95/toduseame-cli`

npm:	`npm install -g https://github.com/daroxs95/toduseame-cli`

## How to use (Examples)
### From file containing links and names list (txt file)
Download file from telegram channels/groups that contains info of file to download(like the `test download` file in this repo).
```
toduseame -f path_to_file -o D:\misdescargas
```
The `-o` parameter is not necessary, by default it creates a folder `toduseame` in Downloads directory.

### From direct link ( `https://s3.todus.cu/...`)
```
toduseame -l https://s3.todus.cu/.../somestring -n name.ext
```

The `-n` parameter is not necessary, but recommended, by default it gets the name of file from the url and downloads it to `Downloads/toduseame/somestring/somestring` .

### Context menu
For windows, execute(add to registry) `context_menu.reg`(the file is inside this repo), now you can try to download any file("txt" file containing links and names lists), by right clicking file + click on `Toduseame here`, this will download to the very same folder you are working on.