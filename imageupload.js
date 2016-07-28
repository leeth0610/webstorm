const formidable = require('formidable');
const randomString = require('randomstring');
const pathutil = require('path');
const AWS = require('aws-sdk');

AWS.config.region = 'ap-northeast-2';
AWS.config.accessKeyId = 'AKIAJQUEKAV4BVTB5A3Q';
AWS.config.secretAccessKey = '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';

const s3 = new AWS.S3();

const instance = function (req, res) {
        try {
                getFile(req).then(toS3, console.err).then(res.send, console.err);
        } catch (err) {
                console.log(err);
        }
};

const uploadDir = __dirname + '/upload';

function getFile(req) {
        return new Promise((resolve, reject) => {
                console.log('1');
                const form = new formidable.IncomingForm();
                form.encoding = 'utf-8';
                form.uploadDir = uploadDir;
                form.keepExtensions = true;
                form.parse(req, (err, fields, files) => {
                        console.log('2');
                        if (err) {
                                console.log(err);
                                reject(err);
                                return;
                        }

                        const file = files.image;

                        console.log('3');
                        resolve(
                                {
                                        image: file
                                }
                        );
                        return;
                });
        });
}

function toS3(result) {
        return new Promise((resolve, reject) => {
                const random = randomString.generate(10);
                const newFileName = 'image_' + random;
                const extname = pathutil.extname(result.image.name);
                const path = result.image.path;
                const contentType = result.image.type;

                const readStream = fs.createReadStream(path);
                const key = 'public/' + newFileName + extname;
                const param = {
                        Bucket: 'leeth0610',
                        Key: key,
                        ACL: 'public_read',
                        Body: readStream,
                        ContentType: contentType
                };

                s3.putObject(param, (err, data) => {
                        console.log('6');
                        if (err) {
                                console.log(err);
                                reject(err);
                                return;
                        }

                        const imageUrl = s3.getSignedUrl('getObject', {Bucket: param.Bucket, Key: param.key});

                        console.log('7');
                        resolve({
                                imageUrl: imageUrl
                        });
                        return;
                });
        });
}

module.exports = instance;