// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://8mSqIM8cMBU.iot-as-mqtt.cn-shanghai.aliyuncs.com', {
    clientId: 'Y001|securemode=3,signmethod=hmacsha1,timestamp=132323232|',
    username: 'Y001&8mSqIM8cMBU',
    password: '3FB70E2520ADB55F1800E93821D12B4B843F5A4F'
})
console.log('connected: ', client.connected)
client.on('connect', function () {
    client.subscribe('/shadow/get/8mSqIM8cMBU/Y001')
    sendShadow({
        "method": "get"
    });
})

client.on('message', function (topic, message) {
    console.log(message.toString())
    var data = JSON.parse(message.toString());
    switch (data.method) {
        case 'reply':
            if (data.payload.status == "success") {
                let state = data.payload.state;
                if (state) {
                    let reported = state.reported;
                    let desired = state.desired;
                    let version = data.version;
                    let nver1 = version + 10;
                    let nver2 = nver1 + 10;
                    Object.assign(reported, desired);
                    operLamp(reported);
                    if (desired) {
                        sendShadow({
                            "method": "update",
                            "state": {
                                "reported": desired//,
                                //"desired": "null"
                            },
                            "version": nver1
                        }, function () {
                            setTimeout(function () {
                                sendShadow({
                                    "method": "update",
                                    "state": {
                                        "desired": "null"
                                    },
                                    "version": nver2
                                });
                            }, 500);

                        });
                    }
                } else {
                    console.log('返回请求的结果')
                }
            }
            break;
        case 'control':
            let state = data.payload.state;
            if (state) {
                let reported = state.reported;
                let desired = state.desired;
                let version = data.version;
                let nver1 = version + 10;
                let nver2 = nver1 + 10;
                Object.assign(reported, desired);
                operLamp(reported);
                if (desired) {
                    sendShadow({
                        "method": "update",
                        "state": {
                            "reported": desired//,
                            // "desired": "null"
                        },
                        "version": nver1
                    }, function () {
                        setTimeout(function () {
                            sendShadow({
                                "method": "update",
                                "state": {
                                    "desired": "null"
                                },
                                "version": nver2
                            });
                        }, 500);
                    });
                }
            }
            break;
    }
})

var operLamp = function (obj) {
    if (obj.open) {
        open();
    } else {
        close();
    }
    if (obj.color) {
        setColor(obj.color);
    }
}

var $lamp = document.querySelector('.lamp-light');
var $open = document.querySelector("#open");
var $color = document.querySelector("#color");
var open = function () {
    $lamp.className = "lamp-light open";
    $open.checked = true;
}
var close = function () {
    $lamp.className = "lamp-light close";
    $open.checked = false;
}
var setColor = function (color) {
    $lamp.style.backgroundColor = color;
    $color.value = color;
}

$open.addEventListener('change', function (ev) {
    console.log('change', $open.checked);
    $open.checked ? open() : close();
    sendShadow({
        "method": "update",
        "state": {
            "reported": { open: $open.checked }
        },
        "version": Date.now()
    })
});
$color.addEventListener('change', function (ev) {
    console.log('change', $color.value);
    setColor($color.value);
    sendShadow({
        "method": "update",
        "state": {
            "reported": { color: $color.value }
        },
        "version": Date.now()
    })
});

var sendShadow = function (data, cb) {
    console.log("SEND", data);
    if (client.connected) {
        client.publish('/shadow/update/8mSqIM8cMBU/Y001', JSON.stringify(data
        ), cb)
    }
}



console.log(process)
process.on('exit', function () {
    client.end();
})
window.onbeforeunload = function () {
    client.end();
}