const fs = require('fs');
const appDir = require('path').dirname(require.main.filename);
const constants = require(`${appDir}/constants`);
const dir = `${appDir}/db`;

if (!fs.existsSync(dir)) fs.mkdirSync(dir);

const fileName = `${dir}/${constants.fileName}` || `${dir}/default.json`;

module.exports = {
    fileName,
    readFile: function(callback) {
        fs.readFile(this.fileName, 'utf8', function readFileCallback(err, data) {
            if (err) {
                data = {};
                data.users = [];
                callback(data);
            } else {
                try {
                    data = JSON.parse(data);
                } catch (err) {
                    data = {};
                    data.users = [];
                }

                callback(data);
            }
        });
    },
    writeFile: function(jsonDataToWrite, callback) {
        fs.writeFile(this.fileName, JSON.stringify(jsonDataToWrite, null, 2), 'utf8', callback);
    }
}
