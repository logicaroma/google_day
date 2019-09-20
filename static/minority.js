const videoWidth = 600;
const videoHeight = 500;

const color = 'aqua';
const boundingBoxColor = 'red';
const lineWidth = 2;

function toTuple({ y, x }) {
    return [y, x];
}

/**
 * Draws a line on a canvas, i.e. a joint
 */
function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
    ctx.beginPath();
    ctx.moveTo(ax * scale, ay * scale);
    ctx.lineTo(bx * scale, by * scale);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.stroke();
}

/**
 * Draws a pose skeleton by looking up all adjacent keypoints/joints
 */
function drawSkeleton(keypoints, minConfidence, ctx, scale = 1) {
    const adjacentKeyPoints =
        posenet.getAdjacentKeyPoints(keypoints, minConfidence);

    adjacentKeyPoints.forEach((keypoints) => {
        drawSegment(
            toTuple(keypoints[0].position), toTuple(keypoints[1].position), color,
            scale, ctx);
    });
}

/**
 * Draw pose keypoints onto a canvas
 */
function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
    for (let i = 0; i < keypoints.length; i++) {
        const keypoint = keypoints[i];

        if (keypoint.score < minConfidence) {
            continue;
        }

        const { y, x } = keypoint.position;
        drawPoint(ctx, y * scale, x * scale, 3, color);
    }
}

function drawPoint(ctx, y, x, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

/**
 * Draw the bounding box of a pose. For example, for a whole person standing
 * in an image, the bounding box will begin at the nose and extend to one of
 * ankles
 */
function drawBoundingBox(keypoints, ctx) {
    const boundingBox = posenet.getBoundingBox(keypoints);

    ctx.rect(
        boundingBox.minX, boundingBox.minY, boundingBox.maxX - boundingBox.minX,
        boundingBox.maxY - boundingBox.minY);

    ctx.strokeStyle = boundingBoxColor;
    ctx.stroke();
}

/**
 * Loads a the camera to be used in the demo
 *
 */
async function setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
            'Browser API navigator.mediaDevices.getUserMedia not available');
    }

    const video = document.getElementById('video');
    video.width = videoWidth;
    video.height = videoHeight;

    const stream = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': {
            facingMode: 'user',
            width: videoWidth,
            height: videoHeight,
        },
    });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

async function loadVideo() {
    const video = await setupCamera();
    video.play();

    return video;
}

function detectPoseInRealTime(video, net) {
    const canvas = document.getElementById('output');
    const ctx = canvas.getContext('2d');

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    async function poseDetectionFrame() {
        let poses = [];
        let minPoseConfidence;
        let minPartConfidence;

        const pose = await net.estimatePoses(video, {
            // flipHorizontal: false,
            decodingMethod: 'single-person'
        });
        poses = poses.concat(pose);
        minPoseConfidence = 0.7;
        minPartConfidence = 0.5;


        ctx.clearRect(0, 0, videoWidth, videoHeight);

        ctx.save();
        ctx.scale(-1, 1);
        ctx.translate(-videoWidth, 0);

        ctx.restore();

        poses.forEach(({ score, keypoints }) => {
            drawKeypoints(keypoints, minPartConfidence, ctx);
            drawSkeleton(keypoints, minPartConfidence, ctx);
            drawBoundingBox(keypoints, ctx);
        });

        requestAnimationFrame(poseDetectionFrame);
    }

    poseDetectionFrame();
}


var Rhythms = function() {
    loadSounds(this, {
        kick: 'kick.wav',
        snare: 'snare.wav',
        hihat: 'hihat.wav'
    });
};

Rhythms.prototype.play = function(sound) {
    // We'll start playing the rhythm 100 milliseconds from "now"
    var startTime = context.currentTime + 0.100;
    var tempo = 80; // BPM (beats per minute)
    var eighthNoteTime = (60 / tempo) / 2;
    var time = startTime + bar * 8 * eighthNoteTime;
    switch (sound) {
        case 'kick':
            playSound(this.kick, time);

            break;
        case 'snare':
            playSound(this.snare, time);

            break;
        case 'hihat':
            playSound(this.hihat, time);

            break;

        default:
            break;
    }
    // // Play 2 bars of the following:
    // for (var bar = 0; bar < 2; bar++) {
    //     var time = startTime + bar * 8 * eighthNoteTime;
    //     // Play the bass (kick) drum on beats 1, 5
    //     playSound(this.kick, time);
    //     playSound(this.kick, time + 4 * eighthNoteTime);

    //     // Play the snare drum on beats 3, 7
    //     playSound(this.snare, time + 2 * eighthNoteTime);
    //     playSound(this.snare, time + 6 * eighthNoteTime);

    //     // Play the hi-hat every eighthh note.
    //     for (var i = 0; i < 8; ++i) {
    //         playSound(this.hihat, time + i * eighthNoteTime);
    //     }
    // }
};

async function start() {
    const net = await posenet
        // .load({
        //   architecture: 'MobileNetV1',
        //   outputStride: 16,
        //   inputResolution: 513,
        //   multiplier: 0.75
        // });
        .load({
            architecture: 'ResNet50',
            outputStride: 32,
            inputResolution: 257,
            quantBytes: 2
        });

    let video;

    try {
        video = await loadVideo();
    } catch (e) {
        alert('this browser does not support video capture, or this device does not have a camera');
    }

    $('#loader').removeClass('active')

    detectPoseInRealTime(video, net);
}

navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

start();