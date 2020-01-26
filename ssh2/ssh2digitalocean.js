// Home version -- connect to Digital Ocean Using keys

// Adapted from
// https://ourcodeworld.com/articles/read/133/how-to-create-a-sftp-client-with-node-js-ssh2-in-electron-framework

// Useage: Prints directories by default.  Reads and writes if r or w options at CLI
// To download a file:    
// node rwd-ssh2.js r  localpath.txt    remotepath.txt
// To upload a file:    
// node rwd-ssh2.js w  localpath.txt    remotepath.txt

require('dotenv').config(); // get environmental variables

const Client = require('ssh2').Client;
const remotePathToList = '/Development/';
let whichDir = "./inbox";
const connSettings = {
     host: process.env.EVAN_HOST,
     port: 22, // Normal is 22 port
     username: process.env.EVAN_USER,
     passphrase: process.env.EVAN_PASSPHRASE,
     privateKey: require('fs').readFileSync(process.env.EVAN_KEY),
     // You can use a key file too, read the ssh2 documentation
};



const conn = new Client();
if ('undefined' === process.argv[2] || !['r', 'w'].includes(process.argv[2]) ){
    process.argv[2] = 'd';
}
switch (process.argv[2]) {


/////////////////////////////////////////////////////////////
case 'd': 
    conn.on('ready', function() {
        console.log('Client :: ready, especially for Mister [' + process.env.EVAN_USER + ']');
        conn.sftp(function(err, sftp) {            
            if (err) throw err;
            sftp.readdir(whichDir, function(err, list) {
                if (err) throw err;
                // List the directory in the console
                console.log(`Length of filesarray is [${list.length -1}] and type is ${typeof list}.`);
                console.dir(Object.keys(list) );
                for (let i = list.length -1, stringI = '', todo1 = 16; i >= 0; i--){
                    console.log('NUMBER ' + i + '___');
                    // console.log(`By the way, type of your index [` + i + `] is ${typeof i} and type of your TODO1 [$todo1] is ${typeof todo1}`);
                    // console.log(`Are todo1 [${todo1}] and i [${i}] deeply identical? Result [${todo1 === i}]`);
                    // console.log(`Are todo1 [${todo1}] and i [${i}] coercively truthy-similar? Result [${todo1 == i}]`);
                    // // console.dir(list[todo1]);
                    // console.log('WITH TODO1: mdate ' + list[todo1].attrs.mtime + ' & filename: ' + list[todo1].filename );
                    console.log('WITH i: mdate ' + Date(list[i].attrs.mtime) + ' & filename: ' + list[i].filename );

                }
                // Do not forget to close the connection, otherwise you'll get troubles
                conn.end();
            });
                console.log(`...Ta Ta ${process.env.EVAN_USER}.`);
        });
    }).connect(connSettings);
    break;


/////////////////////////////////////////////////////////////
case 'w':
    conn.on('ready', () => {
         conn.sftp(function(err, sftp) {
            if (err) throw err;
            console.log(`Hello ${process.env.EVAN_USER}...`);
            distalpath = whichDir + process.argv[4];  
            localpath = process.argv[3];
            console.log(`Get from ${localpath}...`);
            console.log(`Write to ${distalpath}...`);

            const fs = require('fs');
            const readStream  = fs.createReadStream(localpath);
            const writeStream = sftp.createWriteStream(distalpath);

            writeStream.on('close',function () {
                console.log( "- file transferred succesfully" );
                conn.end();
            });

            // process seems to still work if you comment out the following:
            writeStream.on('end', function () {
                console.log( "sftp connection closed" );
            });

            // initiate transfer of file
            readStream.pipe( writeStream );
            
        });
    }).connect(connSettings);
    break;


/////////////////////////////////////////////////////////////
case 'r':
    conn.on('ready', function() {
        conn.sftp(function(err, sftp) {
            if (err) throw err;
            distalpath = whichDir + process.argv[4];  
            localpath = process.argv[3];
            console.log(`Download.\nGet from ${distalpath}...`);
            console.log(`Write to ${localpath}...`);
            // const moveFrom = "/remote/file/path/file.txt";
            // const moveTo = "/local/file/path/file.txt";

            sftp.fastGet(distalpath, localpath , {}, function(downloadError){
                if(downloadError) throw downloadError;
                console.log("Succesfully (up?)loaded");
            });
        });
    }).connect(connSettings);
    break;


/////////////////////////////////////////////////////////////
    default:
        console.log(`Should never see this.`);// todo
}



