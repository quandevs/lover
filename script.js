/**
 * Do You Love Me? - Interactive Experience
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const displayGif = document.getElementById('displayGif');
  const mainTitle = document.getElementById('mainTitle');
  const subMessage = document.getElementById('subMessage');
  const btnYes = document.getElementById('btnYes');
  const btnNo = document.getElementById('btnNo');
  const noBtnText = document.getElementById('noBtnText');
  const actionsArea = document.getElementById('actionsArea');
  const celebrationDetails = document.getElementById('celebrationDetails');
  const btnReplay = document.getElementById('btnReplay');
  const soundToggle = document.getElementById('soundToggle');
  const soundIcon = document.getElementById('soundIcon');
  const ambientHeartsContainer = document.getElementById('ambientHearts');
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');

  // Preload celebration GIF
  const celebrationGifSrc = 'I Love You Luv GIF.gif';
  const initialGifSrc = 'gif.gif';
  const preloadImg = new Image();
  preloadImg.src = celebrationGifSrc;

  // Sound state
  let soundEnabled = true;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Play charming synthesized love chime
  function playSweetChime() {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
      const now = audioCtx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.65);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Play funny dodge whoosh/pop sound
  function playWhooshSound() {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {
      // Ignore audio errors
    }
  }

  // Sound toggle button
  soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
  });

  // ---------------- No Button Evasive Logic ---------------- //
  const playfulTaunts = [
    'No',
    'Are you sure? 🥺',
    'Think again! 💕',
    'You can\'t catch me! 🏃💨',
    'Wrong button! 😜',
    'Try Yes instead! 💖',
    'Don\'t break my heart! 💔',
    'Still No?! 😭',
    'Nice try! 🌸',
    'I dare you! 🙈'
  ];

  let dodgeCount = 0;
  let isNoBtnDetached = false;

  function moveNoButtonAway(event) {
    playWhooshSound();

    // Change text playfully
    dodgeCount++;
    const textIndex = dodgeCount % playfulTaunts.length;
    noBtnText.textContent = playfulTaunts[textIndex];

    const padding = 20;
    const btnRect = btnNo.getBoundingClientRect();
    const yesRect = btnYes.getBoundingClientRect();

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const btnWidth = btnRect.width || 120;
    const btnHeight = btnRect.height || 48;

    // Available bounds
    const minX = padding;
    const maxX = Math.max(padding, screenWidth - btnWidth - padding);
    const minY = padding;
    const maxY = Math.max(padding, screenHeight - btnHeight - padding);

    let newX, newY;
    let safe = false;
    let attempts = 0;

    // Pointer coordinates (if triggered by mouse or touch)
    const pointerX = event ? (event.clientX || (event.touches && event.touches[0] ? event.touches[0].clientX : null)) : null;
    const pointerY = event ? (event.clientY || (event.touches && event.touches[0] ? event.touches[0].clientY : null)) : null;

    while (!safe && attempts < 25) {
      attempts++;
      newX = minX + Math.random() * (maxX - minX);
      newY = minY + Math.random() * (maxY - minY);

      // Check distance from Yes button to avoid overlapping
      const distToYes = Math.hypot(
        (newX + btnWidth / 2) - (yesRect.left + yesRect.width / 2),
        (newY + btnHeight / 2) - (yesRect.top + yesRect.height / 2)
      );

      // Check distance from current pointer
      let distToPointer = 999;
      if (pointerX !== null && pointerY !== null) {
        distToPointer = Math.hypot(
          (newX + btnWidth / 2) - pointerX,
          (newY + btnHeight / 2) - pointerY
        );
      }

      if (distToYes > 140 && distToPointer > 120) {
        safe = true;
      }
    }

    if (!isNoBtnDetached) {
      btnNo.classList.add('running');
      document.body.appendChild(btnNo);
      isNoBtnDetached = true;
    }

    const randomRotation = (Math.random() * 24 - 12).toFixed(1);
    btnNo.style.left = `${Math.round(newX)}px`;
    btnNo.style.top = `${Math.round(newY)}px`;
    btnNo.style.transform = `rotate(${randomRotation}deg) scale(1.05)`;

    setTimeout(() => {
      btnNo.style.transform = `rotate(${randomRotation}deg) scale(1)`;
    }, 150);
  }

  // Proximity detection: when cursor gets close to the No button, it runs!
  document.addEventListener('mousemove', (e) => {
    if (isCelebrated) return;
    const btnRect = btnNo.getBoundingClientRect();
    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;
    const dist = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);

    // Escape trigger radius
    if (dist < 80) {
      moveNoButtonAway(e);
    }
  });

  // Events for No button
  btnNo.addEventListener('mouseenter', moveNoButtonAway);
  btnNo.addEventListener('mouseover', moveNoButtonAway);
  btnNo.addEventListener('touchstart', (e) => {
    e.preventDefault();
    moveNoButtonAway(e);
  }, { passive: false });
  btnNo.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    moveNoButtonAway(e);
  });
  btnNo.addEventListener('click', (e) => {
    e.preventDefault();
    moveNoButtonAway(e);
  });

  // ---------------- Celebration (Yes Clicked) ---------------- //
  let isCelebrated = false;

  btnYes.addEventListener('click', () => {
    if (isCelebrated) return;
    isCelebrated = true;

    playSweetChime();

    // 1. Swap GIF with pop-in animation
    displayGif.classList.remove('pop-in');
    void displayGif.offsetWidth; // trigger reflow
    displayGif.src = celebrationGifSrc;
    displayGif.classList.add('pop-in');

    // 2. Change text
    mainTitle.textContent = 'I love you too ❤️';
    mainTitle.classList.add('celebrating');
    subMessage.textContent = 'I knew you would say yes! 🥰💖';
    subMessage.style.color = '#e0285a';

    // 3. Hide No button & Yes button
    btnNo.style.display = 'none';
    btnYes.style.display = 'none';

    // 4. Reveal celebration details
    celebrationDetails.classList.remove('hidden');

    // 5. Trigger heart and confetti explosion
    triggerConfettiExplosion();
  });

  // Replay action
  btnReplay.addEventListener('click', () => {
    isCelebrated = false;
    dodgeCount = 0;
    noBtnText.textContent = 'No';

    // Reset gif
    displayGif.classList.remove('pop-in');
    void displayGif.offsetWidth;
    displayGif.src = initialGifSrc;
    displayGif.classList.add('pop-in');

    // Reset texts
    mainTitle.textContent = 'Do you love me?';
    mainTitle.classList.remove('celebrating');
    subMessage.textContent = 'Please answer honestly... 🥺';
    subMessage.style.color = '';

    // Reset celebration details
    celebrationDetails.classList.add('hidden');

    // Restore buttons
    btnYes.style.display = '';
    btnNo.style.display = '';
    btnNo.classList.remove('running');
    btnNo.style.left = '';
    btnNo.style.top = '';
    btnNo.style.transform = '';

    // Put No button back in actionsArea
    if (isNoBtnDetached) {
      actionsArea.appendChild(btnNo);
      isNoBtnDetached = false;
    }
  });

  // ---------------- Confetti & Hearts Canvas Animation ---------------- //
  let particles = [];
  let animationFrameId = null;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const colors = ['#ff4d79', '#ff708f', '#ff85a1', '#ffadc1', '#ffd166', '#ff6b6b', '#ff9aa2', '#ffffff'];

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 4;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed - 3;
      this.gravity = 0.18;
      this.friction = 0.96;
      this.size = Math.random() * 12 + 8;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.2;
      this.opacity = 1;
      this.decay = Math.random() * 0.012 + 0.008;
      this.isHeart = Math.random() > 0.45;
    }

    update() {
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotationSpeed;
      this.opacity -= this.decay;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = Math.max(0, this.opacity);

      if (this.isHeart) {
        // Draw heart shape
        ctx.fillStyle = this.color;
        const s = this.size * 0.5;
        ctx.beginPath();
        ctx.moveTo(0, s * 0.3);
        ctx.bezierCurveTo(-s, -s * 0.6, -s * 1.3, s * 0.3, 0, s * 1.3);
        ctx.bezierCurveTo(s * 1.3, s * 0.3, s, -s * 0.6, 0, s * 0.3);
        ctx.fill();
      } else {
        // Draw colorful sparkle circle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function triggerConfettiExplosion() {
    const originX = window.innerWidth / 2;
    const originY = window.innerHeight * 0.45;

    for (let i = 0; i < 120; i++) {
      particles.push(new Particle(originX, originY));
    }

    // Secondary burst left and right
    setTimeout(() => {
      for (let i = 0; i < 60; i++) {
        particles.push(new Particle(window.innerWidth * 0.3, window.innerHeight * 0.4));
        particles.push(new Particle(window.innerWidth * 0.7, window.innerHeight * 0.4));
      }
    }, 280);

    if (!animationFrameId) {
      renderConfetti();
    }
  }

  function renderConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw(ctx);

      if (p.opacity <= 0) {
        particles.splice(i, 1);
      }
    }

    if (particles.length > 0) {
      animationFrameId = requestAnimationFrame(renderConfetti);
    } else {
      animationFrameId = null;
    }
  }

  // ---------------- Ambient Background Floating Hearts ---------------- //
  const heartIcons = ['💖', '💕', '💗', '💓', '✨', '🌸', '💝'];

  function createAmbientHeart() {
    if (document.hidden) return;
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = heartIcons[Math.floor(Math.random() * heartIcons.length)];

    const startX = Math.random() * 100;
    const duration = Math.random() * 6 + 6; // 6s - 12s
    const size = Math.random() * 1.2 + 0.8; // 0.8rem - 2rem

    heart.style.left = `${startX}%`;
    heart.style.animationDuration = `${duration}s`;
    heart.style.fontSize = `${size}rem`;

    ambientHeartsContainer.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, duration * 1000);
  }

  // Initial batch of ambient hearts
  for (let i = 0; i < 10; i++) {
    setTimeout(createAmbientHeart, i * 400);
  }
  // Continually spawn ambient hearts
  setInterval(createAmbientHeart, 1200);
});
