const path = require('path');
const multer = require('multer');
var fs = require('fs');
var sloc = require('sloc');
const node_sloc = require('node-sloc')

const storage = multer.diskStorage(
    {
        destination: './public/uploads',
        filename: function (req, file, cb) {
            const file_name = "sloc_file" + '_' + Date.now() + path.extname(file.originalname);
            console.log("shit")
            cb(null, file_name);
        }
    }
);

upload = multer({
    storage: storage,
    limits: {fileSize: (1024 * 1024) * 200},
    fileFilter: function (req, file, cp) {
        checkForType(cp, file);
    }
}).single('sloc_file');


function checkForType(cp, file) {
    console.log("CHECK ")
    const type = /jpeg|png|jpg|gif|class|js|py|xml|html|css|dart/;
    const extname = type.test(path.extname(file.originalname).toLowerCase());
    const mimeType = type.test(file.mimetype);

    cp(null, true);
}

module.exports.uploadFile = (async (req, res, next) => {


    upload(req, res, async (err) => {
            if (err) {
                sendJsonResponse(res, {"message": err}, 200);

            } else {

                let full_file_path = req.file.filename.toString();

                const options = {
                    path: `./public/uploads/${full_file_path}`,                      // Required. The path to walk or file to read.
                    extensions: ['java', 'js', 'html', 'css', 'dart'],   // Additional file extensions to look for. Required if ignoreDefault is set to true.
                    ignorePaths: ['node_modules'],       // A list of directories to ignore.
                    ignoreDefault: false,                // Whether to ignore the default file extensions or not
                    logger: console.log,                 // Optional. Outputs extra information to if specified.
                }


                //now let process it using sloc keep the result
                fs.readFile(`./public/uploads/${full_file_path}`, "utf8", async function (err, code) {

                    if (err) {
                        console.error(err);
                    } else {
                        var stats = sloc(code, "coffee");
                        let response = []
                        for (i in sloc.keys) {
                            var k = sloc.keys[i];
                            console.log(k + " : " + stats[k]);
                            if (k !== "comment")
                                response.push(
                                    {
                                        "metric": k,
                                        "value": stats[k]
                                    }
                                )
                        }


                        node_sloc(options).then(async (data) => {
                            console.log(data.paths, data.sloc.sloc, data.sloc.comments)

                            response.push(
                                {
                                    "metric": "Comments",
                                    "value": data.sloc.comments
                                }
                            )

                            let file_extension = path.extname(`./public/uploads/${full_file_path}`)
                            await deleteFile(full_file_path);

                            sendJsonResponse(res, {
                                "data": response,
                                "mata_data": getFileType(file_extension)
                            }, 200);

                        }).catch(err => {
                            console.log(err)
                            sendJsonResponse(res, {
                                "data": [],
                                "mata_data": "err"
                            }, 200);

                        })


                    }
                });
            }
        }
    );

});
module.exports.showIcon = (req, res) => {
    res.status(200);
    res.sendfile('./public/icons/' + req.params.file_name);
};


function deleteFile(doc_name) {


    const root = __dirname.replace('\\controllers', '');

    let path = `${root}\\public\\uploads\\${doc_name}`;


    return new Promise(async (resolve, reject) => {
        try {

            if (fs.existsSync(path)) {
                fs.unlinkSync(path);

                resolve({"done": true});
            } else {
                resolve({"done": false, "message": "file not found"});

            }
        } catch (e) {
            reject({"done": false, "message": e.message});

        }
    });


}

function getFileType(extension) {
    let end_point = "https://sloc-app.herokuapp.com/api/sloc/showIcon/";
    switch (extension) {
        case ".js":
            return {
                "icon_path": end_point + "icons8-javascript-480.png",
                "lng_name": "Java Script"
            };
        case  ".java" :
            return {
                "icon_path": end_point + "icons8-java-480.png",
                "lng_name": "Java"
            };

        case  ".py" :
            return {
                "icon_path": end_point + "icons8-python-480.png",
                "lng_name": "Python"
            };

        case  ".css" :
            return {
                "icon_path": end_point + "icons8-css3-480.png",
                "lng_name": "Css"
            };

        case  ".html" :
            return {
                "icon_path": end_point + "icons8-html-5-480.png",
                "lng_name": "Html"
            };

        case  ".dart" :
            return {
                "icon_path": end_point + "icons8-flutter-48.png",
                "lng_name": "Dart"
            };

    }

}

function sendJsonResponse(res, data, status) {
    res.status(status);
    res.send(data);
}
