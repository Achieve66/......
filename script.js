let audioCtx;
let userIP = "210.5.192.1"; 
let t = 0; // Bytebeat 時間變量

// 獲取 IP
fetch('https://api.ipify.org?format=json')
    .then(res => res.json())
    .then(data => userIP = data.ip)
    .catch(() => {});

const targetName = "리명훈";
const introText = `야… ${targetName} 맞지? 우리 공화국의 기사를 엿보고 남조선으로 도망치려 하다니… 너같은 반동분자는 쓰레기장으로 가야지! 무인도에서 너의 비명소리를 들을 사람은 아무도 없다.`;

const questions = [
    "네놈은 지금 평양에서 살고있느냐?",
    "우리 공화국의 영도를 거부하느냐?",
    "남조선 괴뢰들의 선동에 귀를 기울였느냐?",
    "보위부의 감시를 피할 수 있다고 생각하느냐?",
    "네놈의 위치가 [IP]라는것을 부인하겠느냐?",
    "공화국의 기밀을 어디에 숨겼느냐?",
    "탈북을 모의한 동무들의 이름을 대라.",
    "네놈은 살아남을 자격이 있다고 생각하느냐?",
    "마지막으로 조국 앞에 참회할 기회를 주랴?",
    "이제 처벌을 받아들일 준비가 되었느냐?"
];

let i = 0;
let currentQ = 0;

// 【Bytebeat 核心】實施 8kHz: (t * Math.random())
function startBytebeat() {
    // 強制設定採樣率為 8000Hz 以符合 Bytebeat 特色
    audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 8000 });
    
    const bufferSize = 4096;
    const scriptNode = audioCtx.createScriptProcessor(bufferSize, 1, 1);
    
    scriptNode.onaudioprocess = function(e) {
        const output = e.outputBuffer.getChannelData(0);
        for (let j = 0; j < bufferSize; j++) {
            // 公式: (t * Math.random()) 
            // & 255 將其限制在 8-bit 範圍，然後轉換回音頻振幅
            let byte = (t * Math.random()) & 255;
            output[j] = (byte / 127.5) - 1.0; 
            t++;
        }
    };

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.12; // 刺耳但不會震壞硬體的音量

    scriptNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
}

// 突發性高頻 Glitch (4500Hz 鋸齒波) - 用於點擊回饋
function playGlitch() {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(4500 + Math.random() * 500, audioCtx.currentTime);
    g.gain.setValueAtTime(0.1, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.connect(g);
    g.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

function startSession() {
    document.getElementById('overlay').style.display = 'none';
    
    // 啟動 Bytebeat 背景底噪
    startBytebeat();
    
    typeIntro();
}

function typeIntro() {
    if (i < introText.length) {
        document.getElementById("typewriter").innerHTML += introText.charAt(i);
        i++;
        setTimeout(typeIntro, 70 + Math.random() * 80);
    } else {
        // 10秒絕望停留
        setTimeout(() => {
            document.getElementById("typewriter").innerHTML = "";
            showQuestion();
        }, 10000);
    }
}

function showQuestion() {
    if (currentQ < questions.length) {
        playGlitch(); // 每一題切換時爆發尖銳聲
        let qText = questions[currentQ].replace("[IP]", userIP);
        document.getElementById("question-text").innerText = qText;
        document.getElementById("qa-box").style.display = "block";
    } else {
        document.getElementById("qa-box").style.display = "none";
        showFinal();
    }
}

function nextStep() {
    currentQ++;
    document.getElementById("qa-box").style.display = "none";
    setTimeout(showQuestion, 400 + Math.random() * 1000);
}

function showFinal() {
    const terminal = document.getElementById("typewriter");
    const finalMsg = "반동분자놈... 이런 인간쓰레기에게는 자비란 필요없다.";
    let charIdx = 0;

    function typeFinal() {
        if (charIdx < finalMsg.length) {
            terminal.innerHTML += finalMsg.charAt(charIdx);
            charIdx++;
            setTimeout(typeFinal, 150);
        } else {
            setTimeout(() => {
                // 處決聲：瞬間白噪音爆炸
                const noise = audioCtx.createBufferSource();
                const b = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.5, audioCtx.sampleRate);
                const d = b.getChannelData(0);
                for (let k = 0; k < d.length; k++) d[k] = Math.random() * 2 - 1;
                noise.buffer = b;
                noise.connect(audioCtx.destination);
                noise.start();
                
                terminal.innerHTML = "";
                setTimeout(() => { window.location.href = "https://achieve66.github.io/DISABLED/"; }, 4000);
            }, 3000);
        }
    }
    typeFinal();
}

// 視覺噪音 (Canvas) - 稍微調暗一點增加陰森感
setInterval(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const id = ctx.createImageData(64, 64);
    for (let k = 0; k < id.data.length; k += 4) {
        const v = Math.random() * 180; // 降低亮度
        id.data[k] = id.data[k+1] = id.data[k+2] = v;
        id.data[k+3] = 45;
    }
    ctx.putImageData(id, 0, 0);
    const container = document.querySelector('.noise-container');
    if(container) container.style.backgroundImage = `url(${canvas.toDataURL()})`;
}, 80);