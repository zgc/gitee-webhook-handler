var http = require('http')
var createHandler = require('gitee-webhook-handler')
var handler = createHandler({path: '/webhooks', secret: 'blog'})

function run_cmd(cmd, args, callback) {
    var spawn = require('child_process').spawn;
    var child = spawn(cmd, args);
    var resp;
    child.stdout.on('data', function (buffer) {
        resp += buffer.toString();
    });
    child.stdout.on('end', function () {
        callback(resp)
    });
}

handler.on('error', function (err) {
    console.error('Error:', err.message)
})

handler.on('push', function (event) {
    console.log('Received a push event for %s to %s',
        event.payload.repository.name,
        event.payload.ref);
    run_cmd('sh', ['./deploy.sh'], function (text) {
        console.log(text)
    });
})

try {
    http.createServer(function (req, res) {
        handler(req, res, function (err) {
            res.statusCode = 404
            res.end('no such location')
        })
    }).listen(7777)
} catch (err) {
    console.error('Error:', err.message)
}
