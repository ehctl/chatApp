const fs = require('fs')

var reader = new FileReader();
reader.onload = function(e) {
    let t = e.target.result;
    let buff = Buffer.from(t,'utf8')
    fs.writeFileSync('D:\\js\\server\\upload\\avatar\\default', buff.toString())

}
reader.readAsArrayBuffer('./layout/cat.png')