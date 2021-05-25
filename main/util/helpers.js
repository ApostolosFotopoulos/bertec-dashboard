const fs = require('fs')

function writeFileSyncRecursive(filename, content, charset) {
  let filepath = filename.replace(/\\/g,'/');  

  let root = '';
  if (filepath[0] === '/') { 
    root = '/'; 
    filepath = filepath.slice(1);
  } 
  else if (filepath[1] === ':') { 
    root = filepath.slice(0,3);   // c:\
    filepath = filepath.slice(3); 
  }

  const folders = filepath.split('/').slice(0, -1);
  folders.reduce(
    (acc, folder) => {
      const folderPath = acc + folder + '/';
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }
      return folderPath
    },
    root // first 'acc', important
  ); 
  
  fs.writeFileSync(root + filepath, content, charset);
}

module.exports = {
  writeFileSyncRecursive
}