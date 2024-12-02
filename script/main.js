(function (window) {
  window.requestAnimationFrame =
    window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;

  const FRAME_RATE = 50;
  const PARTICLE_NUM = 4000;
  const RADIUS = Math.PI * 2;
  const CANVASWIDTH = window.innerWidth;
  const CANVASHEIGHT = 450;
  const CANVASID = "canvas";

  let texts = [
    "TAP DIMANA AJA YA SENGG",
    "HEY CANTIKK",
    "MAAF YAA",
    "AKU MALESS NULISS",
    "JADI AKU BIKIN INI AJA",
    "NYONTEK SIHH HEHE",
    "TAPI INTINYA",
    "THIS IS YOUR DAYY",
    "CIEE NAMBAHH SETAHUN",
    "SEMANGAT BUAT BEM NYA",
    "AKU HARAP",
    "KAMU BISA MENJADI\nLEBIH BERANI",
    "AKU SELALU\n SUPPORT KAMU",
    "AYO SEMANGAT",
    "KAMU PASTI BISA",
    "KALAU WISH NYA KURANGG ",
    "KAMU BISA BIKIN SENDIRI HEHE",
    "DARI AKU CUMANN ITUU",
    "YAUDAHH DEHH",
    "I",
    "LOVE",
    "YOU ♡",
    "SEKALI LAGII",
    "HAPPY BIRTHDAY YAA",
    "BYEE LOVV",
  ];

  let canvas,
    ctx,
    particles = [],
    quiver = true,
    text = texts[0],
    textIndex = 0,
    textSize = 65;

  function draw() {
    ctx.clearRect(0, 0, CANVASWIDTH, CANVASHEIGHT);
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.textBaseline = "middle";
    ctx.fontWeight = 900;
    ctx.font = textSize + "px 'Arial', 'Helvetica Neue', 'sans-serif'";

    // Pisahkan teks berdasarkan karakter '\n'
    let lines = text.split("\n");
    let lineHeight = textSize + 10; // Spasi antar baris
    let startY = (CANVASHEIGHT - lineHeight * lines.length) * 0.1; // Tengah vertikal

    // Gambar setiap baris teks
    lines.forEach((line, index) => {
      ctx.fillText(
        line,
        (CANVASWIDTH - ctx.measureText(line).width) * 0.5,
        startY + index * lineHeight
      );
    });

    let imgData = ctx.getImageData(0, 0, CANVASWIDTH, CANVASHEIGHT);
    ctx.clearRect(0, 0, CANVASWIDTH, CANVASHEIGHT);

    for (let i = 0, l = particles.length; i < l; i++) {
      let p = particles[i];
      p.inText = false;
    }
    particleText(imgData);

    window.requestAnimationFrame(draw);
  }

  function particleText(imgData) {
    var pxls = [];
    for (var w = CANVASWIDTH; w > 0; w -= 3) {
      for (var h = 0; h < CANVASHEIGHT; h += 3) {
        var index = (w + h * CANVASWIDTH) * 4;
        if (imgData.data[index] > 1) {
          pxls.push([w, h]);
        }
      }
    }

    var count = pxls.length;
    var j = parseInt((particles.length - pxls.length) / 2, 10);
    j = j < 0 ? 0 : j;

    for (var i = 0; i < pxls.length && j < particles.length; i++, j++) {
      try {
        var p = particles[j],
          X,
          Y;

        if (quiver) {
          X = pxls[i - 1][0] - (p.px + Math.random() * 10);
          Y = pxls[i - 1][1] - (p.py + Math.random() * 10);
        } else {
          X = pxls[i - 1][0] - p.px;
          Y = pxls[i - 1][1] - p.py;
        }
        var T = Math.sqrt(X * X + Y * Y);
        var A = Math.atan2(Y, X);
        var C = Math.cos(A);
        var S = Math.sin(A);
        p.x = p.px + C * T * p.delta;
        p.y = p.py + S * T * p.delta;
        p.px = p.x;
        p.py = p.y;
        p.inText = true;
        p.fadeIn();
        p.draw(ctx);
      } catch (e) {}
    }
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      if (!p.inText) {
        p.fadeOut();

        var X = p.mx - p.px;
        var Y = p.my - p.py;
        var T = Math.sqrt(X * X + Y * Y);
        var A = Math.atan2(Y, X);
        var C = Math.cos(A);
        var S = Math.sin(A);

        p.x = p.px + (C * T * p.delta) / 2;
        p.y = p.py + (S * T * p.delta) / 2;
        p.px = p.x;
        p.py = p.y;

        p.draw(ctx);
      }
    }
  }

  function setDimensions() {
    canvas.width = CANVASWIDTH;
    canvas.height = CANVASHEIGHT;
    canvas.style.position = "absolute";
    canvas.style.left = "50%";
    canvas.style.top = "50%";
    canvas.style.transform = "translate(-50%, -50%)";
  }

  function event() {
    let isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
      // Perangkat sentuh: hanya gunakan `touchstart`
      document.addEventListener(
        "touchstart",
        function (e) {
          e.preventDefault(); // Hindari konflik dengan klik
          handleTextChange();
        },
        { passive: false }
      );
    }

    // Tambahkan `click` untuk semua perangkat, termasuk non-sentuh
    document.addEventListener("click", function (e) {
      // Abaikan klik jika sudah menggunakan touchstart di perangkat sentuh
      if (isTouchDevice) return;
      handleTextChange();
    });
  }

  function handleTextChange() {
    textIndex++;
    if (textIndex >= texts.length) {
      textIndex--;
      return;
    }
    text = texts[textIndex];
    console.log(textIndex);
  }

  function init() {
    canvas = document.getElementById(CANVASID);
    if (canvas === null || !canvas.getContext) {
      return;
    }
    ctx = canvas.getContext("2d");
    setDimensions();
    event();

    for (var i = 0; i < PARTICLE_NUM; i++) {
      particles[i] = new Particle(canvas);
    }

    draw();
  }

  class Particle {
    constructor(canvas) {
      let spread = canvas.height;
      let size = Math.random() * 2.1;

      this.delta = 0.06;

      this.x = 0;
      this.y = 0;

      this.px = Math.random() * canvas.width;
      this.py = canvas.height * 0.5 + (Math.random() - 0.5) * spread;

      this.mx = this.px;
      this.my = this.py;

      this.size = size;

      this.inText = false;

      this.opacity = 0;
      this.fadeInRate = 0.005;
      this.fadeOutRate = 0.03;
      this.opacityTresh = 0.98;
      this.fadingOut = true;
      this.fadingIn = true;
    }
    fadeIn() {
      this.fadingIn = this.opacity > this.opacityTresh ? false : true;
      if (this.fadingIn) {
        this.opacity += this.fadeInRate;
      } else {
        this.opacity = 1;
      }
    }
    fadeOut() {
      this.fadingOut = this.opacity < 0 ? false : true;
      if (this.fadingOut) {
        this.opacity -= this.fadeOutRate;
        if (this.opacity < 0) {
          this.opacity = 0;
        }
      } else {
        this.opacity = 0;
      }
    }
    draw(ctx) {
      ctx.fillStyle = "rgba(255,255,255, " + this.opacity + ")";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, RADIUS, true);
      ctx.closePath();
      ctx.fill();
    }
  }

  // setTimeout(() => {
  init();
  // }, 4000);
})(window);
